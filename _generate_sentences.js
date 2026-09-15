const fs = require("fs");
const groups = JSON.parse(fs.readFileSync("_parsed_groups.json", "utf8"));

const PERSONS = new Set([
  "わたし", "わたしたち", "あなた", "あのひと", "あのかた", "みなさん", "だれ", "どなた",
  "ちち", "はは", "おとうさん", "おかあさん", "あに", "あね", "おとうと", "いもうと",
  "そふ", "そぼ", "そふぼ", "りょうしん", "ごりょうしん", "おねえさん", "おにいさん",
  "いもうとさん", "おとうとさん", "ごきょうだい", "おくさん", "ごしゅじん", "つま",
  "おっと", "ふうふ", "ごふうふ", "むすめ", "むすこ", "こども", "おこさん", "むすめさん",
  "むすこさん", "おばあさん", "おじいさん", "かぞく", "きょうだい", "みんな",
]);

const PARTICLE_RO = {
  は: "wa",
  が: "ga",
  を: "o",
  に: "ni",
  で: "de",
  と: "to",
  の: "no",
  も: "mo",
  か: "ka",
  です: "desu",
  でした: "deshita",
  ですか: "desu ka",
  "。": ".",
  "、": ",",
  "？": "?",
  ひと: "hito",
  これ: "kore",
  ここ: "koko",
  にじゅう: "nijuu",
  たろう: "tarou",
  はなこ: "hanako",
  たなか: "tanaka",
  わたし: "watashi",
  にほん: "nihon",
  IMC: "IMC",
  からきました: "kara kimashita",
  か: "ka",
  はなします: "hanashimasu",
};

function cleanJp(jp) {
  return String(jp)
    .replace(/［/g, "")
    .replace(/］/g, "")
    .replace(/[\[\]]/g, "")
    .replace(/[～〜~]/g, "")
    .replace(/\s+/g, "")
    .trim();
}

