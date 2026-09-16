const fs = require("fs");
const groups = JSON.parse(fs.readFileSync("_parsed_groups.json", "utf8"));

const P = {
  は: "wa",
  が: "ga",
  を: "o",
  に: "ni",
  で: "de",
  と: "to",
  の: "no",
  も: "mo",
  へ: "e",
  から: "kara",
  まで: "made",
  です: "desu",
  でした: "deshita",
  ですか: "desu ka",
  ではありません: "dewa arimasen",
  あります: "arimasu",
  います: "imasu",
  します: "shimasu",
  しますか: "shimasu ka",
  しましょう: "shimashou",
  ください: "kudasai",
  すきです: "suki desu",
  わかります: "wakarimasu",
  わかりません: "wakarimasen",
  いきます: "ikimasu",
  みます: "mimasu",
  よみます: "yomimasu",
  かいます: "kaimasu",
  つくります: "tsukurimasu",
  はなします: "hanashimasu",
  べんきょうします: "benkyou shimasu",
  はたらきます: "hatarakimasu",
  とても: "totemo",
  きょう: "kyou",
  あした: "ashita",
  まいにち: "mainichi",
  よく: "yoku",
  もう: "mou",
  まだ: "mada",
  ここ: "koko",
  これ: "kore",
  この: "kono",
  あの: "ano",
  わたし: "watashi",
  わたしたち: "watashitachi",
  ともだち: "tomodachi",
  がっこう: "gakkou",
  うち: "uchi",
  にほん: "nihon",
  ひと: "hito",
  ほん: "hon",
  いぬ: "inu",
  ねこ: "neko",
  つくえ: "tsukue",
  ドア: "doa",
  でんき: "denki",
  じかん: "jikan",
  かいぎ: "kaigi",
  か: "ka",
  ますか: "masu ka",
  ばしょ: "basho",
  ほん: "hon",
  IMC: "IMC",
  "。": ".",
  "、": ",",
  "？": "?",
};

