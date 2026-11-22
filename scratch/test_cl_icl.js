// Automated Test Suite for CL (Copy Lesson) and ICL (Import / Update Current Lesson) with Multi-Category Support
(async () => {
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('🧪 Starting Multi-Category CL & ICL Test Suite...\n');

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
    getItem(k) { return this.store[k] !== undefined ? this.store[k] : null; },
    setItem(k, v) { this.store[k] = String(v); },
    removeItem(k) { delete this.store[k]; },
    clear() { this.store = {}; }
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

// Test 1: Category count configuration (Default: 3, persistent, and changeable)
console.log('Test 1: Category count configuration defaults to 3 and persists changes');
{
  ctx.localStorage.clear();
  assert.strictEqual(ctx.getClCategoryCount(), 3, 'Default category count must be 3');

  ctx.setClCategoryCount(5);
  assert.strictEqual(ctx.getClCategoryCount(), 5, 'Category count must update to 5');
  assert.strictEqual(ctx.localStorage.getItem('cl_category_count'), '5', 'Must persist in localStorage');

  ctx.setClCategoryCount(1);
  assert.strictEqual(ctx.getClCategoryCount(), 1, 'Category count must update to 1');

  // Reset back to 3
  ctx.setClCategoryCount(3);
  assert.strictEqual(ctx.getClCategoryCount(), 3);

  console.log('  ✓ Category count configuration verified (default 3, changeable, persistent)');
}

// Test 2: getTargetCategoriesForCL sequential ordering (current, right to next, 3rd next...)
console.log('\nTest 2: getTargetCategoriesForCL sequences categories in custom/display order');
{
  // Setup dropdown options in order
  const selectLesson = doc.getElementById('select-lesson');
  selectLesson.options = [
    { value: 'Lesson 01' },
    { value: 'Lesson 02' },
    { value: 'Lesson 03' },
    { value: 'Lesson 04' },
    { value: 'Lesson 05' }
  ];

  ctx.currentSettings.currentLesson = 'Lesson 01';
  ctx.setClCategoryCount(3);

  function clean(v) { return JSON.parse(JSON.stringify(v)); }

  const targets1 = ctx.getTargetCategoriesForCL();
  assert.deepStrictEqual(clean(targets1), ['Lesson 01', 'Lesson 02', 'Lesson 03'], 'From Lesson 01 with count 3 should be Lesson 01, 02, 03');

  ctx.currentSettings.currentLesson = 'Lesson 02';
  const targets2 = ctx.getTargetCategoriesForCL();
  assert.deepStrictEqual(clean(targets2), ['Lesson 02', 'Lesson 03', 'Lesson 04'], 'From Lesson 02 with count 3 should be Lesson 02, 03, 04');

  ctx.currentSettings.currentLesson = 'Lesson 04';
  const targets3 = ctx.getTargetCategoriesForCL();
  assert.deepStrictEqual(clean(targets3), ['Lesson 04', 'Lesson 05'], 'From Lesson 04 near end should return Lesson 04, 05');

  ctx.currentSettings.currentLesson = 'Lesson 01';
  const targets4 = ctx.getTargetCategoriesForCL(1);
  assert.deepStrictEqual(clean(targets4), ['Lesson 01'], 'With count 1 should return only Lesson 01');

  console.log('  ✓ Category sequencing (current, next, 3rd next) verified');
}

// Test 3: serializeLessonCL with 3 categories formats with `=== Category Name ===`
console.log('\nTest 3: serializeLessonCL with 3 categories formats each category with `=== <Name> ===` and `--- hard ---`');
{
  ctx.currentWordsDb = {
    'Lesson 01': [
      { japanese: 'よる', english: 'night', romaji: 'yoru', kanji: '夜' }
    ],
    'Lesson 01 - Hard': [
      { japanese: 'こんや', english: 'tonight, this evening', romaji: 'konya', kanji: '今夜' }
    ],
    'Lesson 02': [
      { japanese: 'あさ', english: 'morning', romaji: 'asa', kanji: '朝' }
    ],
    'Lesson 02 - Hard': [
      { japanese: 'けさ', english: 'this morning', romaji: 'kesa', kanji: '今朝' }
    ],
    'Lesson 03': [
      { japanese: 'ひる', english: 'noon', romaji: 'hiru', kanji: '昼' }
    ],
    'Lesson 03 - Hard': [
      { japanese: 'ひるま', english: 'daytime', romaji: 'Hiruma', kanji: '昼間' }
    ]
  };

  ctx.currentSettings.currentLesson = 'Lesson 01';
  ctx.setClCategoryCount(3);

  const res = ctx.serializeLessonCL();
  assert.strictEqual(res.categoryCount, 3);
  assert.strictEqual(res.normalCount, 3);
  assert.strictEqual(res.hardCount, 3);

  assert.ok(res.text.includes('=== Lesson 01 ==='), 'Must include === Lesson 01 === header');
  assert.ok(res.text.includes('=== Lesson 02 ==='), 'Must include === Lesson 02 === header');
  assert.ok(res.text.includes('=== Lesson 03 ==='), 'Must include === Lesson 03 === header');
  assert.ok(res.text.includes('--- hard ---'), 'Must include --- hard --- dividers');

  // Verify single category format when count is 1
  ctx.setClCategoryCount(1);
  const resSingle = ctx.serializeLessonCL();
  assert.strictEqual(resSingle.categoryCount, 1);
  assert.strictEqual(resSingle.text.includes('=== Lesson 01 ==='), false, 'Count 1 should not have category header');
  assert.ok(resSingle.text.includes('よる\nnight\nyoru\n夜'), 'Count 1 should have standard 4 lines');
  assert.ok(resSingle.text.includes('--- hard ---'), 'Count 1 should have hard divider');

  console.log('  ✓ serializeLessonCL multi-category & single category formatting verified');
}

// Test 4: parseICLText with multiple categories
console.log('\nTest 4: parseICLText correctly parses multiple categories separated by `=== Category Name ===`');
{
  const inputMulti = 
`=== Lesson 01 ===

よる
night
yoru
夜

--- hard ---

こんや
tonight
konya
今夜


=== Lesson 02 ===

あさ
morning
asa
朝

--- hard ---

けさ
this morning
kesa
今朝


=== Lesson 03 ===

ひる
noon
hiru
昼

--- hard ---

ひるま
daytime
Hiruma
昼間
`;

  const parsed = ctx.parseICLText(inputMulti);
  assert.strictEqual(parsed.isMulti, true);
  assert.strictEqual(parsed.categories.length, 3);
  assert.strictEqual(parsed.totalNormalCount, 3);
  assert.strictEqual(parsed.totalHardCount, 3);

  assert.strictEqual(parsed.categories[0].categoryName, 'Lesson 01');
  assert.strictEqual(parsed.categories[0].normalWords[0].kanji, '夜');
  assert.strictEqual(parsed.categories[0].hardWords[0].kanji, '今夜');

  assert.strictEqual(parsed.categories[1].categoryName, 'Lesson 02');
  assert.strictEqual(parsed.categories[1].normalWords[0].kanji, '朝');
  assert.strictEqual(parsed.categories[1].hardWords[0].kanji, '今朝');

  assert.strictEqual(parsed.categories[2].categoryName, 'Lesson 03');
  assert.strictEqual(parsed.categories[2].normalWords[0].kanji, '昼');
  assert.strictEqual(parsed.categories[2].hardWords[0].kanji, '昼間');

  console.log('  ✓ parseICLText multi-category parsing verified');
}

// Test 5: submitImportLessonICL updates all 3 categories in Standard DB
console.log('\nTest 5: submitImportLessonICL updates all 3 categories in Standard DB');
{
  ctx.currentWordsDb = {
    'Lesson 01': [{ japanese: 'よる', english: 'night', romaji: 'yoru', kanji: 'よる' }],
    'Lesson 01 - Hard': [{ japanese: 'こんや', english: 'tonight', romaji: 'konya', kanji: 'こんや' }],
    'Lesson 02': [{ japanese: 'あさ', english: 'morning', romaji: 'asa', kanji: 'あさ' }],
    'Lesson 02 - Hard': [{ japanese: 'けさ', english: 'this morning', romaji: 'kesa', kanji: 'けさ' }],
    'Lesson 03': [{ japanese: 'ひる', english: 'noon', romaji: 'hiru', kanji: 'ひる' }],
    'Lesson 03 - Hard': [{ japanese: 'ひるま', english: 'daytime', romaji: 'Hiruma', kanji: 'ひるま' }]
  };
  ctx.currentSettings.activeDbGroup = 'N5 Lessons';
  ctx.currentSettings.currentLesson = 'Lesson 01';

  const updatedMultiInput = 
`=== Lesson 01 ===

よる
night
yoru
夜

--- hard ---

こんや
tonight
konya
今夜


=== Lesson 02 ===

あさ
morning
asa
朝

--- hard ---

けさ
this morning
kesa
今朝


=== Lesson 03 ===

ひる
noon
hiru
昼

--- hard ---

ひるま
daytime
Hiruma
昼間
`;

  doc.getElementById('input-import-lesson-icl').value = updatedMultiInput;
  const success = ctx.submitImportLessonICL();
  assert.strictEqual(success, true);

  assert.strictEqual(ctx.currentWordsDb['Lesson 01'][0].kanji, '夜');
  assert.strictEqual(ctx.currentWordsDb['Lesson 01 - Hard'][0].kanji, '今夜');
  assert.strictEqual(ctx.currentWordsDb['Lesson 02'][0].kanji, '朝');
  assert.strictEqual(ctx.currentWordsDb['Lesson 02 - Hard'][0].kanji, '今朝');
  assert.strictEqual(ctx.currentWordsDb['Lesson 03'][0].kanji, '昼');
  assert.strictEqual(ctx.currentWordsDb['Lesson 03 - Hard'][0].kanji, '昼間');

  console.log('  ✓ Standard DB multi-category import verified');
}

// Test 6: Ultimate Mode Multi-Category Import and Word Synchronization
console.log('\nTest 6: Ultimate Mode Multi-Category Import - updates all 3 categories AND synchronizes modified words to other Ultimate categories');
{
  ctx.currentUltimateWordsDb = {
    'Lesson 01': [{ japanese: 'よる', english: 'night', romaji: 'yoru', kanji: 'よる' }],
    'Lesson 01 - Hard': [{ japanese: 'こんや', english: 'tonight', romaji: 'konya', kanji: 'こんや' }],
    'Lesson 02': [{ japanese: 'あさ', english: 'morning', romaji: 'asa', kanji: 'あさ' }],
    'Lesson 02 - Hard': [{ japanese: 'けさ', english: 'this morning', romaji: 'kesa', kanji: 'けさ' }],
    'Lesson 03': [{ japanese: 'ひる', english: 'noon', romaji: 'hiru', kanji: 'ひる' }],
    'Lesson 03 - Hard': [{ japanese: 'ひるま', english: 'daytime', romaji: 'Hiruma', kanji: 'ひるま' }],
    // Other categories in Ultimate that share these words:
    'Time Words': [
      { japanese: 'よる', english: 'night', romaji: 'yoru', kanji: 'よる' }, // Should be updated to 夜
      { japanese: 'ひる', english: 'noon', romaji: 'hiru', kanji: 'ひる' }   // Should be updated to 昼
    ],
    'Time Words - Hard': [
      { japanese: 'こんや', english: 'tonight', romaji: 'konya', kanji: 'こんや' } // Should be updated to 今夜
    ],
    'Unrelated Cat': [
      { japanese: 'みず', english: 'water', romaji: 'mizu', kanji: '水' }
    ]
  };

  ctx.currentSettings.activeDbGroup = 'Ultimate';
  ctx.currentSettings.currentLesson = 'Lesson 01';

  const updatedMultiInput = 
`=== Lesson 01 ===

よる
night
yoru
夜

--- hard ---

こんや
tonight
konya
今夜


=== Lesson 02 ===

あさ
morning
asa
朝

--- hard ---

けさ
this morning
kesa
今朝


=== Lesson 03 ===

ひる
noon
hiru
昼

--- hard ---

ひるま
daytime
Hiruma
昼間
`;

  doc.getElementById('input-import-lesson-icl').value = updatedMultiInput;
  const success = ctx.submitImportLessonICL();
  assert.strictEqual(success, true);

  // 1. All 3 categories updated
  assert.strictEqual(ctx.currentUltimateWordsDb['Lesson 01'][0].kanji, '夜');
  assert.strictEqual(ctx.currentUltimateWordsDb['Lesson 01 - Hard'][0].kanji, '今夜');
  assert.strictEqual(ctx.currentUltimateWordsDb['Lesson 02'][0].kanji, '朝');
  assert.strictEqual(ctx.currentUltimateWordsDb['Lesson 02 - Hard'][0].kanji, '今朝');
  assert.strictEqual(ctx.currentUltimateWordsDb['Lesson 03'][0].kanji, '昼');
  assert.strictEqual(ctx.currentUltimateWordsDb['Lesson 03 - Hard'][0].kanji, '昼間');

  // 2. Crucial propagation to "Time Words" normal list:
  assert.strictEqual(ctx.currentUltimateWordsDb['Time Words'][0].kanji, '夜', 'Time Words "よる" must be updated to 夜');
  assert.strictEqual(ctx.currentUltimateWordsDb['Time Words'][1].kanji, '昼', 'Time Words "ひる" must be updated to 昼');

  // 3. Crucial propagation to "Time Words - Hard" list:
  assert.strictEqual(ctx.currentUltimateWordsDb['Time Words - Hard'][0].kanji, '今夜', 'Time Words - Hard "こんや" must be updated to 今夜');

  // 4. Unrelated words untouched:
  assert.strictEqual(ctx.currentUltimateWordsDb['Unrelated Cat'][0].kanji, '水');

  console.log('  ✓ Ultimate mode multi-category word synchronization verified 100%!');
}

// Test 7: copyCurrentLessonCL copies 3 categories to clipboard
console.log('\nTest 7: copyCurrentLessonCL copies 3 categories with headers to clipboard');
{
  lastCopiedText = null;
  ctx.currentSettings.activeDbGroup = 'N5 Lessons';
  ctx.currentSettings.currentLesson = 'Lesson 01';
  ctx.setClCategoryCount(3);

  ctx.copyCurrentLessonCL();
  assert.ok(lastCopiedText, 'Clipboard text must not be null');
  assert.ok(lastCopiedText.includes('=== Lesson 01 ==='));
  assert.ok(lastCopiedText.includes('=== Lesson 02 ==='));
  assert.ok(lastCopiedText.includes('=== Lesson 03 ==='));
  assert.ok(lastCopiedText.includes('夜'));

  console.log('  ✓ copyCurrentLessonCL multi-category clipboard copy verified');
}

// Test 8: HTML UI count controls and inputs existence
console.log('\nTest 8: HTML UI count controls in index.html');
{
  const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

  assert.ok(indexHtml.includes('id="input-cl-cat-count"'), 'Desktop count input must exist');
  assert.ok(indexHtml.includes('id="input-cl-cat-count-mobile"'), 'Mobile count input must exist');
  assert.ok(indexHtml.includes('id="input-cl-cat-count-modal"'), 'Modal count input must exist');
  assert.ok(indexHtml.includes('id="cl-count-control"'), 'Desktop cl-count-control must exist');
  assert.ok(indexHtml.includes('id="cl-count-control-mobile"'), 'Mobile cl-count-control-mobile must exist');

  console.log('  ✓ HTML count inputs and controls verified');
}

// Test 9: CSS responsive styling for count controls
console.log('\nTest 9: CSS responsive rules for count controls in style.css');
{
  const styleCss = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf8');

  assert.ok(styleCss.includes('#cl-count-control-mobile'), '#cl-count-control-mobile styled in CSS');
  assert.ok(styleCss.includes('#cl-count-control'), '#cl-count-control styled in CSS');

  console.log('  ✓ Responsive CSS styling verified');
}

// Test 10: syncClCategoryCountUI updates all 3 inputs
console.log('\nTest 10: syncClCategoryCountUI synchronizes inputs across desktop, mobile, and modal');
{
  const elD = doc.getElementById('input-cl-cat-count');
  const elM = doc.getElementById('input-cl-cat-count-mobile');
  const elModal = doc.getElementById('input-cl-cat-count-modal');

  ctx.syncClCategoryCountUI(4);
  assert.strictEqual(elD.value, 4);
  assert.strictEqual(elM.value, 4);
  assert.strictEqual(elModal.value, 4);

  console.log('  ✓ Input synchronization verified');
}

console.log('\n🎉 ALL 10 TESTS PASSED! Multi-Category CL & ICL features verified 100%!');
})();
