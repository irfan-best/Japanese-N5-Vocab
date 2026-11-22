const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

console.log("🧪 Starting Single Kanji Search Test Suite...");

// 1. Load data
const wordsJsContent = fs.readFileSync('japanese-n5-vocab/words.js', 'utf8').replace('const allWords = {};', 'allWords = {};');
const scriptContent = fs.readFileSync('japanese-n5-vocab/script.js', 'utf8');
const allKanjisMatch = scriptContent.match(/const ALL_KANJIS_STRING = "(.*?)";/);
const allKanjisStr = allKanjisMatch[1];

const ALL_KANJIS_INDEX_MAP = new Map();
for (let i = 0; i < allKanjisStr.length; i++) {
  const c = allKanjisStr[i];
  if (!ALL_KANJIS_INDEX_MAP.has(c)) {
    ALL_KANJIS_INDEX_MAP.set(c, i);
  }
}

const KANJI_CHAR_REGEX = /[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF\u3005]/g;

function extractKanjis(str) {
  if (!str || typeof str !== 'string') return [];
  const matches = str.match(KANJI_CHAR_REGEX);
  return matches ? Array.from(new Set(matches)) : [];
}

function getWordKanjis(word) {
  if (!word) return [];
  const text = ((word.kanji && word.kanji.trim()) ? word.kanji : "") + " " + (word.japanese || "");
  return extractKanjis(text);
}

function cleanReadingForSorting(str) {
  if (!str) return "";
  return str.replace(/[~()\[\]\-～\s]/g, "").trim().toLowerCase();
}

function sortWordsByReading(a, b) {
  const readingA = cleanReadingForSorting(a.japanese);
  const readingB = cleanReadingForSorting(b.japanese);
  const cmp = readingA.localeCompare(readingB, 'ja');
  if (cmp !== 0) return cmp;
  return (a.english || "").localeCompare(b.english || "");
}

function isSingleKanjiSearch(str) {
  if (!str) return false;
  const t = str.trim();
  if (Array.from(t).length !== 1) return false;
  return ALL_KANJIS_INDEX_MAP.has(t) || /[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF\u3005]/.test(t);
}

function getWordKanjiMeta(word, targetKanji) {
  if (!word) {
    return { kanjis: [], hasTarget: false, otherKanjis: [], otherCount: 0, totalOtherCount: 0, otherIndices: [] };
  }
  const kanjis = getWordKanjis(word);
  const text = ((word.kanji && word.kanji.trim()) ? word.kanji : "") + " " + (word.japanese || "");
  const allMatches = text.match(KANJI_CHAR_REGEX) || [];
  const hasTarget = kanjis.includes(targetKanji) || 
                    (typeof word.kanji === 'string' && word.kanji.includes(targetKanji)) || 
                    (typeof word.japanese === 'string' && word.japanese.includes(targetKanji));
  const otherKanjis = kanjis.filter(k => k !== targetKanji);
  const totalOtherMatches = allMatches.filter(k => k !== targetKanji);
  const otherIndices = otherKanjis.map(k => ALL_KANJIS_INDEX_MAP.has(k) ? ALL_KANJIS_INDEX_MAP.get(k) : 999999).sort((a, b) => a - b);
  return {
    kanjis,
    hasTarget,
    otherKanjis,
    otherCount: otherKanjis.length,
    totalOtherCount: totalOtherMatches.length,
    otherIndices
  };
}

function sortWordsByOtherKanjiCount(itemA, itemB, targetKanji) {
  const metaA = itemA._kanjiMeta || getWordKanjiMeta(itemA.word || itemA, itemA.targetKanji || targetKanji);
  const metaB = itemB._kanjiMeta || getWordKanjiMeta(itemB.word || itemB, itemB.targetKanji || targetKanji);

  // 1. Ascending order of count of other kanjis
  if (metaA.otherCount !== metaB.otherCount) {
    return metaA.otherCount - metaB.otherCount;
  }
  // 1b. Total other kanji occurrences as secondary count
  if (metaA.totalOtherCount !== metaB.totalOtherCount) {
    return metaA.totalOtherCount - metaB.totalOtherCount;
  }
  // 2. Earliest learned other kanjis according to user's All Kanjis list
  const maxLen = Math.max(metaA.otherIndices.length, metaB.otherIndices.length);
  for (let i = 0; i < maxLen; i++) {
    const idxA = metaA.otherIndices[i] !== undefined ? metaA.otherIndices[i] : -1;
    const idxB = metaB.otherIndices[i] !== undefined ? metaB.otherIndices[i] : -1;
    if (idxA !== idxB) return idxA - idxB;
  }
  // 3. For dropdown, prefer current category if specified
  if (itemA.isCurrentCat !== undefined && itemB.isCurrentCat !== undefined) {
    if (itemA.isCurrentCat !== itemB.isCurrentCat) {
      return itemA.isCurrentCat ? -1 : 1;
    }
  }
  // 4. Japanese kana reading order
  const wordA = itemA.word || itemA;
  const wordB = itemB.word || itemB;
  return sortWordsByReading(wordA, wordB);
}