function stripHints(s) {
  return String(s)
    .replace(/［([^］]*)］/g, "$1")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/※/g, "")
    .replace(/\s+[IVXⅠⅡⅢⅣ]+\s*$/u, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanJp(jp) {
  return stripHints(jp).replace(/[~～〜]/g, "").replace(/\s+/g, "").trim();
}

function cleanRo(ro) {
  return stripHints(ro)
    .replace(/^[-~～〜]\s*/, "")
    .replace(/\s*[-~～〜]$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function pieceFromWord(w) {
  return {
    jp: stripHints(w.jp).replace(/[~～〜]/g, "").replace(/\s+/g, ""),
    kanji: stripHints(w.kanji || w.jp).replace(/[~～〜]/g, "").replace(/\s+/g, ""),
    ro: cleanRo(w.romaji),
  };
}

function joinSentence(parts, english) {
  const jp = parts.map((p) => (typeof p === "string" ? p : p.jp)).join("");
  const kanji = parts.map((p) => (typeof p === "string" ? p : p.kanji || p.jp)).join("");
  const ro = parts
    .map((p) => (typeof p === "string" ? P[p] || p : p.ro))
    .filter(Boolean)
    .join(" ")
    .replace(/\s+\./g, ".")
    .replace(/\s+\?/g, "?")
    .replace(/\s+,/g, ",");
  return { jp, en: english, romaji: ro, kanji };
}

function extractFrame(raw) {
  const text = String(raw || "");
  const matches = [...text.matchAll(/[\[［]([^\]］]+)[\]］]/g)].map((m) => m[1].trim());
  for (const m of matches) {
    const core = m.replace(/[～〜~]/g, "").replace(/\s+/g, "");
    if (/[をがにでとへからまで]/.test(core) && core !== "な") return { jp: core, raw: m };
  }
  return null;
}

function extractFrameRo(rawRo, frame) {
  if (!frame) return "";
  const m = String(rawRo || "").match(/\[([^\]]+)\]/);
  if (!m) return "";
  return m[1].replace(/[～〜~]/g, "").replace(/\s+/g, " ").trim();
}

function cap(s) {
  s = String(s || "").trim();
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function splitSenses(en) {
  let s = String(en || "").replace(/\s+/g, " ").trim();
  if (!s) return [""];

  // Keep coordinated calendar/lists as one meaning.
  if (/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun|Monday|Wednesday|Friday)\b/.test(s)) return [s];
  if (/\d/.test(s) && /yen|えん|円/i.test(s)) return [s];
  if (/\band\b/.test(s) && s.split(",").length >= 3) return [s];

  const chunks = s.split(/\s*;\s*|\s+\/\s*|\s*\/\s*/).map((x) => x.trim()).filter(Boolean);
  const out = [];
  for (const chunk of chunks) {
    // Alternate glosses after period: "After you./Go ahead, please."
    if (/^[A-Z].+\.\/[A-Z]/.test(chunk)) {
      out.push(...chunk.split("/").map((x) => x.trim()).filter(Boolean));
      continue;
    }
    const comma = chunk.split(/\s*,\s+/);
    const looksLikeGlosses =
      comma.length > 1 &&
      comma.length <= 4 &&
      comma.every((p) => p.length <= 40 && p.split(/\s+/).length <= 6) &&
      !comma.some((p) => /^(e\.g\.|eg|for example|lit\.|used|when|such as|especially|concerning|in affirmative|in negative)/i.test(p));
    if (looksLikeGlosses) out.push(...comma);
    else out.push(chunk);
  }

  const cleaned = [];
  const seen = new Set();
  for (let p of out) {
    p = p.replace(/\.$/, "").trim();
    if (!p) continue;
    const key = p.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    cleaned.push(p);
  }
  return cleaned.length ? cleaned : [s];
}

function isReady(w) {
  const j = w.jp;
  if (/[。！？?]/.test(j)) return true;
  if (/ください|ございます|ですか|ましょう|ませんか/.test(j)) return true;
  return false;
}

function isMasu(w) {
  return /ます$/.test(w.key.replace(/。$/, "")) && !/です$/.test(w.key);
}

function isIAdj(w) {
  if (isMasu(w) || isReady(w)) return false;
  return /(いい|よい|ない|たい|しい|い)$/.test(w.key) && w.key.length >= 2 && !/です$/.test(w.key);
}

function isNaAdj(w) {
  return /\[な\]|（な）|\(na\)/i.test(w.rawJp + w.en) || /な$/.test(String(w.rawJp));
}

function isAdv(en, w) {
  return /ly$|very|pretty|usually|mostly|directly|almost|hardly|scarcely|someday|anytime|anywhere|anybody|anything|next time/i.test(en) ||
    /^(ずいぶん|こんど|いつでも|どこでも|だれでも|なんでも|ほとんど|たいてい|いつか|むかし|ちょくせつ)$/.test(w.key);
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
      rawJp: e.jp,
      rawRo: e.romaji,
      rawKanji: e.kanji || e.jp,
      jp,
      en: e.en,
      romaji: stripHints(e.romaji),
      kanji: stripHints(e.kanji || e.jp),
      key,
    });
  }
  return out;
}

