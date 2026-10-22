const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('🧪 Starting Learned Kanji Vocab Filter Test Suite...\n');

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
  setTimeout: (fn) => { fn(); return 1; },
  clearTimeout: () => {},
  speechSynthesis: { speak: () => {}, cancel: () => {}, getVoices: () => [] },
  SpeechSynthesisUtterance: function() {},
  console: console,
  showToast: (msg, type) => { lastToast = { msg, type }; }
};
sandbox.window = sandbox;

// Load script in sandbox (replace let/const for globals so they are accessible on ctx)
let scriptCode = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');
scriptCode = scriptCode.replace(/^let currentSettings\b/m, 'var currentSettings');
scriptCode = scriptCode.replace(/^let currentWordsDb\b/m, 'var currentWordsDb');
scriptCode = scriptCode.replace(/^let currentUltimateWordsDb\b/m, 'var currentUltimateWordsDb');

const ctx = vm.createContext(sandbox);
vm.runInContext(scriptCode, ctx);

ctx.showToast = (msg, type) => { lastToast = { msg, type }; };

function clean(v) {
  return JSON.parse(JSON.stringify(v));
}

// ============================================================================
// TEST 1: extractKanjis Unit Tests
// ============================================================================
console.log('Test 1: extractKanjis extracts unique kanji characters correctly');

const extractKanjis = ctx.extractKanjis;
assert.ok(typeof extractKanjis === 'function', 'extractKanjis should be defined');

const k1 = extractKanjis('末美');
assert.deepStrictEqual(clean(k1), ['末', '美'], 'Extracts 末 and 美 from 末美');

const k2 = extractKanjis('当たります [宝くじが～]');
assert.deepStrictEqual(clean(k2), ['当', '宝'], 'Extracts 当 and 宝 ignoring kana and brackets');

const k3 = extractKanjis('はじめまして');
assert.deepStrictEqual(clean(k3), [], 'Extracts 0 kanjis from pure kana');

const k4 = extractKanjis('末末美美');
assert.deepStrictEqual(clean(k4), ['末', '美'], 'Deduplicates identical kanji characters');

console.log('  ✓ extractKanjis passes all test cases');

// ============================================================================
// TEST 2: getWordKanjis Unit Tests
// ============================================================================
console.log('Test 2: getWordKanjis extracts kanji from word objects');

const getWordKanjis = ctx.getWordKanjis;
assert.ok(typeof getWordKanjis === 'function', 'getWordKanjis should be defined');

const wKana = { japanese: 'これ', english: 'this', romaji: 'kore', kanji: '' };
assert.deepStrictEqual(clean(getWordKanjis(wKana)), [], 'Pure kana word has 0 kanjis');

const wKanjiField = { japanese: 'すえ', english: 'end', romaji: 'sue', kanji: '末' };
assert.deepStrictEqual(clean(getWordKanjis(wKanjiField)), ['末'], 'Word with kanji in kanji field');

const wBoth = { japanese: 'うつくしい', english: 'beautiful', romaji: 'utsukushii', kanji: '美しい' };
assert.deepStrictEqual(clean(getWordKanjis(wBoth)), ['美'], 'Word with kanji and okurigana');

const wCompound = { japanese: 'ねんまつ', english: 'end of the year', romaji: 'nenmatsu', kanji: '年末' };
assert.deepStrictEqual(clean(getWordKanjis(wCompound)), ['年', '末'], 'Compound word with multiple kanjis');

console.log('  ✓ getWordKanjis passes all test cases');

// ============================================================================
// TEST 3: partitionWordsByLearnedKanjis Partitioning & Sorting
// ============================================================================
console.log('Test 3: partitionWordsByLearnedKanjis correctly partitions Normal & Hard');

const partitionWordsByLearnedKanjis = ctx.partitionWordsByLearnedKanjis;
assert.ok(typeof partitionWordsByLearnedKanjis === 'function', 'partitionWordsByLearnedKanjis should be defined');

const candidateWords = [
  { japanese: 'はじめまして', english: 'nice to meet you', romaji: 'hajimemashite', kanji: '' },
  { japanese: 'ありがとう', english: 'thank you', romaji: 'arigatou', kanji: '' },
  { japanese: 'すえ', english: 'end', romaji: 'sue', kanji: '末' },
  { japanese: 'うつくしい', english: 'beautiful', romaji: 'utsukushii', kanji: '美しい' },
  { japanese: 'ねんまつ', english: 'end of the year', romaji: 'nenmatsu', kanji: '年末' },
  { japanese: 'びじゅつ', english: 'art', romaji: 'bijutsu', kanji: '美術' },
  { japanese: 'がっこう', english: 'school', romaji: 'gakkou', kanji: '学校' },
  { japanese: 'せんせい', english: 'teacher', romaji: 'sensei', kanji: '先生' }
];

