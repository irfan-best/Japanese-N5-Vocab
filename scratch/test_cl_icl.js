// Automated Test Suite for CL (Copy Lesson) and ICL (Import / Update Current Lesson)
(async () => {
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('🧪 Starting CL & ICL Test Suite...\n');

// Mock DOM
class MockElement {
  constructor(tagName = 'div', id = '') {
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this.className = '';
    this.children = [];
    this.parentElement = null;
    this.style = {};
    this.dataset = {};
    this.textContent = '';
    this.value = '';
    this.checked = false;
    this.options = [];
    this.selectedIndex = 0;
    this._innerHTML = '';
    this.listeners = {};
    this.classList = {
      _classes: new Set(),
      add: (c) => this.classList._classes.add(c),
      remove: (c) => this.classList._classes.delete(c),
      contains: (c) => this.classList._classes.has(c),
      toggle: (c, force) => {
        if (force === undefined) {
          if (this.classList._classes.has(c)) this.classList._classes.delete(c);
          else this.classList._classes.add(c);
        } else if (force) {
          this.classList._classes.add(c);
        } else {
          this.classList._classes.delete(c);
        }
      }
    };
  }

  get innerHTML() { return this._innerHTML; }
  set innerHTML(val) {
    this._innerHTML = val;
    this.textContent = typeof val === 'string' ? val.replace(/<[^>]+>/g, '') : '';
  }

  appendChild(child) {
    child.parentElement = this;
    this.children.push(child);
    if (this.tagName === 'SELECT' && child.tagName === 'OPTION') {
      this.options.push(child);
    }
    return child;
  }

  addEventListener(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  dispatchEvent(event) {
    const fns = this.listeners[event.type] || [];
    fns.forEach(fn => fn(event));
  }

  querySelector(sel) {
    return this.children.find(c => sel.includes(c.id) || sel.includes(c.className)) || new MockElement('div');
  }

  querySelectorAll(sel) {
    return this.children;
  }

  focus() {}
  select() {}
  remove() {}
  setAttribute(k, v) { this[k] = v; }
  getAttribute(k) { return this[k] || null; }
}

class MockDocument {
  constructor() {
    this.body = new MockElement('body');
    this.elements = {};
    this.listeners = {};
  }

  getElementById(id) {
    if (!this.elements[id]) {
      this.elements[id] = new MockElement('div', id);
    }
    return this.elements[id];
  }

  createElement(tag) {
    return new MockElement(tag);
  }

  addEventListener(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  dispatchEvent(event) {
    const fns = this.listeners[event.type] || [];
    fns.forEach(fn => fn(event));
  }

  querySelector(sel) {
    return this.getElementById(sel.replace('#', ''));
  }

  querySelectorAll(sel) {
    return [];
  }
}

// Prepare environment
const doc = new MockDocument();
let lastToast = null;
let lastCopiedText = null;

const sandbox = {
  window: null,
  document: doc,
  addEventListener: (event, fn) => doc.addEventListener(event, fn),
  removeEventListener: () => {},
  localStorage: {
    store: {},
    getItem(k) { return this.store[k] || null; },
    setItem(k, v) { this.store[k] = String(v); },
    removeItem(k) { delete this.store[k]; }
  },
  navigator: {
    clipboard: {
      writeText: (txt) => {
        lastCopiedText = txt;
        return Promise.resolve();
      }
    }
  },
  setTimeout: (fn) => { fn(); return 1; },
  clearTimeout: () => {},
  speechSynthesis: { speak: () => {}, cancel: () => {}, getVoices: () => [] },
  SpeechSynthesisUtterance: function() {},
  console: console,
  showToast: (msg, type) => { lastToast = { msg, type }; }
};
sandbox.window = sandbox;

// Load script in sandbox
let scriptCode = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');
scriptCode = scriptCode.replace(/^let currentSettings\b/m, 'var currentSettings');
scriptCode = scriptCode.replace(/^let currentWordsDb\b/m, 'var currentWordsDb');
scriptCode = scriptCode.replace(/^let currentUltimateWordsDb\b/m, 'var currentUltimateWordsDb');

const ctx = vm.createContext(sandbox);
vm.runInContext(scriptCode, ctx);

ctx.showToast = (msg, type) => { lastToast = { msg, type }; };

// Test 1: serializeCLWord formatting
console.log('Test 1: serializeCLWord outputs exact 4-line block (and 5 lines with tags)');
{
  const wordWithKanji = {
    japanese: 'よる',
    english: 'night',
    romaji: 'yoru',
    kanji: '夜'
  };
  const clText1 = ctx.serializeCLWord(wordWithKanji);
  assert.strictEqual(clText1, 'よる\nnight\nyoru\n夜', 'Line 4 should output kanji when present');

  const wordWithoutKanji = {
    japanese: 'こんばんは',
    english: 'Good evening.',
    romaji: 'konbanwa',
    kanji: ''
  };
  const clText2 = ctx.serializeCLWord(wordWithoutKanji);
  assert.strictEqual(clText2, 'こんばんは\nGood evening.\nkonbanwa\nこんばんは', 'Line 4 should fallback to kana when kanji is empty');

  const wordWithTags = {
    japanese: 'ひるま',
    english: 'daytime',
    romaji: 'Hiruma',
    kanji: '昼間',
    tags: ['time', 'noun']
  };
  const clText3 = ctx.serializeCLWord(wordWithTags);
  assert.strictEqual(clText3, 'ひるま\ndaytime\nHiruma\n昼間\ntime, noun', 'Line 5 should output tags when present');

  console.log('  ✓ serializeCLWord passed all formats');
}

// Test 2: serializeLessonCL with Normal and Hard words
console.log('\nTest 2: serializeLessonCL formats lesson with Normal and Hard sections separated by "--- hard ---"');
{
  const testDb = {
    'Test Lesson': [
      { japanese: 'よる', english: 'night', romaji: 'yoru', kanji: '夜' },
      { japanese: 'ばん', english: 'night, evening', romaji: 'ban', kanji: '晩' }
    ],
    'Test Lesson - Hard': [
      { japanese: 'こんや', english: 'tonight, this evening', romaji: 'konya', kanji: '今夜' },
      { japanese: 'やこうバス', english: 'night bus', romaji: 'Yakou basu', kanji: '夜行バス' }
    ]
  };

  ctx.currentWordsDb = testDb;
  ctx.currentSettings.activeDbGroup = 'N5 Lessons';
  ctx.currentSettings.currentLesson = 'Test Lesson';

  const res = ctx.serializeLessonCL('Test Lesson');
  assert.strictEqual(res.normalCount, 2);
  assert.strictEqual(res.hardCount, 2);

  const expected = 
`よる
night
yoru
夜

ばん
night, evening
ban
晩

--- hard ---

こんや
tonight, this evening
konya
今夜

やこうバス
night bus
Yakou basu
夜行バス
`;

  assert.strictEqual(res.text, expected, 'Full text must match user format specification');
  console.log('  ✓ serializeLessonCL output matches user example exactly');
}

// Test 3: parseICLText dividing Normal and Hard
console.log('\nTest 3: parseICLText correctly parses Normal and Hard blocks divided by "--- hard ---"');
{
  const input = 
`よる
night
yoru
夜

ばん
night, evening
ban
晩

--- hard ---

こんや
tonight, this evening
konya
今夜

やこうバス
night bus
Yakou basu
夜行バス
`;

  const parsed = ctx.parseICLText(input);
  assert.strictEqual(parsed.hasDivider, true);
  assert.strictEqual(parsed.normalWords.length, 2);
  assert.strictEqual(parsed.hardWords.length, 2);

  assert.strictEqual(parsed.normalWords[0].japanese, 'よる');
  assert.strictEqual(parsed.normalWords[0].kanji, '夜');
  assert.strictEqual(parsed.normalWords[1].japanese, 'ばん');
  assert.strictEqual(parsed.normalWords[1].kanji, '晩');

  assert.strictEqual(parsed.hardWords[0].japanese, 'こんや');
  assert.strictEqual(parsed.hardWords[0].kanji, '今夜');
  assert.strictEqual(parsed.hardWords[1].japanese, 'やこうバス');
  assert.strictEqual(parsed.hardWords[1].kanji, '夜行バス');

  // Test without divider
  const noDividerInput = `よる\nnight\nyoru\n夜`;
  const parsedNoDiv = ctx.parseICLText(noDividerInput);
  assert.strictEqual(parsedNoDiv.hasDivider, false);
  assert.strictEqual(parsedNoDiv.normalWords.length, 1);
  assert.strictEqual(parsedNoDiv.hardWords.length, 0);

  console.log('  ✓ parseICLText parses Normal and Hard sections properly');
}

// Test 4: isWordChanged and findChangedWords
console.log('\nTest 4: isWordChanged and findChangedWords detects modifications accurately');
{
  const oldWord = { japanese: 'よる', english: 'night', romaji: 'yoru', kanji: 'よる' };
  const newWord1 = { japanese: 'よる', english: 'night', romaji: 'yoru', kanji: '夜' };
  const newWordUnchanged = { japanese: 'よる', english: 'night', romaji: 'yoru', kanji: 'よる' };

  assert.strictEqual(ctx.isWordChanged(oldWord, newWord1), true, 'Changing kanji from kana to 夜 should report changed');
  assert.strictEqual(ctx.isWordChanged(oldWord, newWordUnchanged), false, 'Identical word should report unchanged');

  const changes = ctx.findChangedWords([oldWord], [newWord1]);
  assert.strictEqual(changes.length, 1);
  assert.strictEqual(changes[0].oldW.kanji, 'よる');
  assert.strictEqual(changes[0].newW.kanji, '夜');

  console.log('  ✓ Word change detection verified');
}

// Test 5: Standard DB submitImportLessonICL updates current lesson
console.log('\nTest 5: submitImportLessonICL updates Normal and Hard words for current lesson in standard DB');
{
  ctx.currentWordsDb = {
    'Lesson 01': [
      { japanese: 'よる', english: 'night', romaji: 'yoru', kanji: 'よる' }
    ],
    'Lesson 01 - Hard': [
      { japanese: 'こんや', english: 'tonight', romaji: 'konya', kanji: 'こんや' }
    ]
  };
  ctx.currentSettings.activeDbGroup = 'N5 Lessons';
  ctx.currentSettings.currentLesson = 'Lesson 01';

  const updatedInput = 
`よる
night
yoru
夜

--- hard ---

こんや
tonight
konya
今夜`;

  doc.getElementById('input-import-lesson-icl').value = updatedInput;
  const success = ctx.submitImportLessonICL();
  assert.strictEqual(success, true);

  assert.strictEqual(ctx.currentWordsDb['Lesson 01'][0].kanji, '夜', 'Lesson 01 normal word kanji must be updated to 夜');
  assert.strictEqual(ctx.currentWordsDb['Lesson 01 - Hard'][0].kanji, '今夜', 'Lesson 01 hard word kanji must be updated to 今夜');

  console.log('  ✓ Standard DB current lesson updated successfully');
}

// Test 6: Crucial Ultimate Mode propagation across multiple categories
console.log('\nTest 6: Crucial Ultimate Mode - updates current lesson AND propagates modified words across all other categories in Ultimate');
{
  // Setup Ultimate DB with the same word occurring in multiple categories:
  // Lesson 01 (current), Time Words (normal), Daily Vocab (hard)
  ctx.currentUltimateWordsDb = {
    'Lesson 01': [
      { japanese: 'よる', english: 'night', romaji: 'yoru', kanji: 'よる' },
      { japanese: 'ばん', english: 'night, evening', romaji: 'ban', kanji: 'ばん' }
    ],
    'Lesson 01 - Hard': [
      { japanese: 'こんや', english: 'tonight, this evening', romaji: 'konya', kanji: 'こんや' }
    ],
    'Time Words': [
      { japanese: 'あさ', english: 'morning', romaji: 'asa', kanji: '朝' },
      { japanese: 'よる', english: 'night', romaji: 'yoru', kanji: 'よる' } // Should be updated!
    ],
    'Time Words - Hard': [],
    'Daily Vocab': [
      { japanese: 'ごはん', english: 'meal', romaji: 'gohan', kanji: 'ご飯' }
    ],
    'Daily Vocab - Hard': [
      { japanese: 'こんや', english: 'tonight, this evening', romaji: 'konya', kanji: 'こんや' } // Should be updated!
    ],
    'Unrelated Cat': [
      { japanese: 'みず', english: 'water', romaji: 'mizu', kanji: '水' }
    ]
  };

  ctx.currentSettings.activeDbGroup = 'Ultimate';
  ctx.currentSettings.currentLesson = 'Lesson 01';

  // In Lesson 01, user updates kanji for よる -> 夜 and こんや -> 今夜
  const updatedInput = 
`よる
night
yoru
夜

ばん
night, evening
ban
ばん

--- hard ---

こんや
tonight, this evening
konya
今夜`;

  doc.getElementById('input-import-lesson-icl').value = updatedInput;
  const success = ctx.submitImportLessonICL();
  assert.strictEqual(success, true);

  // 1. Current lesson must be updated
  assert.strictEqual(ctx.currentUltimateWordsDb['Lesson 01'][0].kanji, '夜');
  assert.strictEqual(ctx.currentUltimateWordsDb['Lesson 01 - Hard'][0].kanji, '今夜');

  // 2. Crucial: "Time Words" normal list contains 'よる' / 'night' -> kanji MUST be updated to '夜'!
  const timeWordsYoru = ctx.currentUltimateWordsDb['Time Words'].find(w => w.japanese === 'よる');
  assert.ok(timeWordsYoru, 'Time Words should still have よる');
  assert.strictEqual(timeWordsYoru.kanji, '夜', 'Time Words occurrence of よる must have kanji updated to 夜!');

  // 3. Crucial: "Daily Vocab - Hard" list contains 'こんや' -> kanji MUST be updated to '今夜'!
  const dailyKonya = ctx.currentUltimateWordsDb['Daily Vocab - Hard'].find(w => w.japanese === 'こんや');
  assert.ok(dailyKonya, 'Daily Vocab - Hard should still have こんや');
  assert.strictEqual(dailyKonya.kanji, '今夜', 'Daily Vocab occurrence of こんや must have kanji updated to 今夜!');

  // 4. Unrelated words must remain untouched
  assert.strictEqual(ctx.currentUltimateWordsDb['Time Words'][0].kanji, '朝');
  assert.strictEqual(ctx.currentUltimateWordsDb['Unrelated Cat'][0].kanji, '水');

  console.log('  ✓ Ultimate mode multi-category word synchronization verified 100%!');
}

// Test 7: copyCurrentLessonCL copies formatted text to clipboard
console.log('\nTest 7: copyCurrentLessonCL copies full lesson text to clipboard with toast notification');
{
  lastCopiedText = null;
  ctx.currentSettings.activeDbGroup = 'N5 Lessons';
  ctx.currentSettings.currentLesson = 'Lesson 01';

  ctx.copyCurrentLessonCL();
  assert.ok(lastCopiedText, 'Clipboard text must not be null');
  assert.ok(lastCopiedText.includes('--- hard ---'), 'Clipboard text must include --- hard --- divider');
  assert.ok(lastCopiedText.includes('よる\nnight\nyoru\n夜'), 'Clipboard text must include serialized word blocks');

  console.log('  ✓ copyCurrentLessonCL clipboard writing verified');
}

// Test 8: Virtual / Special category guards
console.log('\nTest 8: Guard against special views ("Show All Words", "Multi-Category View")');
{
  ctx.currentSettings.currentLesson = 'Show All Words';
  assert.strictEqual(ctx.serializeLessonCL('Show All Words'), null);

  ctx.currentSettings.currentLesson = 'Multi-Category View';
  assert.strictEqual(ctx.serializeLessonCL('Multi-Category View'), null);

  console.log('  ✓ Special category guards verified');
}

// Test 9: HTML UI Elements and Modal existence
console.log('\nTest 9: HTML Buttons and Modal existence in index.html');
{
  const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

  assert.ok(indexHtml.includes('id="btn-copy-lesson-cl"'), 'Desktop CL button must exist in index.html');
  assert.ok(indexHtml.includes('id="btn-import-lesson-icl"'), 'Desktop ICL button must exist in index.html');
  assert.ok(indexHtml.includes('id="btn-copy-lesson-cl-mobile"'), 'Mobile CL button must exist in index.html');
  assert.ok(indexHtml.includes('id="btn-import-lesson-icl-mobile"'), 'Mobile ICL button must exist in index.html');
  assert.ok(indexHtml.includes('id="modal-import-lesson-icl"'), 'ICL modal must exist in index.html');
  assert.ok(indexHtml.includes('id="input-import-lesson-icl"'), 'ICL textarea must exist in index.html');
  assert.ok(indexHtml.includes('id="btn-icl-load-current"'), 'Load Current Words button must exist in index.html');
  assert.ok(indexHtml.includes('id="btn-submit-import-lesson-icl"'), 'Submit button must exist in index.html');

  console.log('  ✓ HTML buttons and modal structure verified');
}

// Test 10: CSS responsive rules
console.log('\nTest 10: CSS responsive rules in style.css');
{
  const styleCss = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf8');

  assert.ok(styleCss.includes('#btn-copy-lesson-cl-mobile'), 'Mobile CL button referenced in CSS');
  assert.ok(styleCss.includes('#btn-import-lesson-icl-mobile'), 'Mobile ICL button referenced in CSS');
  assert.ok(styleCss.includes('#btn-copy-lesson-cl'), 'Desktop CL button referenced in CSS');
  assert.ok(styleCss.includes('#btn-import-lesson-icl'), 'Desktop ICL button referenced in CSS');

  console.log('  ✓ Responsive CSS styling verified');
}

console.log('\n🎉 ALL 10 TESTS PASSED! CL & ICL features verified 100%!');
})();