function verbStemSentence(w, frame, sense, type) {
  const v = pieceFromWord(w);
  const fJp = frame ? frame.jp : "";
  const fRo = extractFrameRo(w.rawRo, frame);
  const fKanji = extractFrame(w.rawKanji);
  const fPiece = frame
    ? { jp: fJp, kanji: (fKanji && fKanji.jp) || fJp, ro: fRo || fJp }
    : null;
  const en = cap(sense);

  if (fPiece) {
    if (type === 1) {
      return joinSentence([fPiece, v, "か", "。"], `${en}?`);
    }
    if (type === 2) {
      return joinSentence(["もう", fPiece, v, "。"], `Already: ${en}.`);
    }
    return joinSentence([fPiece, v, "。"], en + ".");
  }

  const intrans = /(います|あります|わかります|なります|できます|はじまります|しまります|きえます|われます|おれます|おくれます|まにあいます|かたづきます|しにます|おります|まいります)$/.test(w.key);
  if (intrans || /be |feel |become |go off|disappear|sell$|be sold|be made|be completed|come into existence|be late|be in time|be put/i.test(sense)) {
    if (type % 3 === 2) return joinSentence([v, "か", "。"], `${en}?`);
    if (type % 3 === 1) return joinSentence(["きょう", "は", v, "。"], `Today: ${en}.`);
    return joinSentence([v, "。"], en + ".");
  }

  if (/hardly|scarcely|negative/i.test(sense)) {
    const neg = { jp: w.key.replace(/ます$/, "ません"), kanji: (w.kanji || w.jp).replace(/ます$/, "ません"), ro: cleanRo(w.romaji).replace(/masu$/i, "masen") };
    return joinSentence(["ほとんど", neg, "。"], cap(sense) + ".");
  }

  if (/keep \(a pet\)|raise \(an animal\)/i.test(sense)) {
    const pet = type % 2 === 0 ? { jp: "いぬ", kanji: "犬", ro: "inu" } : { jp: "ねこ", kanji: "猫", ro: "neko" };
    return joinSentence(["わたし", "は", pet, "を", v, "。"], `I ${sense}.`);
  }

  if (/look for|search/i.test(sense)) {
    return joinSentence(["かぎ", "を", v, "。"], `I ${sense} for my keys.`);
  }

  if (/apply for|enter for/i.test(sense)) {
    return joinSentence(["ボランティア", "に", v, "。"], `I ${sense} volunteer work.`);
  }

  if (/contact/i.test(sense)) {
    return joinSentence(["ともだち", "に", v, "。"], `I ${sense} my friend.`);
  }

  if (/continue/i.test(sense)) {
    return joinSentence(["べんきょう", "を", v, "。"], `I ${sense} studying.`);
  }

  if (/find/i.test(sense)) {
    return joinSentence(["かぎ", "を", v, "。"], `I ${sense} the keys.`);
  }

  if (/take \[an examination\]|take an examination/i.test(sense)) {
    return joinSentence(["しけん", "を", v, "。"], `I take an examination.`);
  }

  if (/enter \[a university\]|enter a university/i.test(sense)) {
    return joinSentence(["だいがく", "に", v, "。"], `I enter a university.`);
  }

  if (/graduate/i.test(sense)) {
    return joinSentence(["だいがく", "を", v, "。"], `I ${sense}.`);
  }

  if (/attend/i.test(sense)) {
    return joinSentence(["かいぎ", "に", v, "。"], `I ${sense} a meeting.`);
  }

  if (/take a break|take a rest/i.test(sense)) {
    return joinSentence(["ちょっと", v, "。"], `I ${sense}.`);
  }

  if (/do$/i.test(sense) || w.key === "やります") {
    return joinSentence(["スポーツ", "を", v, "。"], `I do sports.`);
  }

  if (/put out/i.test(sense)) {
    return joinSentence(["ごみ", "を", v, "。"], `I put out the trash.`);
  }

  const objects = [
    { jp: "これ", kanji: "これ", ro: "kore" },
    { jp: "しごと", kanji: "仕事", ro: "shigoto" },
    { jp: "じゅぎょう", kanji: "授業", ro: "jugyou" },
  ];
  const obj = objects[type % objects.length];
  if (type % 3 === 0) return joinSentence(["わたし", "は", obj, "を", v, "。"], `I ${sense}.`);
  if (type % 3 === 1) return joinSentence(["まいにち", obj, "を", v, "。"], `Every day I ${sense}.`);
  return joinSentence([obj, "を", v, "か", "。"], `Do you ${sense}?`);
}