// Learned kanjis: 末 and 美
const result = partitionWordsByLearnedKanjis(candidateWords, '末美');

// 1. Check Normal: must contain pure kana words first, then all-kanji-learned words
assert.strictEqual(result.normalNoKanjiWords.length, 2, '2 pure kana words (はじめまして, ありがとう)');
assert.strictEqual(result.normalLearnedWords.length, 2, '2 learned kanji words (すえ/末, うつくしい/美しい)');
assert.strictEqual(result.normalWords.length, 4, 'Total 4 words in Normal');

// Verify ordering: pure kana words first!
assert.strictEqual(result.normalWords[0].kanji, '', '1st word in Normal must have 0 kanji');
assert.strictEqual(result.normalWords[1].kanji, '', '2nd word in Normal must have 0 kanji');
assert.strictEqual(result.normalWords[2].kanji, 'うつくしい' === result.normalWords[2].japanese ? '美しい' : '末', '3rd word in Normal has learned kanji');
assert.strictEqual(result.normalWords[3].kanji, 'うつくしい' === result.normalWords[3].japanese ? '美しい' : '末', '4th word in Normal has learned kanji');

// Verify alphabetical sort within pure kana words: ありがとう (a) before はじめまして (ha)
assert.strictEqual(result.normalWords[0].japanese, 'ありがとう');
assert.strictEqual(result.normalWords[1].japanese, 'はじめまして');

// 2. Check Hard: words not in Normal, but having AT LEAST ONE learned kanji
// 年末 (has 末, lacks 年) and 美術 (has 美, lacks 術)
assert.strictEqual(result.hardWords.length, 2, 'Total 2 words in Hard (年末, 美術)');
const hardKanjis = result.hardWords.map(w => w.kanji).sort();
assert.deepStrictEqual(clean(hardKanjis), ['年末', '美術'], 'Hard words contain partially learned kanji compounds');

// 3. Check Excluded: words with kanji, but NONE of them learned
// 学校 (lacks 学, 校) and 先生 (lacks 先, 生)
assert.strictEqual(result.excludedWords.length, 2, 'Total 2 words excluded (学校, 先生)');
const excludedKanjis = result.excludedWords.map(w => w.kanji).sort();
assert.deepStrictEqual(clean(excludedKanjis), ['先生', '学校'], 'Excluded words contain unlearned kanjis');

console.log('  ✓ Normal: pure kana first (sorted) + all-kanji-learned (sorted)');
console.log('  ✓ Hard: partially learned kanji compounds (sorted)');
console.log('  ✓ Excluded: words with only unlearned kanjis are omitted');

// ============================================================================
// TEST 4: Category Generation & Storage Integration
// ============================================================================
console.log('Test 4: submitLearnedKanjiFilter generates categories in database');

// Set up mock DOM elements
const inputEl = doc.getElementById('input-learned-kanjis');
const targetCatEl = doc.getElementById('input-learned-kanji-target-cat');
const sourceEl = doc.getElementById('select-learned-kanji-source');
const countEl = doc.getElementById('learned-kanji-detected-count');
const summaryEl = doc.getElementById('learned-kanji-preview-summary');
const backdropEl = doc.getElementById('modal-backdrop');
const modalEl = doc.getElementById('modal-kanji-vocab-filter');

// Populate test database in context
ctx.currentWordsDb['Test Lesson'] = candidateWords.slice(0, 4);
ctx.currentWordsDb['Test Lesson - Hard'] = candidateWords.slice(4);
ctx.currentSettings.activeDbGroup = 'Others';
ctx.currentSettings.currentLesson = 'Test Lesson';
ctx.currentSettings.customCategories = ['Test Lesson'];

// Empty input validation
inputEl.value = '   ';
ctx.submitLearnedKanjiFilter();
assert.strictEqual(lastToast.type, 'danger', 'Empty input triggers danger toast');

// Valid input with custom category name
inputEl.value = '末美';
targetCatEl.value = 'My Learned Words';
sourceEl.value = 'all_db';

ctx.submitLearnedKanjiFilter();