function cleanRo(ro) {
  return String(ro)
    .replace(/[\[\]［］]/g, "")
    .replace(/^[-~～〜]\s*/, "")
    .replace(/\s*[-~～〜]$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function shortEn(w) {
  return String(w.en || "")
    .split("(")[0]
    .split(",")[0]
    .replace(/\.$/, "")
    .trim();
}

function stripHints(s) {
  return String(s)
    .replace(/［([^］]*)］/g, "$1")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/※/g, "")
    .replace(/\s+[IVXⅠⅡⅢⅣ]+\s*$/u, "")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueEntries(entries) {
  const seen = new Set();
  const out = [];
  for (const e of entries) {
    const jp = stripHints(e.jp);
    const key = cleanJp(jp);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push({
      jp,
      en: e.en,
      romaji: stripHints(e.romaji),
      kanji: stripHints(e.kanji || e.jp),
      key,
    });
  }
  return out;
}

function isReady(w) {
  const j = w.jp;
  if (/[。！？?]/.test(j)) return true;
  if (/ください|ございます|ですか|ましょう|ませんか/.test(j)) return true;
  if (/はじめまして|よろしく|そうですか|こちらこそ|ありがとうございます/.test(j)) return true;
  if (/おねがいします|いただきます|いらっしゃ|ごめんください/.test(j)) return true;
  if (/いってらっしゃ|いってきます|いって きます|いってまいります/.test(j)) return true;
  if (/おでかけですか|いいてんき|いかがですか|すてきですね/.test(j)) return true;
  if (/ほんのきもち|じこしょうかい|しつれいですが|おせわになります/.test(j)) return true;
  if (w.key === "おなまえは") return true;
  return false;
}

function isMasu(w) {
  return /ます$/.test(w.key.replace(/。$/, "")) && !/です$/.test(w.key);
}

const NO_OBJECT = /(ちがいます|います|あります|わかります|なります|かかります|すみます|まいります|おります|いらっしゃいます|うかがいます|おめにかかります|きんちょうします|きょうりょくします|ございます|でございます|いたします)$/;

function isJin(w) {
  return /じん$/.test(w.key) && w.key !== "じん" && w.key.length > 2;
}

function isGo(w) {
  return /ご$/.test(w.key) && !["ご", "どうぞ"].includes(w.key) && w.key.length > 1 && !/ください$/.test(w.key);
}

function isSuffix(w) {
  return ["さん", "ちゃん", "くん", "じん", "さい", "ご"].includes(w.key) ||
    /^[~～〜]/.test(w.jp);
}

function isInterjection(w) {
  return ["はい", "いいえ", "あのう", "えっ", "あ", "そう", "じゃ", "まだ", "もう", "どうも", "どうぞ"].includes(w.key);
}

function take(unused, pred) {
  const i = unused.findIndex(pred);
  if (i < 0) return null;
  return unused.splice(i, 1)[0];
}

function takeKey(unused, key) {
  return take(unused, (w) => w.key === key);
}

function piece(w) {
  return {
    jp: cleanJp(w.jp),
    kanji: cleanJp(w.kanji || w.jp),
    ro: cleanRo(w.romaji),
    en: shortEn(w),
  };
}

function joinSentence(parts, english) {
  const jp = parts.map((p) => (typeof p === "string" ? p : p.jp)).join("");
  const kanji = parts.map((p) => (typeof p === "string" ? p : p.kanji)).join("");
  const ro = parts
    .map((p) => (typeof p === "string" ? PARTICLE_RO[p] || p : p.ro))
    .filter(Boolean)
    .join(" ")
    .replace(/\s+\./g, ".")
    .replace(/\s+\?/g, "?")
    .replace(/\s+,/g, ",");
  return { jp, en: english, romaji: ro, kanji };
}

function makeFromReady(w) {
  let jp = String(w.jp).trim();
  let kanji = String(w.kanji || w.jp).trim();
  if (!/[。！？?]$/.test(jp)) jp += "。";
  if (!/[。！？?]$/.test(kanji)) kanji += "。";
  return { jp, en: String(w.en).replace(/\s+/g, " ").trim(), romaji: String(w.romaji).trim(), kanji };
}

function subjParticle(person) {
  return person && ["だれ", "どなた"].includes(person.key) ? "が" : "は";
}

function bePhrase(person) {
  if (!person) return "";
  if (person.key === "わたし") return "I am";
  if (person.key === "わたしたち") return "We are";
  if (person.key === "あなた") return "You are";
  if (["だれ", "どなた"].includes(person.key)) return "Who is";
  if (person.key === "みなさん") return "Everyone is";
  if (person.key === "あのひと") return "That person is";
  if (person.key === "あのかた") return "That person (polite) is";
  return `${shortEn(person)} is`;
}

function buildGroup(entries) {
  const unused = uniqueEntries(entries);
  const sentences = [];
  const emit = (s) => {
    if (s && s.jp) sentences.push(s);
  };

  const ready = unused.filter(isReady);
  for (const w of ready) {
    const got = takeKey(unused, w.key);
    if (got) emit(makeFromReady(got));
  }

  const kara = take(unused, (w) => /からきました/.test(w.key));

  // Nationality + country + language bundles
  while (true) {
    const jin = take(unused, isJin);
    if (!jin) break;
    const st = jin.key.slice(0, -2);
    const country = take(unused, (w) => w.key === st);
    const lang = take(unused, (w) => isGo(w) && (w.key === st + "ご" || w.key.replace(/ご$/, "") === st));
    const person = take(unused, (w) => PERSONS.has(w.key));
    const parts = [];
    let english;

    const question = person && ["だれ", "どなた"].includes(person.key);
    if (person) {
      parts.push(piece(person), subjParticle(person), piece(jin), "です");
      if (question) parts.push("か");
      parts.push("。");
      english = question ? `Who is ${shortEn(jin)}?` : `${bePhrase(person)} ${shortEn(jin)}.`;
      if (question) {
        if (country) unused.unshift(country);
        if (lang) unused.unshift(lang);
      } else if (country && kara && !kara._used) {
        parts.push(piece(country), piece(kara), "。");
        kara._used = true;
        if (person.key === "わたし") english = `${bePhrase(person)} ${shortEn(jin)}. I come from ${shortEn(country)}.`;
        else if (person.key === "わたしたち") english = `${bePhrase(person)} ${shortEn(jin)}. We come from ${shortEn(country)}.`;
        else if (person.key === "あなた") english = `${bePhrase(person)} ${shortEn(jin)}. You come from ${shortEn(country)}.`;
        else english = `${bePhrase(person)} ${shortEn(jin)}, from ${shortEn(country)}.`;
        if (lang) unused.unshift(lang);
      } else if (lang && !question) {
        emit(joinSentence(parts, english));
        emit(joinSentence(["これ", "は", piece(lang), "です", "。"], `This is ${shortEn(lang)}.`));
        if (country) unused.unshift(country);
        continue;
      } else if (country && !question) {
        unused.unshift(country);
      }
    } else if (country && kara && !kara._used) {
      parts.push(piece(jin), "は", piece(country), piece(kara), "。");
      kara._used = true;
      english = `${shortEn(jin)} comes from ${shortEn(country)}.`;
      if (lang) unused.unshift(lang);
    } else if (country) {
      parts.push(piece(jin), "は", piece(country), "の", "ひと", "です", "。");
      english = `${shortEn(jin)} is a person from ${shortEn(country)}.`;
      if (lang) unused.unshift(lang);
    } else if (lang) {
      parts.push("これ", "は", piece(jin), "です", "。", "これ", "は", piece(lang), "です", "。");
      english = `This is ${shortEn(jin)}. This is ${shortEn(lang)}.`;
    } else {
      parts.push(piece(jin), "です", "。");
      english = `This person is ${shortEn(jin)}.`;
    }
    emit(joinSentence(parts, english));
  }

  if (kara && !kara._used) emit(makeFromReady(kara));

  while (true) {
    const lang = take(unused, isGo);
    if (!lang) break;
    emit(joinSentence(["これ", "は", piece(lang), "です", "。"], `This is ${shortEn(lang)}.`));
  }

  const san = takeKey(unused, "さん");
  const chan = takeKey(unused, "ちゃん");
  const kun = takeKey(unused, "くん");
  const jinSuf = takeKey(unused, "じん");
  const saiSuf = takeKey(unused, "さい");
  const goSuf = takeKey(unused, "ご");
  const shainSuf = take(unused, (w) => w.key === "しゃいん");
  const nansai = takeKey(unused, "なんさい");
  const oikutsu = takeKey(unused, "おいくつ");

  if (kun) emit(joinSentence(["たろう", piece(kun), "です", "。"], "This is Taro-kun."));
  if (chan) emit(joinSentence(["はなこ", piece(chan), "です", "。"], "This is Hanako-chan."));
  if (san) emit(joinSentence(["たなか", piece(san), "です", "。"], "This is Tanaka-san."));

  const looksJob = (w) =>
    /いん$|しゃ$|せい$|し$/.test(w.key) ||
    ["エンジニア", "せんせい", "きょうし", "がくせい", "いしゃ", "けんきゅうしゃ"].includes(w.key);

  while (true) {
    const person = take(unused, (w) => PERSONS.has(w.key));
    if (!person) break;
    const job = take(unused, looksJob) || take(unused, (w) => !isMasu(w) && !isSuffix(w) && !isInterjection(w) && w.key.length >= 2);
    if (job) {
      emit(
        joinSentence(
          [piece(person), subjParticle(person), piece(job), "です", "。"],
          `${bePhrase(person)} ${shortEn(job)}.`
        )
      );
    } else {
      emit(joinSentence([piece(person), "です", "。"], `${bePhrase(person)} here.`));
    }
  }

  if (jinSuf) emit(joinSentence(["にほん", piece(jinSuf), "です", "。"], "This uses the nationality suffix -jin (nihon-jin)."));
  if (goSuf) emit(joinSentence(["にほん", piece(goSuf), "です", "。"], "This uses the language suffix -go (nihon-go)."));
  if (shainSuf) {
    emit(joinSentence(["IMC", "の", piece(shainSuf), "です", "。"], "An employee of IMC."));
  }
  if (nansai || oikutsu || saiSuf) {
    const parts = [];
    const bits = [];
    if (oikutsu) {
      parts.push(piece(oikutsu), "ですか", "。");
      bits.push("How old are you (formal)?");
    }
    if (nansai) {
      parts.push(piece(nansai), "ですか", "。");
      bits.push("How old?");
    }
    if (saiSuf) {
      parts.push("にじゅう", piece(saiSuf), "です", "。");
      bits.push("I am twenty years old.");
    }
    emit(joinSentence(parts, bits.join(" ")));
  }

  const demos = [];
  for (const k of ["これ", "それ", "あれ", "この", "その", "あの", "ここ", "そこ", "あそこ", "こちら", "そちら", "あちら", "どこ", "どちら"]) {
    const w = takeKey(unused, k);
    if (w) demos.push(w);
  }

  const verbs = [];
  while (true) {
    const v = take(unused, isMasu);
    if (!v) break;
    verbs.push(v);
  }

  const looksNoun = (w) =>
    !isMasu(w) &&
    !isInterjection(w) &&
    !isSuffix(w) &&
    !isReady(w) &&
    w.key.length >= 2 &&
    !PERSONS.has(w.key);

  for (const v of verbs) {
    const vp = piece(v);
    if (NO_OBJECT.test(v.key) || /もうします$/.test(v.key)) {
      if (/もうします$/.test(v.key)) {
        emit(joinSentence(["たなか", "と", vp, "。"], `My name is Tanaka (${shortEn(v)}).`));
      } else if (/まいります$/.test(v.key)) {
        emit(joinSentence(["わたし", "は", vp, "。"], `I go (humble).`));
      } else if (/おります$/.test(v.key)) {
        emit(joinSentence(["わたし", "は", vp, "。"], `I am here (humble).`));
      } else if (/いたします$/.test(v.key)) {
        emit(joinSentence([vp, "。"], `I will do it (humble).`));
      } else {
        emit(joinSentence([vp, "。"], shortEn(v) + "."));
      }
      continue;
    }
    const obj = take(unused, looksNoun);
    if (obj) {
      const particle = /にゅうがくします|しゅっせきします|すみます|いきます|きます|かえります/.test(v.key) ? "に" : "を";
      emit(joinSentence([piece(obj), particle, vp, "。"], `${shortEn(v)} ${shortEn(obj)}.`));
    } else {
      emit(makeFromReady(v));
    }
  }

  for (const d of demos) {
    const noun = take(unused, (w) => !isInterjection(w) && !isSuffix(w) && w.key.length >= 2);
    if (!noun) {
      emit(joinSentence([piece(d), "です", "。"], shortEn(d) + "."));
      continue;
    }
    if (["この", "その", "あの"].includes(d.key)) {
      emit(joinSentence([piece(d), piece(noun), "です", "。"], `This/that ${shortEn(noun)}.`));
    } else if (["ここ", "そこ", "あそこ", "こちら", "そちら", "あちら", "どこ", "どちら"].includes(d.key)) {
      emit(joinSentence([piece(noun), "は", piece(d), "です", "。"], `${shortEn(noun)} is ${shortEn(d)}.`));
    } else {
      emit(joinSentence([piece(d), "は", piece(noun), "です", "。"], `This/that is ${shortEn(noun)}.`));
    }
  }

  const inters = [];
  while (true) {
    const w = take(unused, isInterjection);
    if (!w) break;
    inters.push(w);
  }

  const leftovers = unused.slice();
  unused.length = 0;

  for (const w of leftovers) {
    const intro = inters.shift();
    const p = piece(w);
    if (isMasu({ key: w.key }) || /ます$/.test(w.key)) {
      emit(joinSentence(intro ? [piece(intro), "、", p, "。"] : [p, "。"], `${shortEn(w)}.`));
    } else if (/\d/.test(w.jp)) {
      emit(joinSentence(intro ? [piece(intro), "、", "ここ", "は", p, "です", "。"] : ["ここ", "は", p, "です", "。"], `This place is ${shortEn(w)}.`));
    } else {
      const parts = intro ? [piece(intro), "、", "これ", "は", p, "です", "。"] : ["これ", "は", p, "です", "。"];
      emit(joinSentence(parts, `This is ${shortEn(w)}.`));
    }
  }
  for (const w of inters) emit(makeFromReady(w));

  return sentences;
}

function formatBlock(sentences) {
  let text = "\n";
  for (const s of sentences) {
    text += `${s.jp}\n${s.en}\n${s.romaji}\n${s.kanji}\n\n`;
  }
  return text;
}

function writeSentenceFile(filename, varName, start, end) {
  let out = `const ${varName} = {};\n\n`;
  const report = [];
  for (let n = start; n <= end; n++) {
    const num = String(n).padStart(2, "0");
    const sentences = buildGroup(groups[num] || []);
    report.push({ n: num, words: uniqueEntries(groups[num] || []).length, sentences: sentences.length });
    out += `${varName}["Sentence ${num}"] = \`${formatBlock(sentences)}\`;\n\n`;
    out += `${varName}["Sentence ${num} - Hard"] = \`\`;\n\n`;
  }
  out += `if (typeof allWords !== "undefined") {\n  Object.assign(allWords, ${varName});\n}\n`;
  if (out.includes("${")) {
    console.error("unescaped ${ produced in " + filename);
    process.exit(1);
  }
  fs.writeFileSync(filename, out, "utf8");
  return report;
}

const report1 = writeSentenceFile("sentences.js", "allSentences", 1, 25);
const report2 = writeSentenceFile("Sentences2.js", "allSentences2", 26, 50);
const report = report1.concat(report2);
console.log("total sentences", report.reduce((a, r) => a + r.sentences, 0));
console.log("N5", report1.map((r) => r.n + ":" + r.sentences).join(" "));
console.log("N4", report2.map((r) => r.n + ":" + r.sentences).join(" "));