function nounSentences(w, sense, type) {
  const n = pieceFromWord(w);
  const en = cap(sense);

  if (/place/i.test(sense)) {
    const opts = [
      () => joinSentence(["この", n, "は", "とても", "いい", "です", "。"], `This ${sense} is very good.`),
      () => joinSentence(["いい", n, "を", "さがします", "。"], `I look for a good ${sense}.`),
      () => joinSentence([n, "は", "どこ", "ですか", "。"], `Where is the ${sense}?`),
    ];
    return opts[type % opts.length]();
  }
  if (/company|office|school|university|college/i.test(sense)) {
    const opts = [
      () => joinSentence(["ちち", "は", n, "で", "はたらきます", "。"], `My father works at a ${sense}.`),
      () => joinSentence(["わたし", "は", n, "へ", "いきます", "。"], `I go to the ${sense}.`),
      () => joinSentence(["ここ", "は", n, "です", "。"], `This is a ${sense}.`),
    ];
    return opts[type % opts.length]();
  }
  if (/garbage|trash|dust|refuse|waste/i.test(sense)) {
    const opts = [
      () => joinSentence(["あした", n, "を", "だします", "。"], `Tomorrow I put out the ${sense}.`),
      () => joinSentence(["つくえ", "の", "うえ", "に", n, "が", "あります", "。"], `There is ${sense} on the desk.`),
      () => joinSentence([n, "を", "すてます", "。"], `I throw away the ${sense}.`),
    ];
    return opts[type % opts.length]();
  }
  if (/newspaper/i.test(sense)) {
    if (/publishing|company/i.test(sense)) {
      return joinSentence(["はは", "は", n, "で", "はたらきます", "。"], `My mother works at a ${sense}.`);
    }
    return joinSentence(["あさ", n, "を", "よみます", "。"], `In the morning I read the ${sense}.`);
  }
  if (/\bspace\b|\buniverse\b/i.test(sense) && !/ship|flight|astronaut/i.test(sense)) {
    const opts = [
      () => joinSentence([n, "は", "ひろい", "です", "。"], `${en} is vast.`),
      () => joinSentence(["ロケット", "は", n, "へ", "いきます", "。"], `The rocket goes to ${sense}.`),
    ];
    return opts[type % 2]();
  }
  if (/pet|animal|dog|cat/i.test(sense)) {
    return joinSentence(["わたし", "は", n, "を", "かいます", "。"], `I keep a ${sense}.`);
  }
  if (/tool|instrument|equipment/i.test(sense)) {
    return joinSentence(["この", n, "を", "つかいます", "。"], `I use this ${sense}.`);
  }
  if (/ceremony|wedding|funeral|exhibition|meeting/i.test(sense)) {
    return joinSentence(["あした", n, "が", "あります", "。"], `Tomorrow there is a ${sense}.`);
  }
  if (/mail|email/i.test(sense)) {
    return joinSentence(["ともだち", "に", n, "を", "おくります", "。"], `I send ${sense} to a friend.`);
  }
  if (/volunteer/i.test(sense)) {
    return joinSentence(["どようび", "に", n, "を", "します", "。"], `I do ${sense} work on Saturday.`);
  }
  if (/can$|cans|bottle|plastic|paper/i.test(sense)) {
    return joinSentence([n, "を", "わけます", "。"], `I sort the ${sense}.`);
  }
  if (/astronaut|spaceship/i.test(sense)) {
    return joinSentence(["あの", "ひと", "は", n, "です", "。"], `That person/thing is a ${sense}.`);
  }
  if (/day$|holiday|time/i.test(sense) && !/anytime|sometime/i.test(sense)) {
    return joinSentence(["らいしゅう", "は", n, "です", "。"], `Next week is ${sense}.`);
  }
  if (/\d/.test(w.jp) || /yen/i.test(sense)) {
    return joinSentence(["やちん", "は", n, "です", "。"], `The rent is ${sense}.`);
  }

  const opts = [
    () => joinSentence(["わたし", "は", n, "が", "すきです", "。"], `I like ${sense}.`),
    () => joinSentence(["ここ", "に", n, "が", "あります", "。"], `There is ${sense} here.`),
    () => joinSentence(["この", n, "を", "みます", "。"], `I look at this ${sense}.`),
    () => joinSentence(["あした", n, "を", "かいます", "。"], `Tomorrow I will buy ${sense}.`),
    () => joinSentence([n, "は", "なん", "ですか", "。"], `What is ${sense}?`),
    () => joinSentence(["がっこう", "で", n, "を", "つかいます", "。"], `I use ${sense} at school.`),
  ];
  return opts[type % opts.length]();
}

function adjSentences(w, sense, type) {
  const a = pieceFromWord(w);
  const na = isNaAdj(w) ? ["な"] : [];
  if (type % 3 === 0) return joinSentence(["きょう", "は", a, "です", "。"], `Today it is ${sense}.`);
  if (type % 3 === 1) return joinSentence(["この", "ひと", "は", a, "です", "。"], `This person is ${sense}.`);
  return joinSentence([a, "ですか", "。"], `Is it ${sense}?`);
}

