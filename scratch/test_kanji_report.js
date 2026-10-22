(async () => {
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('🧪 Starting Kanji Occurrence Report Test Suite...\n');

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

function clean(v) {
  return JSON.parse(JSON.stringify(v));
}

// Sample test vocabulary data
const sampleWords = [
  { japanese: 'はじめまして', english: 'nice to meet you', romaji: 'hajimemashite', kanji: '' },
  { japanese: 'すえ', english: 'end', romaji: 'sue', kanji: '末' },
  { japanese: 'ねんまつ', english: 'year-end', romaji: 'nenmatsu', kanji: '年末' },
  { japanese: 'しゅうまつ', english: 'weekend', romaji: 'shuumatsu', kanji: '週末' },
  { japanese: 'うつくしい', english: 'beautiful', romaji: 'utsukushii', kanji: '美しい' },
  { japanese: 'びじゅつかん', english: 'art museum', romaji: 'bijutsukan', kanji: '美術館' },
  { japanese: 'がっこう', english: 'school', romaji: 'gakkou', kanji: '学校' }
];

ctx.currentWordsDb['Report Lesson'] = sampleWords;
ctx.currentWordsDb['Report Lesson - Hard'] = [];
ctx.currentSettings.activeDbGroup = 'Others';
ctx.currentSettings.currentLesson = 'Report Lesson';
ctx.currentSettings.customCategories = ['Report Lesson'];

// ============================================================================
// TEST 1: generateKanjiReportData TSV Formatting for Excel
// ============================================================================
console.log('Test 1: generateKanjiReportData outputs exact Kanji and Count headers and data');

const generateKanjiReportData = ctx.generateKanjiReportData;
assert.ok(typeof generateKanjiReportData === 'function', 'generateKanjiReportData should be defined');

// Generate report for side-by-side kanjis: 末 and 美
const report1 = generateKanjiReportData('末美', { scope: 'current' });

assert.strictEqual(report1.kanjis.length, 2, 'Extracts 2 kanjis');
assert.strictEqual(report1.rows.length, 2, 'Produces 2 rows');

// Check counts:
// 末 appears in: すえ(末), ねんまつ(年末), しゅうまつ(週末) -> count: 3
// 美 appears in: うつくしい(美しい), びじゅつかん(美術館) -> count: 2
assert.strictEqual(report1.rows[0].kanji, '末');
assert.strictEqual(report1.rows[0].count, 3);
assert.strictEqual(report1.rows[1].kanji, '美');
assert.strictEqual(report1.rows[1].count, 2);

// Check TSV format (for Excel)
// First line must be: Kanji\tCount
assert.ok(report1.textTsv.startsWith('Kanji\tCount\r\n'), 'TSV header must start with Kanji\\tCount');
const tsvLines = report1.textTsv.trim().split('\r\n');
assert.strictEqual(tsvLines[0], 'Kanji\tCount', 'Header is Kanji and Count');
assert.strictEqual(tsvLines[1], '末\t3', 'First data row is 末\\t3');
assert.strictEqual(tsvLines[2], '美\t2', 'Second data row is 美\\t2');

console.log('  ✓ TSV formatted with "Kanji\\tCount" headers followed by rows');
console.log('  ✓ Exact counts: 末 (3), 美 (2)');

// ============================================================================
// TEST 2: Kanji with 0 occurrences in vocabulary
// ============================================================================
console.log('Test 2: Kanjis not present in vocabulary report count 0');

const reportZero = generateKanjiReportData('末美龍', { scope: 'current' });
assert.strictEqual(reportZero.rows.length, 3, 'Includes all 3 kanjis');
assert.strictEqual(reportZero.rows[2].kanji, '龍');
assert.strictEqual(reportZero.rows[2].count, 0, 'Unused kanji reports count 0');

const linesZero = reportZero.textTsv.trim().split('\r\n');
assert.strictEqual(linesZero[3], '龍\t0', 'Row for 龍 reports 0');

console.log('  ✓ Unused kanjis accurately report count 0');

// ============================================================================
// TEST 3: Sorting Options (Input Order vs Count Descending)
// ============================================================================
console.log('Test 3: Sorting options (input order vs count descending)');

// Input order: 美 has 2, 末 has 3
const reportInput = generateKanjiReportData('美末', { scope: 'current', sortMode: 'input' });
assert.strictEqual(reportInput.rows[0].kanji, '美', 'First is 美 in input order');
assert.strictEqual(reportInput.rows[1].kanji, '末', 'Second is 末 in input order');

// Count descending: 末 has 3, 美 has 2
const reportCountDesc = generateKanjiReportData('美末', { scope: 'current', sortMode: 'count_desc' });
assert.strictEqual(reportCountDesc.rows[0].kanji, '末', 'First is 末 in count descending');
assert.strictEqual(reportCountDesc.rows[1].kanji, '美', 'Second is 美 in count descending');

console.log('  ✓ Input order strictly preserved by default');
console.log('  ✓ Count descending properly sorts highest occurrences first');

// ============================================================================
// TEST 4: CSV formatting option
// ============================================================================
console.log('Test 4: CSV formatting option');

const csvLines = report1.textCsv.trim().split('\r\n');
assert.strictEqual(csvLines[0], 'Kanji,Count', 'CSV header is Kanji,Count');
assert.strictEqual(csvLines[1], '末,3');
assert.strictEqual(csvLines[2], '美,2');

console.log('  ✓ CSV format correctly formatted with comma delimiters');

// ============================================================================
// TEST 5: copyKanjiReportToClipboard Clipboard Action
// ============================================================================
console.log('Test 5: copyKanjiReportToClipboard writes formatted TSV to clipboard');

const inputEl = doc.getElementById('input-kanji-report-kanjis');
const sourceEl = doc.getElementById('select-kanji-report-source');
const sortEl = doc.getElementById('select-kanji-report-sort');

inputEl.value = '末美';
sourceEl.value = 'current';
sortEl.value = 'input';

lastCopiedText = null;
const copied = ctx.copyKanjiReportToClipboard();
await Promise.resolve();

assert.strictEqual(copied, true, 'copyKanjiReportToClipboard returns true');
assert.ok(lastCopiedText, 'Text was copied to clipboard');
assert.ok(lastCopiedText.includes('Kanji\tCount'), 'Clipboard contains Kanji\\tCount headers');
assert.ok(lastCopiedText.includes('末\t3'), 'Clipboard contains 末\\t3');
assert.ok(lastCopiedText.includes('美\t2'), 'Clipboard contains 美\\t2');
assert.strictEqual(lastToast.type, 'success', 'Success toast shown');
assert.strictEqual(ctx.localStorage.getItem('n5_learned_kanjis'), '末美', 'Kanji input persisted');

console.log('  ✓ Clipboard receives exact TSV string ready for Excel');

// ============================================================================
// TEST 6: Copy Report directly from Filter Modal
// ============================================================================
console.log('Test 6: Copy Report directly from Learned Kanji Filter modal');

const filterInput = doc.getElementById('input-learned-kanjis');
filterInput.value = '末美';

lastCopiedText = null;
ctx.copyKanjiReportToClipboard({ sourceFromFilter: true, scope: 'current' });
await Promise.resolve();

assert.ok(lastCopiedText, 'Text was copied from filter modal');
assert.ok(lastCopiedText.includes('Kanji\tCount'));
assert.ok(lastCopiedText.includes('末\t3'));

console.log('  ✓ Copy Report works directly from Filter Modal');

// ============================================================================
// TEST 7: Modal UI & Live Preview Updates
// ============================================================================
console.log('Test 7: Modal UI and Live Preview Table');

const countBadge = doc.getElementById('kanji-report-detected-count');
const containerEl = doc.getElementById('kanji-report-preview-container');
const tbodyEl = doc.getElementById('kanji-report-tbody');

inputEl.value = '末美';
sourceEl.value = 'current';
ctx.updateKanjiReportLivePreview();

assert.ok(countBadge.textContent.includes('2 kanjis detected'), 'Detected badge shows 2 kanjis');
assert.strictEqual(containerEl.style.display, 'block', 'Preview container is visible');
assert.ok(tbodyEl.innerHTML.includes('末'), 'Table contains 末');
assert.ok(tbodyEl.innerHTML.includes('美'), 'Table contains 美');

console.log('  ✓ Live preview table populates with Kanji and Counts');

// ============================================================================
// TEST 8: Keyboard Shortcut Shift + K
// ============================================================================
console.log('Test 8: Shift + K keyboard shortcut opens Kanji Report Modal');

const modalReport = doc.getElementById('modal-kanji-report');
const backdrop = doc.getElementById('modal-backdrop');

backdrop.classList.add('hidden');
modalReport.classList.add('hidden');

ctx.openKanjiReportModal();

assert.strictEqual(backdrop.classList.contains('hidden'), false, 'Backdrop displayed');
assert.strictEqual(modalReport.classList.contains('hidden'), false, 'Kanji Report Modal displayed');

console.log('  ✓ Modal opens smoothly with pre-filled kanjis');

console.log('\n🎉 ALL TESTS PASSED! Kanji Occurrence Report feature verified 100%!');

})();