// -------------------------------------------------------------
// Test 1: Single Kanji Detection
// -------------------------------------------------------------
console.log("\nTest 1: isSingleKanjiSearch correctly identifies single kanji vs other inputs");
assert.strictEqual(isSingleKanjiSearch("夜"), true, "Single kanji 夜 should be true");
assert.strictEqual(isSingleKanjiSearch("水"), true, "Single kanji 水 should be true");
assert.strictEqual(isSingleKanjiSearch("学"), true, "Single kanji 学 should be true");
assert.strictEqual(isSingleKanjiSearch("々"), true, "Repetition mark 々 should be true");
assert.strictEqual(isSingleKanjiSearch("  夜  "), true, "Single kanji with whitespace should be true");
assert.strictEqual(isSingleKanjiSearch("今夜"), false, "Two kanjis should be false");
assert.strictEqual(isSingleKanjiSearch("a"), false, "English letter should be false");
assert.strictEqual(isSingleKanjiSearch("night"), false, "English word should be false");
assert.strictEqual(isSingleKanjiSearch("あ"), false, "Hiragana should be false");
assert.strictEqual(isSingleKanjiSearch("ア"), false, "Katakana should be false");
assert.strictEqual(isSingleKanjiSearch(""), false, "Empty string should be false");
assert.strictEqual(isSingleKanjiSearch("   "), false, "Whitespace only should be false");
console.log("  ✓ isSingleKanjiSearch correctly identifies single kanji characters");

// -------------------------------------------------------------
// Test 2: getWordKanjiMeta and Count of Other Kanjis
// -------------------------------------------------------------
console.log("\nTest 2: getWordKanjiMeta accurately counts other kanjis");
const wYoru = { japanese: "よる", english: "night", romaji: "yoru", kanji: "夜" };
const metaYoru = getWordKanjiMeta(wYoru, "夜");
assert.strictEqual(metaYoru.hasTarget, true);
assert.strictEqual(metaYoru.otherCount, 0, "夜 has 0 other kanjis");
assert.deepStrictEqual(metaYoru.otherKanjis, []);

const wKonya = { japanese: "こんや", english: "tonight", romaji: "konya", kanji: "今夜" };
const metaKonya = getWordKanjiMeta(wKonya, "夜");
assert.strictEqual(metaKonya.hasTarget, true);
assert.strictEqual(metaKonya.otherCount, 1, "今夜 has 1 other kanji");
assert.deepStrictEqual(metaKonya.otherKanjis, ["今"]);
assert.strictEqual(metaKonya.otherIndices[0], ALL_KANJIS_INDEX_MAP.get("今"));

const wShinyagyou = { japanese: "しんやぎょう", english: "late-night work", romaji: "shinyagyou", kanji: "深夜業" };
const metaShin = getWordKanjiMeta(wShinyagyou, "夜");
assert.strictEqual(metaShin.hasTarget, true);
assert.strictEqual(metaShin.otherCount, 2, "深夜業 has 2 other kanjis (深, 業)");
assert.deepStrictEqual(metaShin.otherKanjis.sort(), ["業", "深"].sort());

const wTaberu = { japanese: "たべる", english: "eat", romaji: "taberu", kanji: "食べる" };
const metaTaberu = getWordKanjiMeta(wTaberu, "夜");
assert.strictEqual(metaTaberu.hasTarget, false, "食べる does not have 夜");
console.log("  ✓ getWordKanjiMeta accurately counts other kanjis and target presence");

// -------------------------------------------------------------
// Test 3: Ascending Order Sorting of Other Kanjis
// -------------------------------------------------------------
console.log("\nTest 3: Words sort in ascending order of other kanjis count");
const testWords = [
  { word: { japanese: "しんやぎょう", english: "late-night work", kanji: "深夜業" }, targetKanji: "夜" },
  { word: { japanese: "よふかし", english: "stay up late", kanji: "夜更かし" }, targetKanji: "夜" },
  { word: { japanese: "よる", english: "night", kanji: "夜" }, targetKanji: "夜" },
  { word: { japanese: "こんや", english: "tonight", kanji: "今夜" }, targetKanji: "夜" },
  { word: { japanese: "やこうバス", english: "night bus", kanji: "夜行バス" }, targetKanji: "夜" }
];

