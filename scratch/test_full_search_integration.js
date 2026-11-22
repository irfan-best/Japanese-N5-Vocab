const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

console.log("🧪 Starting Full Search Integration Test Suite (script.js)...");

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
    // parse child elements simply if needed
    this.children = [];
  }

  appendChild(child) {
    child.parentElement = this;
    this.children.push(child);
    if (this.tagName === 'SELECT' && child.tagName === 'OPTION') {
      this.options.push(child);
    }
    return child;
  }

  insertBefore(newChild, refChild) {
    newChild.parentElement = this;
    const idx = this.children.indexOf(refChild);
    if (idx === -1) {
      this.children.push(newChild);
    } else {
      this.children.splice(idx, 0, newChild);
    }
    return newChild;
  }

  addEventListener(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  dispatchEvent(event) {
    const fns = this.listeners[event.type] || [];
    fns.forEach(fn => fn(event));
  }

  setAttribute(k, v) { this[k] = v; }
  getAttribute(k) { return this[k]; }
  removeAttribute(k) { delete this[k]; }
  focus() {}
  blur() {}
  scrollIntoView() {}

  querySelector(sel) {
    const all = this.querySelectorAll(sel);
    return all.length > 0 ? all[0] : null;
  }

  querySelectorAll(sel) {
    const results = [];
    const check = (node) => {
      if (sel.startsWith('.') && (node.className || '').split(' ').includes(sel.substring(1))) {
        results.push(node);
      } else if (sel.startsWith('#') && node.id === sel.substring(1)) {
        results.push(node);
      } else if (sel.toLowerCase() === node.tagName.toLowerCase()) {
        results.push(node);
      }
      for (const ch of node.children) check(ch);
    };
    for (const ch of this.children) check(ch);
    return results;
  }
}

const elements = new Map();
function getOrCreateElem(id, tag = 'div') {
  if (!elements.has(id)) {
    elements.set(id, new MockElement(tag, id));
  }
  return elements.get(id);
}

const doc = {
  getElementById: (id) => getOrCreateElem(id),
  querySelector: (sel) => {
    if (sel.startsWith('#')) return getOrCreateElem(sel.substring(1));
    return new MockElement('div');
  },
  querySelectorAll: (sel) => [],
  createElement: (tag) => new MockElement(tag),
  addEventListener: () => {},
  documentElement: new MockElement('html'),
  body: new MockElement('body')
};

// Pre-create important elements
const searchInput = getOrCreateElem('global-search-input', 'input');
const searchResults = getOrCreateElem('search-results-dropdown', 'div');
const selectLesson = getOrCreateElem('select-lesson', 'select');
const modeNormal = getOrCreateElem('mode-normal', 'input');
modeNormal.checked = true;
const modeHard = getOrCreateElem('mode-hard', 'input');
const vocabGrid = getOrCreateElem('vocab-grid', 'div');
const emptyState = getOrCreateElem('empty-state', 'div');
const statLesson = getOrCreateElem('stat-current-lesson', 'span');
const statTotal = getOrCreateElem('stat-total-words', 'span');
const statNormal = getOrCreateElem('stat-normal-words', 'span');
const statHard = getOrCreateElem('stat-hard-words', 'span');
const statSelected = getOrCreateElem('stat-selected-words', 'span');
const statSelectedItem = getOrCreateElem('stat-selected-item', 'div');
getOrCreateElem('select-display-mode', 'select').value = 'both';
getOrCreateElem('select-gap', 'select').value = '1';
getOrCreateElem('quiz-mode-select', 'select').value = 'multiple';
getOrCreateElem('order-original', 'input').checked = true;

// Mock localStorage
const localStorageStore = {};
const win = {
  document: doc,
  localStorage: {
    getItem: (k) => localStorageStore[k] || null,
    setItem: (k, v) => { localStorageStore[k] = String(v); },
    removeItem: (k) => { delete localStorageStore[k]; },
    clear: () => { for (const k in localStorageStore) delete localStorageStore[k]; }
  },
  addEventListener: () => {},
  removeEventListener: () => {},
  speechSynthesis: { speak: () => {}, cancel: () => {}, getVoices: () => [] },
  SpeechSynthesisUtterance: function() {},
  location: { search: '', hash: '' },
  history: { pushState: () => {}, replaceState: () => {} },
  navigator: { userAgent: 'test', clipboard: { writeText: () => Promise.resolve() } },
  console: console,
  setTimeout: (fn) => setTimeout(fn, 0),
  clearTimeout: () => {},
  setInterval: () => {},
  clearInterval: () => {}
};

// Load words.js and script.js in VM
const vmContext = vm.createContext({
  ...win,
  window: win,
  document: doc,
  localStorage: win.localStorage,
  navigator: win.navigator
});

const wordsJs = fs.readFileSync('japanese-n5-vocab/words.js', 'utf8').replace('const allWords = {};', 'allWords = {};');
const scriptJs = fs.readFileSync('japanese-n5-vocab/script.js', 'utf8');

vm.runInContext(wordsJs, vmContext);
vm.runInContext(scriptJs, vmContext);
vm.runInContext('window.showToast = () => {}; showToast = () => {};', vmContext);

// Initialize
vm.runInContext('loadState()', vmContext);
vm.runInContext('initGlobalSearch()', vmContext);