function advSentences(w, sense, type) {
  const a = pieceFromWord(w);
  if (/hardly|scarcely/i.test(sense)) {
    return joinSentence([a, "わかりません", "。"], cap(sense) + " (I hardly understand).");
  }
  if (/almost all/i.test(sense)) {
    return joinSentence([a, "の", "ひと", "が", "きました", "。"], `Almost all the people came.`);
  }
  if (/next time|another time/i.test(sense)) {
    return joinSentence([a, "また", "あいましょう", "。"], `See you ${sense}.`);
  }
  if (/someday|sometime/i.test(sense)) {
    return joinSentence([a, "にほん", "へ", "いきます", "。"], `${cap(sense)} I will go to Japan.`);
  }
  if (/old days|ancient/i.test(sense)) {
    return joinSentence([a, "の", "はなし", "を", "ききます", "。"], `I listen to a story about the ${sense}.`);
  }
  if (/directly/i.test(sense)) {
    return joinSentence(["せんせい", "に", a, "ききます", "。"], `I ask the teacher ${sense}.`);
  }
  if (/usually|mostly/i.test(sense)) {
    return joinSentence([a, "うち", "で", "べんきょうします", "。"], `I ${sense} study at home.`);
  }
  if (type % 2 === 0) return joinSentence(["きょう", "は", a, "あつい", "です", "。"], `Today it is ${sense} hot.`);
  return joinSentence(["この", "ばしょ", "は", a, "きれい", "です", "。"], `This place is ${sense} pretty.`);
}

function extraP(jp, kanji, ro) {
  P[jp] = P[jp] || ro;
  return { jp, kanji, ro };
}

function specialSentences(w, senses) {
  const p = pieceFromWord(w);
  const k = w.key;
  extraP("えいが", "映画", "eiga");
  extraP("あいました", "会いました", "aimashita");
  extraP("のります", "乗ります", "norimasu");
  extraP("ばしょ", "場所", "basho");
  extraP("ほん", "本", "hon");
  extraP("IMC", "IMC", "IMC");
  extraP("ちょっと", "ちょっと", "chotto");
  extraP("あした", "明日", "ashita");
  extraP("きょう", "今日", "kyou");

  if (k === "うんどうかい") {
    return [joinSentence(["あした", p, "が", "あります", "。"], "There is an athletic meet tomorrow.")];
  }
  if (k === "つごうがいい") {
    return [joinSentence(["あした", "は", p, "です", "。"], "Tomorrow is convenient (for my schedule).")];
  }
  if (k === "つごうがわるい") {
    return [joinSentence(["きょう", "は", p, "です", "。"], "Today is inconvenient (for my schedule).")];
  }
  if (k === "きぶんがいい") {
    return [joinSentence(["きょう", "は", p, "です", "。"], "I feel well today.")];
  }
  if (k === "きぶんがわるい") {
    return [joinSentence(["ちょっと", p, "です", "。"], "I feel a little ill.")];
  }
  if (/^こんな/.test(k)) {
    return senses.map((sense) => joinSentence([p, "ほん", "が", "すきです", "。"], `I like a book ${sense.replace(/^~ ?/, "")}.`));
  }
  if (/^そんな/.test(k)) {
    return senses.map((sense) => joinSentence([p, "えいが", "を", "みます", "。"], `I watch a movie ${sense.replace(/^~ ?/, "")}.`));
  }
  if (/^あんな/.test(k)) {
    return senses.map((sense) => joinSentence([p, "ひと", "に", "あいました", "。"], `I met a person ${sense.replace(/^~ ?/, "")}.`));
  }
  if (k === "べつの") {
    return [joinSentence([p, "ほん", "を", "よみます", "。"], "I read another book.")];
  }
  if (k === "がいしゃ") {
    return [joinSentence(["IMC", "の", p, "で", "はたらきます", "。"], "I work at that company.")];
  }
  if (k === "うちゅうせん") {
    return [joinSentence([p, "に", "のります", "。"], "I board a spaceship.")];
  }
  if (k === "うちゅうひこうし") {
    return [joinSentence(["あの", "ひと", "は", p, "です", "。"], "That person is an astronaut.")];
  }
  return null;
}

