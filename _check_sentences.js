const fs = require("fs");
const vm = require("vm");

function load(file) {
  const src = fs.readFileSync(file, "utf8");
  if (src.includes("${")) {
    console.log("warning: unescaped ${ in", file);
  }
  vm.runInThisContext(src);
}

load("sentences.js");
load("Sentences2.js");

const n5 = Object.keys(allSentences).filter((k) => !k.endsWith(" - Hard"));
const n4 = Object.keys(allSentences2).filter((k) => !k.endsWith(" - Hard"));
console.log("n5 categories", n5.join(","));
console.log("n4 categories", n4.join(","));

function countBlocks(obj, keys) {
  let blocks = 0;
  for (const k of keys) {
    const text = obj[k] || "";
    const parts = text.trim().split(/\n\s*\n/).filter((p) => p.trim());
    blocks += parts.length;
    for (const p of parts) {
      const lines = p.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length < 3) console.log("short block in", k, lines);
    }
  }
  return blocks;
}

console.log("n5 blocks", countBlocks(allSentences, n5));
console.log("n4 blocks", countBlocks(allSentences2, n4));
console.log("s01 sample ok", allSentences["Sentence 01"].includes("だれがタイじんですか"));
console.log("s26 starts", allSentences2["Sentence 26"].trim().split("\n")[0]);
console.log("no bad humble object", !/わたくしをまいります|ガイドをおります|さらいげつをきんちょうします|わたくしをいたします/.test(allSentences2["Sentence 50"]));
console.log("humble go ok", /わたしはまいります/.test(allSentences2["Sentence 50"]));
console.log("no 26 in sentences.js", !Object.prototype.hasOwnProperty.call(allSentences, "Sentence 26"));
