const fs = require("fs");
const src = fs.readFileSync("words.js", "utf8");

function parseBlocks(text) {
  const blocks = {};
  const re = /allWords\["([^"]+)"\]\s*=\s*`([\s\S]*?)`;/g;
  let m;
  while ((m = re.exec(text))) {
    blocks[m[1]] = m[2];
  }
  return blocks;
}

function parseEntries(block) {
  const lines = block.split(/\r?\n/).map((l) => l.trim());
  const entries = [];
  let i = 0;
  while (i < lines.length) {
    if (!lines[i]) {
      i++;
      continue;
    }
    const jp = lines[i] || "";
    const en = lines[i + 1] || "";
    const romaji = lines[i + 2] || "";
    const kanji = lines[i + 3] || "";
    if (jp) {
      entries.push({ jp, en, romaji, kanji });
    }
    i += 4;
    while (i < lines.length && !lines[i]) i++;
  }
  return entries;
}

const blocks = parseBlocks(src);
const summary = [];
const groups = {};

for (let n = 1; n <= 50; n++) {
  const num = String(n).padStart(2, "0");
  const keys = [
    `Lesson ${num}`,
    `Lesson ${num} - Hard`,
    `Extra ${num}`,
    `Extra ${num} - Hard`,
  ];
  const entries = [];
  const perKey = {};
  for (const k of keys) {
    const list = parseEntries(blocks[k] || "");
    perKey[k] = list.length;
    entries.push(...list);
  }
  groups[num] = entries;
  summary.push({ n: num, counts: perKey, total: entries.length });
}

fs.writeFileSync("_parsed_groups.json", JSON.stringify(groups));
fs.writeFileSync("_parsed_summary.json", JSON.stringify(summary, null, 2));
console.log("total words", summary.reduce((a, s) => a + s.total, 0));
console.log(JSON.stringify(summary, null, 2));