function sentencesForWord(w, typeBase) {
  const senses = splitSenses(w.en);
  const special = specialSentences(w, senses);
  if (special) return special;
  const out = [];
  const frame = extractFrame(w.rawJp) || extractFrame(w.rawKanji);

  if (isReady(w)) {
    let jp = String(w.jp).trim();
    let kanji = String(w.kanji || w.jp).trim();
    if (!/[。！？?]$/.test(jp)) jp += "。";
    if (!/[。！？?]$/.test(kanji)) kanji += "。";
    senses.forEach((sense, i) => {
      out.push({ jp, en: cap(sense).replace(/\.$/, "") + ".", romaji: String(w.romaji).trim(), kanji });
    });
    return out;
  }

  extraP("かぎ", "鍵", "kagi");
  extraP("ボランティア", "ボランティア", "borantia");
  extraP("スポーツ", "スポーツ", "supootsu");
  extraP("ごみ", "ごみ", "gomi");
  extraP("ちょっと", "ちょっと", "chotto");
  extraP("べんきょう", "勉強", "benkyou");
  extraP("しけん", "試験", "shiken");
  extraP("だいがく", "大学", "daigaku");
  extraP("しごと", "仕事", "shigoto");
  extraP("じゅぎょう", "授業", "jugyou");
  extraP("ちち", "父", "chichi");
  extraP("はは", "母", "haha");
  extraP("うえ", "上", "ue");
  extraP("すてます", "捨てます", "sutemasu");
  extraP("だします", "出します", "dashimasu");
  extraP("さがします", "探します", "sagashimasu");
  extraP("おくります", "送ります", "okurimasu");
  extraP("つかいます", "使います", "tsukaimasu");
  extraP("わけます", "分けます", "wakemasu");
  extraP("きました", "来ました", "kimashita");
  extraP("あつい", "暑い", "atsui");
  extraP("きれい", "きれい", "kirei");
  extraP("ひろい", "広い", "hiroi");
  extraP("いい", "いい", "ii");
  extraP("はなし", "話", "hanashi");
  extraP("ききます", "聞きます", "kikimasu");
  extraP("せんせい", "先生", "sensei");
  extraP("ロケット", "ロケット", "roketto");
  extraP("どようび", "土曜日", "doyoubi");
  extraP("らいしゅう", "来週", "raishuu");
  extraP("あさ", "朝", "asa");
  extraP("やちん", "家賃", "yachin");
  extraP("どこ", "どこ", "doko");
  extraP("なん", "何", "nan");
  extraP("また", "また", "mata");
  extraP("あいましょう", "会いましょう", "aimashou");

  senses.forEach((sense, i) => {
    const type = typeBase + i;
    let s;
    if (isMasu(w)) s = verbStemSentence(w, frame, sense, type);
    else if (isAdv(sense, w) || isAdv(w.en, w)) s = advSentences(w, sense, type);
    else if (isIAdj(w) || isNaAdj(w) || /kind|gentle|wonderful|marvelous|fantastic|mysterious|afraid|great|admirable|proper|just right/i.test(sense)) {
      s = adjSentences(w, sense, type);
    } else {
      s = nounSentences(w, sense, type);
    }
    if (s && s.jp) out.push(s);
  });
  return out;
}

function formatBlock(sentences) {
  let text = "\n";
  for (const s of sentences) {
    text += `${s.jp}\n${s.en}\n${s.romaji}\n${s.kanji}\n\n`;
  }
  return text;
}

let out = "const allSentences2 = {};\n\n";
const report = [];
for (let n = 26; n <= 50; n++) {
  const num = String(n).padStart(2, "0");
  const words = uniqueEntries(groups[num] || []);
  const sentences = [];
  words.forEach((w, i) => {
    sentences.push(...sentencesForWord(w, i));
  });
  report.push({ n: num, words: words.length, sentences: sentences.length });
  out += `allSentences2["Sentence ${num}"] = \`${formatBlock(sentences)}\`;\n\n`;
  out += `allSentences2["Sentence ${num} - Hard"] = \`\`;\n\n`;
}
out += `if (typeof allWords !== "undefined") {\n  Object.assign(allWords, allSentences2);\n}\n`;
if (out.includes("${")) {
  console.error("unescaped ${ produced");
  process.exit(1);
}
fs.writeFileSync("Sentences2.js", out, "utf8");
console.log(report.map((r) => r.n + " w" + r.words + " s" + r.sentences).join(" "));
console.log("total", report.reduce((a, r) => a + r.sentences, 0));