const getCurrentSettings = () => vm.runInContext('currentSettings', vmContext);
const getActiveDb = () => vm.runInContext('getActiveDb()', vmContext);
const getWordKanjiMeta = (w, k) => vm.runInContext('getWordKanjiMeta', vmContext)(w, k);
const triggerSearchResultsCategory = () => vm.runInContext('triggerSearchResultsCategory()', vmContext);

console.log("Environment initialized. Current lesson:", getCurrentSettings().currentLesson);

// -------------------------------------------------------------
// Test 1: Single Kanji Live Search in Dropdown
// -------------------------------------------------------------
console.log("\nTest 1: Single Kanji live search in dropdown sorts results by other kanjis count ascending");

// Simulate typing "夜"
searchInput.value = "夜";
searchInput.dispatchEvent({ type: 'input', target: searchInput });

assert(!searchResults.classList.contains('hidden'), "Dropdown should be visible");
const rows = searchResults.children.filter(c => c.className === 'search-result-row');
assert(rows.length > 0, "Dropdown must contain search result rows");
console.log(`  Found ${rows.length} rows in dropdown for 夜`);

// Verify that the first header indicates single kanji search
const hdr = searchResults.children.find(c => c.className === 'search-dropdown-header');
assert(hdr, "Must have single-kanji search dropdown header");
assert(hdr.innerHTML.includes("夜"), "Header must include 夜");
console.log("  Dropdown header HTML:", hdr.innerHTML);

// Check that rows contain the badge and are non-decreasing
let prevCount = -1;
rows.forEach((r, idx) => {
  const metaBadgeMatch = r.innerHTML.match(/kanji-count-badge.*?>(.*?)<\/span>/);
  assert(metaBadgeMatch, `Row ${idx} must have kanji-count-badge`);
  const badgeText = metaBadgeMatch[1];
  let count = 0;
  if (badgeText.startsWith("Only")) {
    count = 0;
  } else if (badgeText.startsWith("+")) {
    const m = badgeText.match(/\+(\d+)/);
    if (m) count = parseInt(m[1], 10);
  }
  assert(count >= prevCount, `Order violation at row ${idx}: count ${count} < prev ${prevCount}`);
  prevCount = count;
});
console.log("  ✓ Dropdown results sorted strictly in ascending order of other kanjis count!");

// -------------------------------------------------------------
// Test 2: triggerSearchResultsCategory (Pressing Enter)
// -------------------------------------------------------------
console.log("\nTest 2: triggerSearchResultsCategory populates db['Search Results'] in ascending order");
triggerSearchResultsCategory();

assert.strictEqual(getCurrentSettings().currentLesson, "Search Results", "currentLesson must be Search Results");
const activeDb = getActiveDb();
const searchResultsList = activeDb["Search Results"];
assert(Array.isArray(searchResultsList), "db['Search Results'] must be an array");
assert(searchResultsList.length > 0, "Must contain matching words");
console.log(`  Found ${searchResultsList.length} words in db['Search Results'] for 夜`);

// Verify non-decreasing count of other kanjis
let prevOtherCount = -1;
searchResultsList.forEach((w, idx) => {
  const meta = getWordKanjiMeta(w, "夜");
  assert(meta.hasTarget, `Word ${idx} (${w.japanese}) must contain target kanji 夜`);
  assert(meta.otherCount >= prevOtherCount, `Word ${idx} has otherCount ${meta.otherCount} < prev ${prevOtherCount}`);
  prevOtherCount = meta.otherCount;
});
console.log("  ✓ db['Search Results'] contains all matching words sorted in ascending other kanjis count!");

// Check cards created in vocab-grid
const cards = vocabGrid.children.filter(c => (c.className || '').includes('vocab-card'));
assert.strictEqual(cards.length, searchResultsList.length, "Grid must render all matching cards");
const firstCardTag = cards[0].children.find(c => c.className === 'card-kanji-search-tag');
assert(firstCardTag, "First card must have card-kanji-search-tag");
assert.strictEqual(firstCardTag.textContent, "Only 夜", "First card should show 'Only 夜'");
console.log("  ✓ Vocab cards render search tags correctly!");

// Check statLesson title
assert.strictEqual(statLesson.textContent, "Kanji: 夜", "Stat lesson should show 'Kanji: 夜'");
console.log("  ✓ statLesson display:", statLesson.textContent);

// -------------------------------------------------------------
// Test 3: Normal Multi-Character Search (Non-Kanji query)
// -------------------------------------------------------------
console.log("\nTest 3: Normal search for 'hospital' functions without single-kanji headers/badges");
searchInput.value = "hospital";
searchInput.dispatchEvent({ type: 'input', target: searchInput });

const normalRows = searchResults.children.filter(c => c.className === 'search-result-row');
assert(normalRows.length > 0, "Must find results for 'hospital'");
const normalHdr = searchResults.children.find(c => c.className === 'search-dropdown-header');
assert(!normalHdr, "Normal search should not have single-kanji dropdown header");
const normalBadgeMatch = normalRows[0].innerHTML.match(/kanji-count-badge/);
assert(!normalBadgeMatch, "Normal search rows should not have kanji-count-badge");
console.log("  ✓ Normal multi-character search preserved without regression!");

console.log("\n🎉 ALL FULL INTEGRATION TESTS PASSED 100%!");