testWords.sort((a, b) => sortWordsByOtherKanjiCount(a, b, "夜"));

assert.strictEqual(testWords[0].word.kanji, "夜", "0 other kanjis comes first");
assert.strictEqual(testWords[1].word.kanji, "今夜", "1 other kanji (今: idx 68) comes before (行: idx 124)");
assert.strictEqual(testWords[2].word.kanji, "夜行バス", "1 other kanji (行: idx 124) comes after 今");
assert.strictEqual(testWords[3].word.kanji, "夜更かし", "1 other kanji (更: idx 416) comes after 行");
assert.strictEqual(testWords[4].word.kanji, "深夜業", "2 other kanjis comes last");
console.log("  ✓ Words sorted in ascending order of other kanjis: 0 -> 1 (今) -> 1 (行) -> 1 (更) -> 2 (深,業)");

// -------------------------------------------------------------
// Test 4: Real Database Search for 夜
// -------------------------------------------------------------
console.log("\nTest 4: Real words.js search for 夜 returns expected progression");
const context = {};
vm.createContext(context);
vm.runInContext(wordsJsContent, context);
const allWords = context.allWords;

const yoruResults = [];
const seenKeys = new Set();
for (const cat in allWords) {
  const text = allWords[cat];
  const blocks = text.split(/\n\s*\n/);
  blocks.forEach(block => {
    const rawLines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (rawLines.length >= 3) {
      const w = {
        japanese: rawLines[0],
        english: rawLines[1],
        romaji: rawLines[2],
        kanji: rawLines.length >= 4 ? rawLines[3] : "",
        category: cat
      };
      const meta = getWordKanjiMeta(w, "夜");
      if (meta.hasTarget) {
        const dupKey = `${w.japanese}::${w.english}::${w.kanji}`;
        if (!seenKeys.has(dupKey)) {
          seenKeys.add(dupKey);
          yoruResults.push({ word: w, targetKanji: "夜", _kanjiMeta: meta });
        }
      }
    }
  });
}

yoruResults.sort((a, b) => sortWordsByOtherKanjiCount(a, b, "夜"));

assert(yoruResults.length > 0, "Must find words for 夜");
// Ensure non-decreasing otherCount:
for (let i = 0; i < yoruResults.length - 1; i++) {
  assert(yoruResults[i]._kanjiMeta.otherCount <= yoruResults[i + 1]._kanjiMeta.otherCount, 
    `Ascending order violated at ${i}: ${yoruResults[i]._kanjiMeta.otherCount} > ${yoruResults[i + 1]._kanjiMeta.otherCount}`);
}
assert.strictEqual(yoruResults[0]._kanjiMeta.otherCount, 0, "First word must have 0 other kanjis");
console.log(`  ✓ Found ${yoruResults.length} words containing 夜; all sorted non-decreasingly by other kanjis count (from 0 to ${yoruResults[yoruResults.length - 1]._kanjiMeta.otherCount})`);

// -------------------------------------------------------------
// Test 5: Real Database Search for 水
// -------------------------------------------------------------
console.log("\nTest 5: Real words.js search for 水 returns water (0 other kanjis) first");
const mizuResults = [];
const seenMizu = new Set();
for (const cat in allWords) {
  const text = allWords[cat];
  const blocks = text.split(/\n\s*\n/);
  blocks.forEach(block => {
    const rawLines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (rawLines.length >= 3) {
      const w = {
        japanese: rawLines[0],
        english: rawLines[1],
        romaji: rawLines[2],
        kanji: rawLines.length >= 4 ? rawLines[3] : "",
        category: cat
      };
      const meta = getWordKanjiMeta(w, "水");
      if (meta.hasTarget) {
        const dupKey = `${w.japanese}::${w.english}::${w.kanji}`;
        if (!seenMizu.has(dupKey)) {
          seenMizu.add(dupKey);
          mizuResults.push({ word: w, targetKanji: "水", _kanjiMeta: meta });
        }
      }
    }
  });
}
mizuResults.sort((a, b) => sortWordsByOtherKanjiCount(a, b, "水"));
assert.strictEqual(mizuResults[0]._kanjiMeta.otherCount, 0);
assert.strictEqual(mizuResults[0].word.japanese, "みず");
for (let i = 0; i < mizuResults.length - 1; i++) {
  assert(mizuResults[i]._kanjiMeta.otherCount <= mizuResults[i + 1]._kanjiMeta.otherCount,
    `Ascending order violated at index ${i}`);
}
console.log(`  ✓ Found ${mizuResults.length} words containing 水; top word is みず (0 other kanjis)`);

console.log("\n🎉 ALL TESTS PASSED! Single Kanji Search logic verified 100%!");
