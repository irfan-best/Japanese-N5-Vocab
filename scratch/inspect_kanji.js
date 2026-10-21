const fs = require('fs');
const vm = require('vm');

const wordsJs = fs.readFileSync('words.js', 'utf8').replace('const allWords', 'var allWords');
const wordsCtx = {};
vm.runInNewContext(wordsJs, wordsCtx);

console.log('=== Full N5 Kanji Content Preview (first 50 lines) ===');
console.log(wordsCtx.allWords['N5 Kanji'].split('\n').slice(0, 50).join('\n'));