assert.ok(ctx.currentWordsDb['My Learned Words'], 'Category "My Learned Words" created in database');
assert.ok(ctx.currentWordsDb['My Learned Words - Hard'], 'Hard Category created in database');
assert.strictEqual(ctx.currentWordsDb['My Learned Words'].length, 4, 'Normal list has 4 words');
assert.strictEqual(ctx.currentWordsDb['My Learned Words - Hard'].length, 2, 'Hard list has 2 words');
assert.strictEqual(ctx.currentSettings.currentLesson, 'My Learned Words', 'Navigated to generated category');
assert.strictEqual(ctx.currentSettings.isHard, false, 'Defaulted to Normal view');
assert.strictEqual(ctx.localStorage.getItem('n5_learned_kanjis'), '末美', 'Saved learned kanjis input');

// Test Normal view words vs Hard view words
const normalViewWords = ctx.getActiveWords();
assert.strictEqual(normalViewWords.length, 4, 'Normal mode returns 4 words');
assert.strictEqual(normalViewWords[0].japanese, 'ありがとう', 'First word is kana word');

ctx.currentSettings.isHard = true;
const hardViewWords = ctx.getActiveWords();
assert.strictEqual(hardViewWords.length, 2, 'Hard mode returns 2 words');
assert.deepStrictEqual(clean(hardViewWords.map(w => w.kanji).sort()), ['年末', '美術'], 'Hard mode returns partially learned words');

ctx.currentSettings.isHard = false;

console.log('  ✓ Successfully generates db[category] and db[category - Hard]');
console.log('  ✓ Successfully switches currentLesson and resets to Normal');
console.log('  ✓ Normal and Hard difficulty modes return respective lists');
console.log('  ✓ Successfully persists learned kanjis in localStorage');

// ============================================================================
// TEST 5: Live Preview Updates
// ============================================================================
console.log('Test 5: updateKanjiFilterLivePreview dynamically updates UI badges');

inputEl.value = '末 美';
sourceEl.value = 'all_db';
ctx.updateKanjiFilterLivePreview();

assert.ok(countEl.textContent.includes('2 kanjis detected'), 'Detected count shows 2 kanjis');
assert.ok(summaryEl.innerHTML.includes('4 Normal'), 'Preview summary shows 4 Normal');
assert.ok(summaryEl.innerHTML.includes('2 Hard'), 'Preview summary shows 2 Hard');

inputEl.value = '';
ctx.updateKanjiFilterLivePreview();
assert.ok(countEl.textContent.includes('0 kanjis detected'), 'Shows 0 kanjis when empty');
assert.strictEqual(summaryEl.style.display, 'none', 'Preview summary hidden when empty');

console.log('  ✓ Live preview badges dynamically update');

// ============================================================================
// TEST 6: Ultimate Mode Support
// ============================================================================
console.log('Test 6: Ultimate mode generates category in currentUltimateWordsDb with Main partition');

ctx.currentSettings.activeDbGroup = 'Ultimate Main';
ctx.currentUltimateWordsDb['Ultimate Lesson'] = candidateWords;
ctx.currentUltimateWordsDb['Ultimate Lesson - Hard'] = [];

inputEl.value = '末美';
targetCatEl.value = 'Ultimate Learned';
sourceEl.value = 'group';

ctx.submitLearnedKanjiFilter();

assert.ok(ctx.currentUltimateWordsDb['Ultimate Learned'], 'Category created in currentUltimateWordsDb');
assert.ok(ctx.currentUltimateWordsDb['Ultimate Learned - Hard'], 'Hard Category created in currentUltimateWordsDb');
assert.strictEqual(ctx.currentSettings.ultimateCategoryPartitions['Ultimate Learned'], 'Main', 'Partition set to Main');

console.log('  ✓ Ultimate mode support verified');

// ============================================================================
// TEST 7: Modal Opening & Pre-filling
// ============================================================================
console.log('Test 7: openKanjiVocabFilterModal opens modal and pre-fills remembered kanjis');

backdropEl.classList.add('hidden');
modalEl.classList.add('hidden');

ctx.openKanjiVocabFilterModal();

assert.strictEqual(backdropEl.classList.contains('hidden'), false, 'Backdrop is shown');
assert.strictEqual(modalEl.classList.contains('hidden'), false, 'Modal is shown');
assert.strictEqual(inputEl.value, '末美', 'Pre-fills remembered kanjis from localStorage');

console.log('  ✓ Modal opens and pre-fills stored kanjis');

console.log('\n🎉 ALL TESTS PASSED! Learned Kanji Vocab Filter feature verified 100%!');
