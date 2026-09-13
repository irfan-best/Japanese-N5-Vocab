// ==========================================================================
// STATE MANAGEMENT & CONSTANTS
// ==========================================================================

const DEFAULT_SETTINGS = {
  flagCounts: {}, // Format: "Japanese::English": count
  currentLesson: "Lesson 01",
  isHard: false,
  displayMode: "big-english",
  readingGap: "0",
  quizMode: "quiz1",
  quizOrder: "random",
  revealRomaji: false,
  focusedWordIndex: -1,
  selectedWordIndices: [],
  isSelectionModeActive: false,
  customCategories: [],
  similarWordGroups: [],
  hiddenCategories: [],
  othersHiddenSourceGroups: [],
  lastDestCategory: "",
  activeDbGroup: "N5 Lessons",
  showCategoryModeActive: false,
  lastGroupCategories: {
    "N5 Lessons": "Lesson 01",
    "N5 Others": "Questions1",
    "N5 Grammer": "Grammer 01",
    "N5 Grammer Others": "Show All Words",
    "N5 Extra": "Extra 01",
    "N5 Listening": "Listening 01",
    "N5 Dumps": "Show All Words",
    "N5 Genki": "Genki 01",
    "N4 Lessons": "Lesson 26",
    "N4 Others": "Questions2",
    "N4 Grammer": "Grammer 26",
    "N4 Grammer Others": "Show All Words",
    "N4 Extra": "Extra 26",
    "N4 Listening": "Listening 26",
    "N4 Dumps": "Show All Words",
    "N4 Genki": "Genki 13",
    "N3 Lessons": "Lesson 51",
    "N3 Others": "Questions3",
    "N3 Grammer": "Grammer 51",
    "N3 Grammer Others": "Show All Words",
    "N3 Extra": "Extra 51",
    "N3 Listening": "Listening 51",
    "N3 Dumps": "Show All Words",
    "N2 Lessons": "Lesson 76",
    "N2 Others": "Questions4",
    "N2 Grammer": "Grammer 76",
    "N2 Grammer Others": "Show All Words",
    "N2 Extra": "Extra 76",
    "N2 Listening": "Listening 76",
    "N2 Dumps": "Show All Words",
    "N1 Lessons": "Lesson 101",
    "N1 Others": "Questions5",
    "N1 Grammer": "Grammer 101",
    "N1 Grammer Others": "Show All Words",
    "N1 Extra": "Extra 101",
    "N1 Listening": "Listening 101",
    "N1 Dumps": "Show All Words",
    "Kanji": "N5 Kanji"
  }
};

// Main Runtime State Variables
let currentSettings = { ...DEFAULT_SETTINGS };
let currentWordsDb = {}; // Maps lesson key (e.g. "Lesson 01") to array of parsed word objects

// Speech Synthesis State
let jpVoice = null;
let enVoice = null;
let isPlayingAll = false;
let playAllIndex = 0;
let playAllTimeout = null;
let currentUtterance = null;

// Quiz State
let quizWords = [];
let quizCurrentIndex = 0;
let quizScore = 0;
let quizIsAnswered = false;

// ==========================================================================
// UTILITY FUNCTIONS & TOAST SYSTEM
// ==========================================================================

// Parse multi-line string vocabulary block into array of word objects
function parseWords(text) {
  if (!text) return [];
  const blocks = text.split(/\n\s*\n/);
  const words = [];
  blocks.forEach(block => {
    const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length >= 3) {
      const jp = lines[0];
      const eng = lines[1];
      const romaji = lines[2];
      const kanji = lines.length >= 4 ? lines[3] : "";
      words.push({
        japanese: jp,
        english: eng,
        romaji: romaji,
        kanji: kanji
      });
    }
  });
  return words;
}

// Convert parsed words array back into text format (3 or 4 lines per block)
function serializeWords(wordsArray) {
  if (!wordsArray || wordsArray.length === 0) return "";
  let text = "\n";
  wordsArray.forEach(w => {
    if (w.kanji && w.kanji.trim()) {
      text += `${w.japanese}\n${w.english}\n${w.romaji}\n${w.kanji}\n\n`;
    } else {
      text += `${w.japanese}\n${w.english}\n${w.romaji}\n\n`;
    }
  });
  return text;
}

// Simple Toast Alert Notification System
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button class="toast-close" style="background:none;border:none;cursor:pointer;font-weight:700;">&times;</button>
  `;
  
  // Close toast on button click
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.remove();
  });
  
  container.appendChild(toast);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 200);
  }, 3000);
}

// Helper to shuffle array (Fisher-Yates)
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Check if two Japanese inputs match, considering alternatives
function checkJapaneseMatch(userInput, correctWord) {
  const cleanedInput = userInput.trim().toLowerCase();
  const alternatives = correctWord.split('(or)').map(item => item.trim().toLowerCase());
  return alternatives.includes(cleanedInput);
}

// Check if two English inputs match, considering comma alternatives
function checkEnglishMatch(userInput, correctWord) {
  const cleanedInput = userInput.trim().toLowerCase();
  const alternatives = correctWord.split(',').map(item => item.trim().toLowerCase());
  // Accept if it matches any comma-separated meaning, or the full correct string
  return alternatives.includes(cleanedInput) || cleanedInput === correctWord.trim().toLowerCase();
}

// Clean Japanese speak text by stripping alternatives to prevent spoken garbage
function cleanJapaneseSpeakText(text) {
  if (text.includes('(or)')) {
    return text.split('(or)')[0].trim();
  }
  return text.trim();
}

// Get the key name for flag storage
function getWordKey(word) {
  return `${word.japanese}::${word.english}`;
}

// ==========================================================================
// PERSISTENCE & CACHE MANAGEMENT
// ==========================================================================

// Same Meaning, Same Romaji, Show All, and word categories calculation caches to prevent performance bottlenecks
let sameMeaningWordsCache = null;
let sameMeaningWordsKeysCache = null;
let sameRomajiWordsCache = null;
let sameRomajiWordsKeysCache = null;
let showAllWordsCache = null;
let wordCategoriesCache = null;

function clearAllStateCaches() {
  sameMeaningWordsCache = null;
  sameMeaningWordsKeysCache = null;
  sameRomajiWordsCache = null;
  sameRomajiWordsKeysCache = null;
  showAllWordsCache = null;
  wordCategoriesCache = null;
}

// Save application state to local storage
function saveSettings() {
  const cat = currentSettings.currentLesson;
  if (cat && cat !== 'Search Results' && cat !== 'Search Results - Hard') {
    if (!currentSettings.lastGroupCategories) {
      currentSettings.lastGroupCategories = {};
    }
    currentSettings.lastGroupCategories[currentSettings.activeDbGroup] = cat;
  }
  localStorage.setItem('n5_app_settings', JSON.stringify(currentSettings));
  clearAllStateCaches();
}

function saveWords() {
  const dbCopy = { ...currentWordsDb };
  console.log('dbCOpy:',dbCopy);
  delete dbCopy["Search Results"];
  delete dbCopy["Search Results - Hard"];
  localStorage.setItem('n5_words', JSON.stringify(dbCopy));
  clearAllStateCaches();
}

function cleanCategoryNameForUI(cat) {
  if (!cat) return "";
  
  if (cat.startsWith("Lesson ") || cat.startsWith("Kanji ") || cat.startsWith("Genki ")) {
    return cat;
  }

  // Clean standard categories: Grammer, Extra, Listening
  let m = cat.match(/^(Grammer|Extra|Listening)\s+(\d+)/i);
  if (m) {
    const prefix = m[1];
    const num = parseInt(m[2], 10);
    let uiNum = num;
    let step = 25;
    if (prefix === "Listening") {
      step = 58;
    }
    
    if (num <= step) uiNum = num;
    else if (num <= step * 2) uiNum = num - step;
    else if (num <= step * 3) uiNum = num - step * 2;
    else if (num <= step * 4) uiNum = num - step * 3;
    else uiNum = num - step * 4;
    
    return `${prefix} ${String(uiNum).padStart(2, '0')}`;
  }
  
  return cat
    .replace(/\s+G[1-5]$/, "")
    .replace(/\s+E[1-5]$/, "")
    .replace(/\s+L[1-5]$/, "")
    .replace(/\s+D[1-5]$/, "")
    .replace(/\s+[1-5]$/, "")
    .trim();
}

function migrateCustomCategorySuffixes() {
  let didModify = false;
  
  // 1. Migrate customCategories array
  if (currentSettings.customCategories) {
    const orig = JSON.stringify(currentSettings.customCategories);
    currentSettings.customCategories = currentSettings.customCategories.map(cat => {
      if (cat.endsWith(" G1")) return cat.replace(/ G1$/, " G5");
      if (cat.endsWith(" E1")) return cat.replace(/ E1$/, " E5");
      if (cat.endsWith(" G2")) return cat.replace(/ G2$/, " G4");
      if (cat.endsWith(" E2")) return cat.replace(/ E2$/, " E4");
      return cat;
    });
    if (JSON.stringify(currentSettings.customCategories) !== orig) {
      didModify = true;
    }
  }
  
  // 2. Migrate hiddenCategories array
  if (currentSettings.hiddenCategories) {
    const orig = JSON.stringify(currentSettings.hiddenCategories);
    currentSettings.hiddenCategories = currentSettings.hiddenCategories.map(cat => {
      if (cat.endsWith(" G1")) return cat.replace(/ G1$/, " G5");
      if (cat.endsWith(" E1")) return cat.replace(/ E1$/, " E5");
      if (cat.endsWith(" G2")) return cat.replace(/ G2$/, " G4");
      if (cat.endsWith(" E2")) return cat.replace(/ E2$/, " E4");
      return cat;
    });
    if (JSON.stringify(currentSettings.hiddenCategories) !== orig) {
      didModify = true;
    }
  }
  
  // 3. Migrate keys in currentWordsDb
  let dbModified = false;
  for (const key in currentWordsDb) {
    let newKey = key;
    if (key.endsWith(" G1")) newKey = key.replace(/ G1$/, " G5");
    else if (key.endsWith(" G1 - Hard")) newKey = key.replace(/ G1 - Hard$/, " G5 - Hard");
    else if (key.endsWith(" E1")) newKey = key.replace(/ E1$/, " E5");
    else if (key.endsWith(" E1 - Hard")) newKey = key.replace(/ E1 - Hard$/, " E5 - Hard");
    else if (key.endsWith(" G2")) newKey = key.replace(/ G2$/, " G4");
    else if (key.endsWith(" G2 - Hard")) newKey = key.replace(/ G2 - Hard$/, " G4 - Hard");
    else if (key.endsWith(" E2")) newKey = key.replace(/ E2$/, " E4");
    else if (key.endsWith(" E2 - Hard")) newKey = key.replace(/ E2 - Hard$/, " E4 - Hard");
    
    if (newKey !== key) {
      currentWordsDb[newKey] = currentWordsDb[key];
      delete currentWordsDb[key];
      dbModified = true;
    }
  }
  
  // 4. Migrate currentLesson
  if (currentSettings.currentLesson) {
    let cat = currentSettings.currentLesson;
    let nextCat = cat;
    if (cat.endsWith(" G1")) nextCat = cat.replace(/ G1$/, " G5");
    if (cat.endsWith(" E1")) nextCat = cat.replace(/ E1$/, " E5");
    if (cat.endsWith(" G2")) nextCat = cat.replace(/ G2$/, " G4");
    if (cat.endsWith(" E2")) nextCat = cat.replace(/ E2$/, " E4");
    if (nextCat !== cat) {
      currentSettings.currentLesson = nextCat;
      didModify = true;
    }
  }
  
  // 5. Migrate lastDestCategory
  if (currentSettings.lastDestCategory) {
    let cat = currentSettings.lastDestCategory;
    let nextCat = cat;
    if (cat.endsWith(" G1")) nextCat = cat.replace(/ G1$/, " G5");
    if (cat.endsWith(" E1")) nextCat = cat.replace(/ E1$/, " E5");
    if (cat.endsWith(" G2")) nextCat = cat.replace(/ G2$/, " G4");
    if (cat.endsWith(" E2")) nextCat = cat.replace(/ E2$/, " E4");
    if (nextCat !== cat) {
      currentSettings.lastDestCategory = nextCat;
      didModify = true;
    }
  }
  
  // 6. Migrate lastGroupCategories values
  if (currentSettings.lastGroupCategories) {
    const orig = JSON.stringify(currentSettings.lastGroupCategories);
    for (const g in currentSettings.lastGroupCategories) {
      let cat = currentSettings.lastGroupCategories[g];
      if (cat) {
        if (cat.endsWith(" G1")) currentSettings.lastGroupCategories[g] = cat.replace(/ G1$/, " G5");
        if (cat.endsWith(" E1")) currentSettings.lastGroupCategories[g] = cat.replace(/ E1$/, " E5");
        if (cat.endsWith(" G2")) currentSettings.lastGroupCategories[g] = cat.replace(/ G2$/, " G4");
        if (cat.endsWith(" E2")) currentSettings.lastGroupCategories[g] = cat.replace(/ E2$/, " E4");
      }
    }
    if (currentSettings.lastGroupCategories["N5 Extra"] === "Show All Words") {
      currentSettings.lastGroupCategories["N5 Extra"] = "Extra 01";
    }
    if (currentSettings.lastGroupCategories["N4 Extra"] === "Show All Words") {
      currentSettings.lastGroupCategories["N4 Extra"] = "Extra 26";
    }
    if (currentSettings.lastGroupCategories["N3 Extra"] === "Show All Words") {
      currentSettings.lastGroupCategories["N3 Extra"] = "Extra 51";
    }
    if (currentSettings.lastGroupCategories["N2 Extra"] === "Show All Words") {
      currentSettings.lastGroupCategories["N2 Extra"] = "Extra 76";
    }
    if (currentSettings.lastGroupCategories["N1 Extra"] === "Show All Words") {
      currentSettings.lastGroupCategories["N1 Extra"] = "Extra 101";
    }
    
    // Copy any missing default category mappings
    for (const key in DEFAULT_SETTINGS.lastGroupCategories) {
      if (!currentSettings.lastGroupCategories[key]) {
        currentSettings.lastGroupCategories[key] = DEFAULT_SETTINGS.lastGroupCategories[key];
      }
    }
    
    if (JSON.stringify(currentSettings.lastGroupCategories) !== orig) {
      didModify = true;
    }
  }
  
  if (didModify) {
    saveSettings();
  }
  if (dbModified) {
    saveWords();
  }
}

// Load application state (restoring settings and parsed words)
function loadState() {
  let settingsInitializedFromJs = false;
  let wordsInitializedFromJs = false;

  // Clear search query on load so it's not maintained/restored on refresh
  localStorage.removeItem('n5_search_term');

  // 1. Load Settings
  const savedSettings = localStorage.getItem('n5_app_settings');
  if (savedSettings) {
    currentSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) };
    if (currentSettings.currentLesson === 'Search Results') {
      currentSettings.currentLesson = (currentSettings.lastGroupCategories && currentSettings.lastGroupCategories[currentSettings.activeDbGroup]) || "Lesson 01";
    }
  } else {
    if (typeof appSettings !== 'undefined') {
      currentSettings = { ...DEFAULT_SETTINGS, ...appSettings };
    } else {
      currentSettings = { ...DEFAULT_SETTINGS };
    }
    settingsInitializedFromJs = true;
  }

  if (!currentSettings.customCategories) {
    currentSettings.customCategories = [];
  }
  if (!currentSettings.similarWordGroups) {
    currentSettings.similarWordGroups = [];
  }
  if (!currentSettings.hiddenCategories) {
    currentSettings.hiddenCategories = [];
  }
  if (!currentSettings.othersHiddenSourceGroups) {
    currentSettings.othersHiddenSourceGroups = [];
  }
  if (currentSettings.lastDestCategory === undefined) {
    currentSettings.lastDestCategory = "";
  }
  if (!currentSettings.lastGroupCategories) {
    currentSettings.lastGroupCategories = { ...DEFAULT_SETTINGS.lastGroupCategories };
  } else {
    for (const key in DEFAULT_SETTINGS.lastGroupCategories) {
      if (!currentSettings.lastGroupCategories[key]) {
        currentSettings.lastGroupCategories[key] = DEFAULT_SETTINGS.lastGroupCategories[key];
      }
    }
    delete currentSettings.lastGroupCategories["N5 Kanji"];
    delete currentSettings.lastGroupCategories["N4 Kanji"];
    delete currentSettings.lastGroupCategories["N3 Kanji"];
  }

  // 2. Load Words
  const savedWords = localStorage.getItem('n5_words');
  if (savedWords) {
    currentWordsDb = JSON.parse(savedWords);
    
    // Parse default words from words.js to backfill missing kanji property
    const defaultDb = {};
    for (const key in allWords) {
      defaultDb[key] = parseWords(allWords[key]);
    }
    
    // Backfill missing kanji property non-destructively
    let didModify = false;
    for (const key in currentWordsDb) {
      if (Array.isArray(currentWordsDb[key])) {
        currentWordsDb[key].forEach(w => {
          if (w.kanji === undefined) {
            // Find match in defaultDb for the same category first
            let match = null;
            if (defaultDb[key]) {
              match = defaultDb[key].find(dw => dw.japanese === w.japanese && dw.english === w.english);
            }
            // If not found in same category, search globally
            if (!match) {
              for (const k in defaultDb) {
                match = defaultDb[k].find(dw => dw.japanese === w.japanese && dw.english === w.english);
                if (match) break;
              }
            }
            // Assign kanji
            w.kanji = match ? match.kanji : "";
            didModify = true;
          }
        });
      }
    }
    if (didModify) {
      localStorage.setItem('n5_words', JSON.stringify(currentWordsDb));
    }
  } else {
    currentWordsDb = {};
    // Load from words.js allWords object
    for (const key in allWords) {
      currentWordsDb[key] = parseWords(allWords[key]);
    }
    wordsInitializedFromJs = true;
  }

  // Migrate suffixes G1->G5, E1->E5, G2->G4, E2->E4
  migrateCustomCategorySuffixes();

  // Ensure all 75 lessons and hard versions exist
  // Ensure all 125 Lesson categories and hard versions exist
  for (let i = 1; i <= 125; i++) {
    const lStr = `Lesson ${String(i).padStart(2, '0')}`;
    const hStr = `${lStr} - Hard`;
    if (!currentWordsDb[lStr]) currentWordsDb[lStr] = [];
    if (!currentWordsDb[hStr]) currentWordsDb[hStr] = [];
  }

  // Ensure all 60 legacy kanji categories and hard versions exist (for backward compatibility)
  for (let i = 1; i <= 60; i++) {
    const kStr = `Kanji ${String(i).padStart(2, '0')}`;
    const hStr = `${kStr} - Hard`;
    if (!currentWordsDb[kStr]) currentWordsDb[kStr] = [];
    if (!currentWordsDb[hStr]) currentWordsDb[hStr] = [];
  }

  // Ensure all 15 new Kanji categories (N5 to N1) and their hard versions exist
  const levels = ["N5", "N4", "N3", "N2", "N1"];
  levels.forEach(lv => {
    const cats = [`${lv} Kanji`, `${lv} Kanji New Vocab`, `${lv} Kanji Hard`];
    cats.forEach(cStr => {
      const hStr = `${cStr} - Hard`;
      if (!currentWordsDb[cStr]) currentWordsDb[cStr] = [];
      if (!currentWordsDb[hStr]) currentWordsDb[hStr] = [];
    });
  });

  // Ensure all 125 Grammer categories and hard versions exist
  for (let i = 1; i <= 125; i++) {
    const gStr = `Grammer ${String(i).padStart(2, '0')}`;
    const hStr = `${gStr} - Hard`;
    if (!currentWordsDb[gStr]) currentWordsDb[gStr] = [];
    if (!currentWordsDb[hStr]) currentWordsDb[hStr] = [];
  }

  // Ensure all 125 Extra categories and hard versions exist
  for (let i = 1; i <= 125; i++) {
    const eStr = `Extra ${String(i).padStart(2, '0')}`;
    const hStr = `${eStr} - Hard`;
    if (!currentWordsDb[eStr]) currentWordsDb[eStr] = [];
    if (!currentWordsDb[hStr]) currentWordsDb[hStr] = [];
  }

  // Ensure all 290 Listening categories and hard versions exist
  for (let i = 1; i <= 290; i++) {
    const liStr = `Listening ${String(i).padStart(2, '0')}`;
    const hStr = `${liStr} - Hard`;
    if (!currentWordsDb[liStr]) currentWordsDb[liStr] = [];
    if (!currentWordsDb[hStr]) currentWordsDb[hStr] = [];
  }

  // Ensure all 23 Genki categories and hard versions exist
  for (let i = 1; i <= 23; i++) {
    const gStr = `Genki ${String(i).padStart(2, '0')}`;
    const hStr = `${gStr} - Hard`;
    if (!currentWordsDb[gStr]) currentWordsDb[gStr] = [];
    if (!currentWordsDb[hStr]) currentWordsDb[hStr] = [];
  }

  // Ensure all custom categories exist
  currentSettings.customCategories.forEach(cat => {
    if (!currentWordsDb[cat]) currentWordsDb[cat] = [];
    if (!currentWordsDb[cat + " - Hard"]) currentWordsDb[cat + " - Hard"] = [];
  });

  // If we loaded defaults from words.js, serialize them back to initialize the local storage cache
  if (settingsInitializedFromJs) {
    saveSettings();
  }
  if (wordsInitializedFromJs) {
    saveWords();
  }
}

// ==========================================================================
// AUDIO & SPEECH SYNTHESIS ENGINE
// ==========================================================================

function loadVoices() {
  if (!('speechSynthesis' in window)) return;
  const voices = window.speechSynthesis.getVoices();
  // Target Japanese and English voices
  jpVoice = voices.find(v => v.lang.startsWith('ja') || v.lang.includes('JP')) || null;
  enVoice = voices.find(v => v.lang.startsWith('en') || v.lang.includes('US') || v.lang.includes('GB')) || null;
}

// Initialize Speech voice callback
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = loadVoices;
  loadVoices();
}

// Trigger speech synthesis for a block of text
function speakText(text, lang, callback) {
  if (!('speechSynthesis' in window)) {
    if (callback) callback();
    return;
  }
  
  // Cancel current speech
  window.speechSynthesis.cancel();
  
  if (!text) {
    if (callback) callback();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  if (lang === 'ja') {
    utterance.lang = 'ja-JP';
    if (jpVoice) utterance.voice = jpVoice;
  } else {
    utterance.lang = 'en-US';
    if (enVoice) utterance.voice = enVoice;
  }

  utterance.onend = () => {
    currentUtterance = null;
    if (callback) callback();
  };

  utterance.onerror = (e) => {
    console.error("Speech Synthesis Error:", e);
    currentUtterance = null;
    if (callback) callback();
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

// Stop any active text-to-speech audio
function stopSpeech() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  if (playAllTimeout) {
    clearTimeout(playAllTimeout);
    playAllTimeout = null;
  }
  isPlayingAll = false;
  currentUtterance = null;
  updatePlayAllButtonState();
  removeSpeakingActiveClasses();
}

function removeSpeakingActiveClasses() {
  document.querySelectorAll('.vocab-card.speaking-active').forEach(el => {
    el.classList.remove('speaking-active');
  });
}

// Update Play All button display
function updatePlayAllButtonState() {
  const btn = document.getElementById('btn-play-all');
  if (!btn) return;
  const playIcon = btn.querySelector('.play-icon');
  const pauseIcon = btn.querySelector('.pause-icon');
  const textSpan = btn.querySelector('span');

  if (isPlayingAll) {
    playIcon.classList.add('hidden');
    pauseIcon.classList.remove('hidden');
    textSpan.textContent = "Stop Play";
  } else {
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');
    textSpan.textContent = "Play All";
  }
}

// Loop execution for Play All mode
function playNextCardInPlayAll() {
  if (!isPlayingAll) return;
  const words = getActiveWords();
  if (words.length === 0) {
    stopSpeech();
    return;
  }
  if (playAllIndex >= words.length) {
    playAllIndex = 0;
  }

  // Set focused word index
  currentSettings.focusedWordIndex = playAllIndex;
  currentSettings.selectedWordIndices = [playAllIndex];
  saveSettings();
  renderCards();

  // Scroll active card into view
  const card = document.querySelector(`.vocab-card[data-index="${playAllIndex}"]`);
  if (card) {
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    card.classList.add('speaking-active');
  }

  const word = words[playAllIndex];
  const mode = currentSettings.displayMode;
  const gapMs = parseFloat(currentSettings.readingGap) * 1000;

  if (mode === 'big-english') {
    speakText(word.english, 'en', () => {
      if (!isPlayingAll) return;
      playAllTimeout = setTimeout(() => {
        speakText(cleanJapaneseSpeakText(word.japanese), 'ja', () => {
          if (!isPlayingAll) return;
          playAllTimeout = setTimeout(() => {
            playAllIndex++;
            playNextCardInPlayAll();
          }, gapMs);
        });
      }, gapMs);
    });
  } else if (mode === 'big-japanese') {
    speakText(cleanJapaneseSpeakText(word.japanese), 'ja', () => {
      if (!isPlayingAll) return;
      playAllTimeout = setTimeout(() => {
        speakText(word.english, 'en', () => {
          if (!isPlayingAll) return;
          playAllTimeout = setTimeout(() => {
            playAllIndex++;
            playNextCardInPlayAll();
          }, gapMs);
        });
      }, gapMs);
    });
  } else if (mode === 'english-only') {
    speakText(word.english, 'en', () => {
      if (!isPlayingAll) return;
      playAllTimeout = setTimeout(() => {
        playAllIndex++;
        playNextCardInPlayAll();
      }, gapMs);
    });
  } else {
    // Japanese only or Romaji only
    speakText(cleanJapaneseSpeakText(word.japanese), 'ja', () => {
      if (!isPlayingAll) return;
      playAllTimeout = setTimeout(() => {
        playAllIndex++;
        playNextCardInPlayAll();
      }, gapMs);
    });
  }
}

function togglePlayAll() {
  if (isPlayingAll) {
    stopSpeech();
  } else {
    const words = getActiveWords();
    if (words.length === 0) {
      showToast("No words to play in this lesson list.", "info");
      return;
    }
    isPlayingAll = true;
    updatePlayAllButtonState();
    // Play from current focused word, or from start
    playAllIndex = currentSettings.focusedWordIndex >= 0 ? currentSettings.focusedWordIndex : 0;
    playNextCardInPlayAll();
  }
}

// ==========================================================================
// CORE LAYOUT RENDERING & CARD LOGIC
// ==========================================================================

function getLessonsForActiveGroup() {
  const group = currentSettings.activeDbGroup || "N5 Lessons";
  const lessons = [];
  
  const addStandard = (prefix, start, end) => {
    for (let i = start; i <= end; i++) {
      lessons.push(`${prefix} ${String(i).padStart(2, '0')}`);
    }
  };

  const addCustom = (suffix) => {
    const allKeys = Object.keys(currentWordsDb).filter(k => !k.endsWith(" - Hard"));
    allKeys.forEach(k => {
      if (k.endsWith(suffix)) {
        if (!lessons.includes(k)) lessons.push(k);
      }
    });
  };

  if (group === "N5 Lessons") addStandard("Lesson", 1, 25);
  else if (group === "N4 Lessons") addStandard("Lesson", 26, 50);
  else if (group === "N3 Lessons") addStandard("Lesson", 51, 75);
  else if (group === "N2 Lessons") addStandard("Lesson", 76, 100);
  else if (group === "N1 Lessons") addStandard("Lesson", 101, 125);
  
  else if (group === "N5 Grammer") addStandard("Grammer", 1, 25);
  else if (group === "N4 Grammer") addStandard("Grammer", 26, 50);
  else if (group === "N3 Grammer") addStandard("Grammer", 51, 75);
  else if (group === "N2 Grammer") addStandard("Grammer", 76, 100);
  else if (group === "N1 Grammer") addStandard("Grammer", 101, 125);
  
  else if (group === "N5 Grammer Others") addCustom(" G5");
  else if (group === "N4 Grammer Others") addCustom(" G4");
  else if (group === "N3 Grammer Others") addCustom(" G3");
  else if (group === "N2 Grammer Others") addCustom(" G2");
  else if (group === "N1 Grammer Others") addCustom(" G1");

  else if (group === "N5 Extra") {
    addStandard("Extra", 1, 25);
    addCustom(" E5");
  } else if (group === "N4 Extra") {
    addStandard("Extra", 26, 50);
    addCustom(" E4");
  } else if (group === "N3 Extra") {
    addStandard("Extra", 51, 75);
    addCustom(" E3");
  } else if (group === "N2 Extra") {
    addStandard("Extra", 76, 100);
    addCustom(" E2");
  } else if (group === "N1 Extra") {
    addStandard("Extra", 101, 125);
    addCustom(" E1");
  }

  else if (group === "N5 Listening") {
    addStandard("Listening", 1, 58);
    addCustom(" L5");
  } else if (group === "N4 Listening") {
    addStandard("Listening", 59, 116);
    addCustom(" L4");
  } else if (group === "N3 Listening") {
    addStandard("Listening", 117, 174);
    addCustom(" L3");
  } else if (group === "N2 Listening") {
    addStandard("Listening", 175, 232);
    addCustom(" L2");
  } else if (group === "N1 Listening") {
    addStandard("Listening", 233, 290);
    addCustom(" L1");
  }

  else if (group === "N5 Dumps") addCustom(" D5");
  else if (group === "N4 Dumps") addCustom(" D4");
  else if (group === "N3 Dumps") addCustom(" D3");
  else if (group === "N2 Dumps") addCustom(" D2");
  else if (group === "N1 Dumps") addCustom(" D1");

  else if (group === "N5 Genki") addStandard("Genki", 1, 12);
  else if (group === "N4 Genki") addStandard("Genki", 13, 23);

  else if (group.endsWith("Others")) {
    let suffix = "";
    let lvl = "";
    if (group === "N5 Others") { suffix = "1"; lvl = "5"; }
    else if (group === "N4 Others") { suffix = "2"; lvl = "4"; }
    else if (group === "N3 Others") { suffix = "3"; lvl = "3"; }
    else if (group === "N2 Others") { suffix = "4"; lvl = "2"; }
    else if (group === "N1 Others") { suffix = "5"; lvl = "1"; }

    if (suffix) {
      const allKeys = Object.keys(currentWordsDb).filter(k => !k.endsWith(" - Hard"));
      allKeys.forEach(k => {
        if (k.endsWith(suffix) && 
            !k.endsWith(` G${lvl}`) && 
            !k.endsWith(` E${lvl}`) && 
            !k.endsWith(` L${lvl}`) &&
            !k.endsWith(` D${lvl}`) &&
            !k.match(/^Lesson\s+\d+/i) && 
            !k.match(/^Kanji\s+\d+/i) && 
            !k.match(/^Grammer\s+\d+/i) && 
            !k.match(/^Extra\s+\d+/i) && 
            !k.match(/^Listening\s+\d+/i) && 
            !k.match(/^N[1-5]\s+Kanji/i)) {
          if (!lessons.includes(k)) lessons.push(k);
        }
      });
    }
  }

  else if (group === "Kanji") {
    const levels = ["N5", "N4", "N3", "N2", "N1"];
    levels.forEach(lv => {
      lessons.push(`${lv} Kanji`);
      lessons.push(`${lv} Kanji New Vocab`);
      lessons.push(`${lv} Kanji Hard`);
    });
  }

  return lessons;
}

function getCategoriesForActiveGroup() {
  return getLessonsForActiveGroup();
}

// Get key for currently selected lesson list
function getActiveLessonKey() {
  let key = currentSettings.currentLesson;
  if (currentSettings.isHard) {
    key += " - Hard";
  }
  return key;
}

// Get array of word objects currently shown
function getActiveWords() {
  if (currentSettings.currentLesson === 'Show All Words') {
    return getShowAllWords().filter(isWordVisible);
  }
  if (currentSettings.currentLesson === 'Same Meaning') {
    return getSameMeaningWords().filter(isWordVisible);
  }
  if (currentSettings.currentLesson === 'Same Romaji') {
    return getSameRomajiWords().filter(isWordVisible);
  }
  const key = getActiveLessonKey();
  const list = currentWordsDb[key] || [];
  return list.filter(isWordVisible);
}

function reorderWords(fromIdx, toIdx) {
  const key = getActiveLessonKey();
  if (key === 'Show All Words' || key === 'Similar Words' || key === 'Same Meaning' || key === 'Same Romaji') return;

  const list = currentWordsDb[key];
  if (!list || fromIdx < 0 || fromIdx >= list.length || toIdx < 0 || toIdx >= list.length) return;

  // Move the item
  const [movedWord] = list.splice(fromIdx, 1);
  list.splice(toIdx, 0, movedWord);

  saveWords();
  renderCards();
}

function getShowAllWords() {
  if (showAllWordsCache) {
    return showAllWordsCache;
  }
  const uniqueMap = new Map();
  const lessons = getLessonsForActiveGroup();
  
  lessons.forEach(lKey => {
    // Normal list
    const listN = currentWordsDb[lKey] || [];
    listN.forEach(w => {
      const dupKey = `${w.japanese.trim()}|${w.english.trim()}|${w.romaji.trim()}`;
      if (!uniqueMap.has(dupKey)) {
        uniqueMap.set(dupKey, w);
      }
    });
    // Hard list
    const listH = currentWordsDb[lKey + " - Hard"] || [];
    listH.forEach(w => {
      const dupKey = `${w.japanese.trim()}|${w.english.trim()}|${w.romaji.trim()}`;
      if (!uniqueMap.has(dupKey)) {
        uniqueMap.set(dupKey, w);
      }
    });
  });
  const merged = Array.from(uniqueMap.values());
  
  const cleanRomajiForSorting = (str) => {
    if (!str) return "";
    return str.replace(/[~()\-]/g, '').trim().toLowerCase();
  };

  merged.sort((a, b) => {
    const romajiA = cleanRomajiForSorting(a.romaji);
    const romajiB = cleanRomajiForSorting(b.romaji);
    return romajiA.localeCompare(romajiB);
  });
  showAllWordsCache = merged;
  return merged;
}

function belongsToAnyCustomCategory(word) {
  if (!word) return false;
  const cats = getAllCategoriesForWord(word);
  const customCats = currentSettings.customCategories || [];
  return cats.some(c => customCats.includes(c));
}



function getAllCategoriesForWord(word) {
  if (!word || !word.japanese || !word.english) return [];
  const wordJp = word.japanese.trim();
  const wordEng = word.english.trim();
  const cacheKey = `${wordJp}::${wordEng}`;

  if (!wordCategoriesCache) {
    wordCategoriesCache = new Map();
  }
  if (wordCategoriesCache.has(cacheKey)) {
    return wordCategoriesCache.get(cacheKey);
  }

  const categories = [];

  // Check all lessons and custom categories in currentWordsDb
  for (const key in currentWordsDb) {
    const isHardKey = key.endsWith(" - Hard");
    const baseKey = isHardKey ? key.replace(" - Hard", "") : key;
    
    if (categories.includes(baseKey)) continue;

    const list = currentWordsDb[key] || [];
    const found = list.some(w => w.japanese.trim() === wordJp && w.english.trim() === wordEng);
    if (found) {
      categories.push(baseKey);
    }
  }

  wordCategoriesCache.set(cacheKey, categories);
  return categories;
}

function isWordVisible(word) {
  const group = currentSettings.activeDbGroup || "N5 Lessons";
  const isOthersGroup = group.endsWith("Others") && !group.includes("Grammer");
  const isLessonsGroup = group.endsWith("Lessons");
  const isExtraGroup = group.endsWith("Extra");
  const isGenkiGroup = group.endsWith("Genki");
  const isGrammerGroup = group.includes("Grammer");
  
  if (isOthersGroup) {
    const cats = getAllCategoriesForWord(word);
    if (cats.length === 0) return true;

    const wordSourceGroups = new Set();
    cats.forEach(c => {
      if (c.match(/^Lesson\s+\d+/i)) {
        wordSourceGroups.add("Lesson");
      } else if (c.match(/^Extra\s+\d+/i) || c.match(/\s+E[1-5]$/)) {
        wordSourceGroups.add("Extra");
      } else if (c.match(/^Genki\s+\d+/i)) {
        wordSourceGroups.add("Genki");
      } else if (c.match(/^(N[1-5]\s+Kanji|Kanji\s+\d+)/i) || c.includes("Kanji")) {
        wordSourceGroups.add("Kanji");
      }
    });

    if (wordSourceGroups.size === 0) return true;

    const hiddenSourceGroups = currentSettings.othersHiddenSourceGroups || [];
    const hasVisibleSource = Array.from(wordSourceGroups).some(g => !hiddenSourceGroups.includes(g));
    return hasVisibleSource;
  }

  if (!isLessonsGroup && !isExtraGroup && !isGenkiGroup && !isGrammerGroup) return true;

  const cats = getAllCategoriesForWord(word);
  if (cats.length === 0) return true;

  // Filter categories to only check custom categories, Similar Words, and explicitly hidden standard lessons/grammars/extras/genkis
  const filteredCats = cats.filter(c => {
    if (c === currentSettings.currentLesson) {
      return false;
    }
    const isStandardLesson = c.match(/^Lesson\s+\d+/i);
    const isStandardGrammer = c.match(/^Grammer\s+\d+/i);
    const isStandardExtra = c.match(/^Extra\s+\d+/i);
    const isStandardGenki = c.match(/^Genki\s+\d+/i);
    if (isStandardLesson || isStandardGrammer || isStandardExtra || isStandardGenki) {
      return (currentSettings.hiddenCategories || []).includes(c);
    }
    return true;
  });

  if (filteredCats.length === 0) return true;

  const allHidden = filteredCats.every(c => (currentSettings.hiddenCategories || []).includes(c));
  return !allHidden;
}

function populateHiddenCategoriesUI() {
  const container = document.getElementById('hidden-categories-container');
  const actions = document.getElementById('hidden-categories-actions');
  if (!container) return;
  container.innerHTML = "";

  const group = currentSettings.activeDbGroup || "N5 Lessons";
  const isOthersGroup = group.endsWith("Others") && !group.includes("Grammer");
  const isLessonsGroup = group.endsWith("Lessons");
  const isExtraGroup = group.endsWith("Extra");
  const isGenkiGroup = group.endsWith("Genki");
  const isGrammerOthersGroup = group.endsWith("Grammer Others");
  
  const isCustomHiddenAllowed = isLessonsGroup || isExtraGroup || isGenkiGroup || isGrammerOthersGroup || isOthersGroup;

  const controlsEl = document.querySelector('.hidden-categories-controls');
  if (controlsEl) {
    if (!isCustomHiddenAllowed) {
      controlsEl.style.display = "none";
    } else {
      controlsEl.style.display = "flex";
    }
  }

  if (!isCustomHiddenAllowed) {
    if (actions) actions.style.display = "none";
    return;
  }
  if (actions) actions.style.display = "flex";

  if (!currentSettings.hiddenCategories) {
    currentSettings.hiddenCategories = [];
  }
  if (!currentSettings.othersHiddenSourceGroups) {
    currentSettings.othersHiddenSourceGroups = [];
  }

  const btnSelectAll = document.getElementById('btn-hide-select-all');
  const btnSelectNone = document.getElementById('btn-hide-select-none');

  if (isOthersGroup) {
    const options = (group.startsWith("N3") || group.startsWith("N2") || group.startsWith("N1"))
      ? ["Extra", "Lesson", "Kanji"]
      : ["Extra", "Lesson", "Genki", "Kanji"];

    if (btnSelectAll) {
      btnSelectAll.onclick = (e) => {
        e.preventDefault();
        currentSettings.othersHiddenSourceGroups = [];
        saveSettings();
        renderCards();
        populateHiddenCategoriesUI();
      };
    }

    if (btnSelectNone) {
      btnSelectNone.onclick = (e) => {
        e.preventDefault();
        options.forEach(opt => {
          if (!currentSettings.othersHiddenSourceGroups.includes(opt)) {
            currentSettings.othersHiddenSourceGroups.push(opt);
          }
        });
        saveSettings();
        renderCards();
        populateHiddenCategoriesUI();
      };
    }

    options.forEach(opt => {
      const div = document.createElement('div');
      div.style.display = "flex";
      div.style.alignItems = "center";
      div.style.gap = "0.5rem";

      const cb = document.createElement('input');
      cb.type = "checkbox";
      cb.value = opt;
      cb.id = `hide-source-${opt}`;
      cb.checked = !currentSettings.othersHiddenSourceGroups.includes(opt);

      cb.addEventListener('change', () => {
        if (cb.checked) {
          currentSettings.othersHiddenSourceGroups = currentSettings.othersHiddenSourceGroups.filter(g => g !== opt);
        } else {
          if (!currentSettings.othersHiddenSourceGroups.includes(opt)) {
            currentSettings.othersHiddenSourceGroups.push(opt);
          }
        }
        saveSettings();
        renderCards();
      });

      const lbl = document.createElement('label');
      lbl.htmlFor = cb.id;
      lbl.textContent = opt;
      lbl.style.fontSize = "0.85rem";
      lbl.style.cursor = "pointer";

      div.appendChild(cb);
      div.appendChild(lbl);
      container.appendChild(div);
    });

    return;
  }

  const allCats = [];

  if (isLessonsGroup || isExtraGroup || isGenkiGroup) {
    const isShowAll = (currentSettings.currentLesson === 'Show All Words');

    let targetSuffix = "1";
    let lvl = "5";
    let startLesson = 1, endLesson = 25;
    let startExtra = 1, endExtra = 25;
    let startGenki = 1, endGenki = 12;

    if (group.startsWith("N4")) {
      targetSuffix = "2";
      lvl = "4";
      startLesson = 26; endLesson = 50;
      startExtra = 26; endExtra = 50;
      startGenki = 13; endGenki = 23;
    } else if (group.startsWith("N3")) {
      targetSuffix = "3";
      lvl = "3";
      startLesson = 51; endLesson = 75;
      startExtra = 51; endExtra = 75;
    } else if (group.startsWith("N2")) {
      targetSuffix = "4";
      lvl = "2";
      startLesson = 76; endLesson = 100;
      startExtra = 76; endExtra = 100;
    } else if (group.startsWith("N1")) {
      targetSuffix = "5";
      lvl = "1";
      startLesson = 101; endLesson = 125;
      startExtra = 101; endExtra = 125;
    }

    if (isShowAll) {
      if (isLessonsGroup) {
        for (let i = startLesson; i <= endLesson; i++) {
          allCats.push(`Lesson ${String(i).padStart(2, '0')}`);
        }
      } else if (isExtraGroup) {
        for (let i = startExtra; i <= endExtra; i++) {
          allCats.push(`Extra ${String(i).padStart(2, '0')}`);
        }
      } else if (isGenkiGroup) {
        for (let i = startGenki; i <= endGenki; i++) {
          allCats.push(`Genki ${String(i).padStart(2, '0')}`);
        }
      }
    }

    // Add Others groups custom categories for this level
    const filterOthersFn = (k) => {
      return k.endsWith(targetSuffix) && 
             !k.endsWith(` G${lvl}`) && 
             !k.endsWith(` E${lvl}`) && 
             !k.endsWith(` L${lvl}`) && 
             !k.endsWith(` D${lvl}`) && 
             !k.match(/^Lesson\s+\d+/i) && 
             !k.match(/^Kanji\s+\d+/i) && 
             !k.match(/^Grammer\s+\d+/i) && 
             !k.match(/^Extra\s+\d+/i) && 
             !k.match(/^Listening\s+\d+/i) && 
             !k.match(/^Genki\s+\d+/i) && 
             !k.match(/^N[1-5]\s+Kanji/i);
    };

    const allKeys = Object.keys(currentWordsDb).filter(k => !k.endsWith(" - Hard"));
    allKeys.forEach(k => {
      if (filterOthersFn(k) && !allCats.includes(k)) {
        allCats.push(k);
      }
    });

    if (currentSettings.customCategories) {
      currentSettings.customCategories.forEach(cat => {
        if (filterOthersFn(cat) && !allCats.includes(cat)) {
          allCats.push(cat);
        }
      });
    }
  } else if (isGrammerOthersGroup) {
    let suffix = " G5";
    if (group.startsWith("N4")) suffix = " G4";
    else if (group.startsWith("N3")) suffix = " G3";
    else if (group.startsWith("N2")) suffix = " G2";
    else if (group.startsWith("N1")) suffix = " G1";
    
    const allKeys = Object.keys(currentWordsDb).filter(k => !k.endsWith(" - Hard"));
    allKeys.forEach(k => {
      if (k.endsWith(suffix) && k !== currentSettings.currentLesson) {
        if (!allCats.includes(k)) allCats.push(k);
      }
    });

    if (currentSettings.customCategories) {
      currentSettings.customCategories.forEach(cat => {
        if (cat.endsWith(suffix) && cat !== currentSettings.currentLesson) {
          if (!allCats.includes(cat)) {
            allCats.push(cat);
          }
        }
      });
    }
  }

  // Sort categories numerically / alphabetically
  allCats.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  if (btnSelectAll) {
    btnSelectAll.onclick = (e) => {
      e.preventDefault();
      allCats.forEach(cat => {
        if (!currentSettings.hiddenCategories.includes(cat)) {
          currentSettings.hiddenCategories.push(cat);
        }
      });
      saveSettings();
      renderCards();
      populateHiddenCategoriesUI();
    };
  }

  if (btnSelectNone) {
    btnSelectNone.onclick = (e) => {
      e.preventDefault();
      currentSettings.hiddenCategories = currentSettings.hiddenCategories.filter(cat => !allCats.includes(cat));
      saveSettings();
      renderCards();
      populateHiddenCategoriesUI();
    };
  }

  allCats.forEach(cat => {
    const div = document.createElement('div');
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.gap = "0.5rem";

    const cb = document.createElement('input');
    cb.type = "checkbox";
    cb.value = cat;
    cb.id = `hide-cat-${cat.replace(/\s+/g, '-')}`;
    cb.checked = currentSettings.hiddenCategories.includes(cat);

    cb.addEventListener('change', () => {
      if (cb.checked) {
        if (!currentSettings.hiddenCategories.includes(cat)) {
          currentSettings.hiddenCategories.push(cat);
        }
      } else {
        currentSettings.hiddenCategories = currentSettings.hiddenCategories.filter(c => c !== cat);
      }
      saveSettings();
      renderCards();
    });

    const lbl = document.createElement('label');
    lbl.htmlFor = cb.id;
    lbl.textContent = cleanCategoryNameForUI(cat);
    lbl.style.fontSize = "0.85rem";
    lbl.style.cursor = "pointer";

    div.appendChild(cb);
    div.appendChild(lbl);
    container.appendChild(div);
  });
}

function getCopiedCategoriesList(word) {
  const list = [];
  if (!word || !word.japanese || !word.english) return list;

  const wordJp = word.japanese.trim();
  const wordEng = word.english.trim();

  // 1. Check custom categories
  if (currentSettings.customCategories) {
    currentSettings.customCategories.forEach(cat => {
      const normalList = currentWordsDb[cat] || [];
      const hardList = currentWordsDb[cat + " - Hard"] || [];
      
      const inNormal = normalList.some(w => w.japanese.trim() === wordJp && w.english.trim() === wordEng);
      const inHard = hardList.some(w => w.japanese.trim() === wordJp && w.english.trim() === wordEng);
      
      if (inNormal || inHard) {
        list.push(cat);
      }
    });
  }

  return list;
}

// Redraw vocabulary grid from memory state
function renderCards() {
  if (currentSettings.currentLesson !== "Search Results") {
    const selectLesson = document.getElementById('select-lesson');
    if (selectLesson) {
      for (let i = 0; i < selectLesson.options.length; i++) {
        if (selectLesson.options[i].value === "Search Results") {
          selectLesson.remove(i);
          delete currentWordsDb["Search Results"];
          delete currentWordsDb["Search Results - Hard"];
          break;
        }
      }
    }
  }

  console.log('render cards caleld');
  const container = document.getElementById('vocab-grid');
  const emptyState = document.getElementById('empty-state');
  if (!container) return;

  // Reset grid class name
  container.className = "vocab-grid";

  // Update Statistics UI
  const lessonKey = currentSettings.currentLesson;
  let normalCount = 0;
  let hardCount = 0;

  if (lessonKey === 'Show All Words' || lessonKey === 'Same Meaning' || lessonKey === 'Same Romaji') {
    normalCount = getActiveWords().length;
    hardCount = 0;
  } else {
    normalCount = currentWordsDb[lessonKey] ? currentWordsDb[lessonKey].length : 0;
    const hardKey = lessonKey + " - Hard";
    hardCount = currentWordsDb[hardKey] ? currentWordsDb[hardKey].length : 0;
  }
  const selectedCount = currentSettings.selectedWordIndices.length;

  const statLesson = document.getElementById('stat-current-lesson');
  const statTotal = document.getElementById('stat-total-words');
  const statNormal = document.getElementById('stat-normal-count');
  const statHard = document.getElementById('stat-hard-count');
  const statSelected = document.getElementById('stat-selected-count');
  const statSelectedItem = document.getElementById('stat-selected-item');

  const statLabelLesson = document.getElementById('stat-label-lesson');
  const isLesson = lessonKey.match(/^Lesson\s+\d+/i);

  if (statLabelLesson) {
    statLabelLesson.textContent = isLesson ? "Total Count:" : "Category:";
  }

  if (statLesson) {
    if (isLesson) {
      let totalLessonsWords = 0;
      for (let i = 1; i <= 25; i++) {
        const keyN = `Lesson ${String(i).padStart(2, '0')}`;
        const keyH = `${keyN} - Hard`;
        totalLessonsWords += (currentWordsDb[keyN] ? currentWordsDb[keyN].length : 0);
        totalLessonsWords += (currentWordsDb[keyH] ? currentWordsDb[keyH].length : 0);
      }
      statLesson.textContent = totalLessonsWords;
    } else {
      statLesson.textContent = cleanCategoryNameForUI(lessonKey);
    }
  }
  if (statTotal) statTotal.textContent = normalCount + hardCount;
  if (statNormal) statNormal.textContent = normalCount;
  if (statHard) statHard.textContent = hardCount;
  if (statSelected) statSelected.textContent = selectedCount;

  if (statSelectedItem) {
    if (currentSettings.isSelectionModeActive) {
      statSelectedItem.classList.remove('hidden');
    } else {
      statSelectedItem.classList.add('hidden');
    }
  }

  const isShowAll = (lessonKey === 'Show All Words');
  const isSimilar = (lessonKey === 'Similar Words');
  const isSameMeaning = (lessonKey === 'Same Meaning');
  const isSameRomaji = (lessonKey === 'Same Romaji');

  // Toggle controls display
  const toggleGroup = document.querySelector('.toggle-group');
  const managementPanel = document.querySelector('.management-panel');
  if (toggleGroup) toggleGroup.style.display = (isShowAll || isSimilar || isSameMeaning || isSameRomaji) ? 'none' : 'flex';
  if (managementPanel) managementPanel.style.display = (isShowAll || isSimilar || isSameMeaning || isSameRomaji) ? 'none' : 'flex';

  if (isSimilar) {
    if (emptyState) emptyState.classList.add('hidden');
    container.classList.remove('hidden');
    renderSimilarWordsGroups();
    return;
  }



  const words = getActiveWords();
  container.innerHTML = "";

  if (words.length === 0) {
    container.classList.add('hidden');
    emptyState.classList.remove('hidden');
    updateManagementButtons();
    return;
  }

  container.classList.remove('hidden');
  emptyState.classList.add('hidden');

  words.forEach((word, idx) => {
    const card = document.createElement('div');
    card.className = `vocab-card mode-${currentSettings.displayMode}`;
    card.setAttribute('role', 'option');
    card.setAttribute('tabindex', '0');
    card.setAttribute('data-index', idx);

    if (lessonKey !== 'Show All Words' && lessonKey !== 'Similar Words' && lessonKey !== 'Same Meaning' && lessonKey !== 'Same Romaji') {
      card.setAttribute('draggable', 'true');
      
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', idx);
        card.classList.add('dragging');
      });
      
      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        document.querySelectorAll('.vocab-card').forEach(c => c.classList.remove('drag-over'));
      });
      
      card.addEventListener('dragover', (e) => {
        e.preventDefault();
      });
      
      card.addEventListener('dragenter', (e) => {
        e.preventDefault();
        card.classList.add('drag-over');
      });
      
      card.addEventListener('dragleave', () => {
        card.classList.remove('drag-over');
      });
      
      card.addEventListener('drop', (e) => {
        e.preventDefault();
        card.classList.remove('drag-over');
        const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
        const toIdx = idx;
        if (!isNaN(fromIdx) && fromIdx !== toIdx) {
          reorderWords(fromIdx, toIdx);
        }
      });
    }

    // Set categories tooltip on hover
    const copiedCats = getCopiedCategoriesList(word);
    if (copiedCats.length > 0) {
      card.setAttribute('title', `Copied to:\n` + copiedCats.map(c => `• ${c}`).join('\n'));
      card.classList.add('atleast-one-category');
      var getEnglishWord = card.querySelector('.card-english');
      console.log('card classlist idx',idx,card.classList);
      // console.log('render cards atleast added',getEnglishWord.innerHTML);
    }
    // if (belongsToAnyCustomCategory(word)) {
    //   card.classList.add('atleast-one-category');
    // } else {
    //   card.classList.remove('atleast-one-category');
    // }
    
    // Focused State
    if (idx === currentSettings.focusedWordIndex) {
      card.classList.add('focused');
    }
    // Selected State
    if (currentSettings.selectedWordIndices.includes(idx)) {
      card.classList.add('selected');
    }

    // Kanji Presence check (red outline if Kanji is same as Japanese or missing)
    if (!word.kanji || word.kanji === word.japanese) {
      card.classList.add('no-kanji');
    } else {
      card.classList.remove('no-kanji');
    }

    // Flag Badge display
    const wKey = getWordKey(word);
    const flagCount = currentSettings.flagCounts[wKey] || 0;
    if (flagCount > 0) {
      const badge = document.createElement('div');
      badge.className = 'card-badge';
      badge.innerHTML = `
        <svg viewBox="0 0 24 24" width="10" height="10"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path></svg>
        <span>${flagCount}</span>
      `;
      card.appendChild(badge);
    }

    // Card Content elements
    const jpDiv = document.createElement('div');
    jpDiv.className = 'card-japanese';
    jpDiv.textContent = word.japanese;

    const enDiv = document.createElement('div');
    enDiv.className = 'card-english';
    enDiv.textContent = word.english;

    const romajiDiv = document.createElement('div');
    romajiDiv.className = 'card-romaji';
    romajiDiv.textContent = word.romaji;

    const kanjiDiv = document.createElement('div');
    kanjiDiv.className = 'card-kanji';
    kanjiDiv.textContent = word.kanji || word.japanese;

    card.appendChild(jpDiv);
    card.appendChild(enDiv);
    card.appendChild(romajiDiv);
    card.appendChild(kanjiDiv);

    if (currentSettings.showCategoryModeActive && !isMobileDevice()) {
      const cats = getAllCategoriesForWord(word);
      if (cats.length > 0) {
        const catsDiv = document.createElement('div');
        catsDiv.className = 'card-categories-list';
        catsDiv.innerHTML = cats.map(c => `<span class="card-category-tag">${c}</span>`).join(' ');
        card.appendChild(catsDiv);
      }
    }

    // Edit Pen Button Overlay
    const btnEdit = document.createElement('button');
    btnEdit.className = 'btn-card-edit';
    btnEdit.title = 'Edit Word';
    btnEdit.innerHTML = `
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
    `;
    btnEdit.addEventListener('click', (e) => {
      e.stopPropagation();
      openWordEditModal(currentSettings.currentLesson, idx);
    });
    card.appendChild(btnEdit);

    // Card Event Listeners
    card.addEventListener('click', (e) => {
      stopSpeech();
      handleCardClick(idx, e);
    });

    container.appendChild(card);
  });

  updateManagementButtons();
}

// Card Click selection handler
function handleCardClick(index, event) {
  const words = getActiveWords();
  if (index < 0 || index >= words.length) return;

  let selected = [...currentSettings.selectedWordIndices];

  if (currentSettings.isSelectionModeActive) {
    if (isMobileDevice()) {
      // Toggle selection on tap (mobile behaves like Ctrl+Click)
      if (selected.includes(index)) {
        selected = selected.filter(i => i !== index);
      } else {
        selected.push(index);
      }
    } else {
      // Desktop behaviors
      if (event.shiftKey) {
        if (selected.length === 0) {
          // Select range from 0 to index
          for (let i = 0; i <= index; i++) {
            selected.push(i);
          }
        } else {
          // Find closest selected index to calculate selection range
          let closestIndex = selected[0];
          let minDiff = Math.abs(index - closestIndex);
          for (let i = 1; i < selected.length; i++) {
            const diff = Math.abs(index - selected[i]);
            if (diff < minDiff) {
              minDiff = diff;
              closestIndex = selected[i];
            }
          }
          
          const start = Math.min(closestIndex, index);
          const end = Math.max(closestIndex, index);
          for (let i = start; i <= end; i++) {
            if (!selected.includes(i)) {
              selected.push(i);
            }
          }
        }
      } else if (event.ctrlKey) {
        if (selected.includes(index)) {
          selected = selected.filter(i => i !== index);
        } else {
          selected.push(index);
        }
      } else {
        selected = [index];
      }
    }
  } else {
    // Selection mode is inactive, treat as standard single click
    selected = [index];
  }

  currentSettings.selectedWordIndices = selected;
  currentSettings.focusedWordIndex = index;
  saveSettings();
  renderCards();

  // Speak Japanese of selected card
  speakText(cleanJapaneseSpeakText(words[index].japanese), 'ja');
}

// Enable/Disable reordering and list modification buttons
function updateManagementButtons() {
  const hasSelection = currentSettings.selectedWordIndices.length > 0;
  const isHardMode = currentSettings.isHard;

  document.getElementById('btn-move-to-hard').disabled = !hasSelection || isHardMode;
  document.getElementById('btn-move-to-normal').disabled = !hasSelection || !isHardMode;
  document.getElementById('btn-move-up').disabled = !hasSelection;
  document.getElementById('btn-move-down').disabled = !hasSelection;
  document.getElementById('btn-delete').disabled = !hasSelection;
  
  const btnCopyTo = document.getElementById('btn-copy-to');
  if (btnCopyTo) {
    btnCopyTo.disabled = !hasSelection;
  }
}

// ==========================================================================
// CARD NAVIGATION & ACTIONS
// ==========================================================================

// Handle keyboard arrows and card select speak
function navigateFocus(direction) {
  const words = getActiveWords();
  if (words.length === 0) return;

  stopSpeech();

  let nextIdx = currentSettings.focusedWordIndex;
  if (direction === 'next') {
    nextIdx = (nextIdx + 1) % words.length;
  } else if (direction === 'prev') {
    nextIdx = (nextIdx - 1 + words.length) % words.length;
  }

  currentSettings.focusedWordIndex = nextIdx;
  currentSettings.selectedWordIndices = [nextIdx];
  saveSettings();
  renderCards();

  // Scroll to active card
  const card = document.querySelector(`.vocab-card[data-index="${nextIdx}"]`);
  if (card) {
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    card.focus();
  }

  speakText(cleanJapaneseSpeakText(words[nextIdx].japanese), 'ja');
}

// Move selected items to Hard list
function moveSelectedToHard() {
  const selectedIdxs = [...currentSettings.selectedWordIndices].sort((a, b) => a - b);
  if (selectedIdxs.length === 0 || currentSettings.isHard) return;

  const currentKey = getActiveLessonKey();
  const targetKey = currentSettings.currentLesson + " - Hard";

  const itemsToMove = selectedIdxs.map(idx => currentWordsDb[currentKey][idx]);
  
  // Custom categories: copy instead of move
  const isCustomCategory = currentSettings.customCategories.includes(currentSettings.currentLesson);
  const isListeningGroup = (currentSettings.activeDbGroup || "").includes("Listening");
  const shouldCopy = isCustomCategory || isListeningGroup;

  if (!shouldCopy) {
    currentWordsDb[currentKey] = currentWordsDb[currentKey].filter((_, idx) => !selectedIdxs.includes(idx));
  }
  
  const uniqueItemsToMove = itemsToMove.filter(w => {
    return !currentWordsDb[targetKey].some(destWord => 
      destWord.japanese.trim() === w.japanese.trim() && 
      destWord.english.trim() === w.english.trim()
    );
  });
  currentWordsDb[targetKey].push(...uniqueItemsToMove);

  currentSettings.selectedWordIndices = [];
  currentSettings.focusedWordIndex = -1;
  saveWords();
  saveSettings();
  renderCards();
  showToast(`${shouldCopy ? 'Copied' : 'Moved'} ${selectedIdxs.length} word(s) to Hard list.`, 'success');
}

// Move selected items to Normal list
function moveSelectedToNormal() {
  const selectedIdxs = [...currentSettings.selectedWordIndices].sort((a, b) => a - b);
  if (selectedIdxs.length === 0 || !currentSettings.isHard) return;

  const currentKey = getActiveLessonKey();
  const targetKey = currentSettings.currentLesson;

  const itemsToMove = selectedIdxs.map(idx => currentWordsDb[currentKey][idx]);
  
  const isCustomCategory = currentSettings.customCategories.includes(currentSettings.currentLesson);
  const isListeningGroup = (currentSettings.activeDbGroup || "").includes("Listening");
  const shouldCopy = isCustomCategory || isListeningGroup;

  if (!shouldCopy) {
    currentWordsDb[currentKey] = currentWordsDb[currentKey].filter((_, idx) => !selectedIdxs.includes(idx));
  }
  
  const uniqueItemsToMove = itemsToMove.filter(w => {
    return !currentWordsDb[targetKey].some(destWord => 
      destWord.japanese.trim() === w.japanese.trim() && 
      destWord.english.trim() === w.english.trim()
    );
  });
  currentWordsDb[targetKey].push(...uniqueItemsToMove);

  currentSettings.selectedWordIndices = [];
  currentSettings.focusedWordIndex = -1;
  saveWords();
  saveSettings();
  renderCards();
  showToast(`${shouldCopy ? 'Copied' : 'Moved'} ${selectedIdxs.length} word(s) to Normal list.`, 'success');
}

// Move selected items UP in position (left)
function moveSelectedUp() {
  const currentKey = getActiveLessonKey();
  const list = currentWordsDb[currentKey];
  if (!list || list.length === 0) return;

  const selectedIdxs = [...currentSettings.selectedWordIndices].sort((a, b) => a - b);
  const firstSelected = selectedIdxs[0];
  if (firstSelected === 0) return; // Already at top, do nothing

  if (selectedIdxs[0] === 0) return; // Already at top, do nothing

  const selectedElements = selectedIdxs.map(idx => list[idx]);
  const unselectedElements = list.filter((_, idx) => !selectedIdxs.includes(idx));

  const insertIdx = firstSelected - 1;
  unselectedElements.splice(insertIdx, 0, ...selectedElements);
  currentWordsDb[currentKey] = unselectedElements;

  // Calculate new contiguous indices for selection
  const newSelectedIdxs = [];
  for (let i = 0; i < selectedElements.length; i++) {
    newSelectedIdxs.push(insertIdx + i);
  }

  currentSettings.selectedWordIndices = newSelectedIdxs;

  // Update selection and focus
  currentSettings.selectedWordIndices = newSelectedIdxs;
  const focusInSelected = selectedIdxs.indexOf(currentSettings.focusedWordIndex);
  if (focusInSelected !== -1) {
    currentSettings.focusedWordIndex = insertIdx + focusInSelected;
  } else {
    currentSettings.focusedWordIndex = newSelectedIdxs[0];
  }
  saveWords();
  saveSettings();
  renderCards();
}

// Move selected items DOWN in position (right)
function moveSelectedDown() {
  const currentKey = getActiveLessonKey();
  const list = currentWordsDb[currentKey];
  if (!list || list.length === 0) return;

  const selectedIdxs = [...currentSettings.selectedWordIndices].sort((a, b) => a - b);
  if (selectedIdxs.length === 0) return;

  const lastSelected = selectedIdxs[selectedIdxs.length - 1];
  if (lastSelected === list.length - 1) return; // Already at bottom, do nothing

  const selectedElements = selectedIdxs.map(idx => list[idx]);
  const unselectedElements = list.filter((_, idx) => !selectedIdxs.includes(idx));

  const insertIdx = (lastSelected + 2) - selectedIdxs.length;
  unselectedElements.splice(insertIdx, 0, ...selectedElements);
  currentWordsDb[currentKey] = unselectedElements;

  // Calculate new contiguous indices for selection
  const newSelectedIdxs = [];
  for (let i = 0; i < selectedElements.length; i++) {
    newSelectedIdxs.push(insertIdx + i);
  }

  // Update selection and focus
  currentSettings.selectedWordIndices = newSelectedIdxs;
  const focusInSelected = selectedIdxs.indexOf(currentSettings.focusedWordIndex);
  if (focusInSelected !== -1) {
    currentSettings.focusedWordIndex = insertIdx + focusInSelected;
  } else {
    currentSettings.focusedWordIndex = newSelectedIdxs[0];
  }

  saveWords();
  saveSettings();
  renderCards();
}

// Delete selected items
function deleteSelected() {
  const currentKey = getActiveLessonKey();
  const list = currentWordsDb[currentKey];
  if (!list) return;

  const selectedIdxs = [...currentSettings.selectedWordIndices].sort((a, b) => b - a);
  if (selectedIdxs.length === 0) return;

  if (confirm(`Are you sure you want to delete ${selectedIdxs.length} selected word(s)?`)) {
    selectedIdxs.forEach(idx => {
      list.splice(idx, 1);
    });

    currentSettings.selectedWordIndices = [];
    currentSettings.focusedWordIndex = -1;
    saveWords();
    saveSettings();
    renderCards();
    showToast(`Deleted ${selectedIdxs.length} word(s).`, 'success');
  }
}

// ==========================================================================
// IMPORT SYSTEM
// ==========================================================================

function triggerImport() {
  const textarea = document.getElementById('import-text');
  if (!textarea) return;

  const text = textarea.value.trim();
  if (!text) {
    showToast("Please enter vocabulary text.", "danger");
    return;
  }

  const parsed = parseWords(text);
  if (parsed.length === 0) {
    showToast("No valid vocabulary entries detected. Match 3 or 4-line format.", "danger");
    return;
  }

  const currentKey = getActiveLessonKey();
  currentWordsDb[currentKey] = currentWordsDb[currentKey].concat(parsed);

  saveWords();
  renderCards();
  closeActiveModal();
  textarea.value = "";
  showToast(`Successfully imported ${parsed.length} word(s).`, 'success');
}

// ==========================================================================
// QUIZ CONTROLLER & ENGINE
// ==========================================================================

let quizStates = [];

function startQuiz() {
  let words = [];
  const container = document.getElementById('quiz-lessons-container');
  const checkedBoxes = container ? container.querySelectorAll('input[type="checkbox"]:checked') : [];
  
  if (checkedBoxes.length > 0) {
    const isHardActive = currentSettings.isHard;
    checkedBoxes.forEach(cb => {
      const val = cb.value;
      const key = isHardActive ? `${val} - Hard` : val;
      const list = currentWordsDb[key] || [];
      list.forEach(w => {
        if (isWordVisible(w)) {
          words.push({
            japanese: w.japanese,
            english: w.english,
            romaji: w.romaji,
            kanji: w.kanji || ""
          });
        }
      });
    });
  } else {
    words = getActiveWords();
  }

  if (words.length === 0) {
    showToast("Cannot start quiz: selected lesson(s) have no words.", "danger");
    return;
  }

  const modeSelect = document.getElementById('quiz-mode-select');
  currentSettings.quizMode = modeSelect.value;

  const orderVal = document.querySelector('input[name="quiz-order"]:checked').value;
  currentSettings.quizOrder = orderVal;
  saveSettings();

  // Prepare quiz deck
  quizWords = orderVal === 'random' ? shuffleArray(words) : [...words];
  quizCurrentIndex = 0;
  quizScore = 0;
  
  // Initialize states for each question
  quizStates = quizWords.map(() => ({
    answered: false,
    userTyped: "",
    isCorrect: false
  }));

  // Handle selected card starting point if quizOrder is "original"
  if (orderVal === 'original' && currentSettings.selectedWordIndices.length > 0) {
    const activeWords = getActiveWords();
    const sortedSelIdxs = [...currentSettings.selectedWordIndices].sort((a, b) => a - b);
    const selectedWord = activeWords[sortedSelIdxs[0]];
    if (selectedWord) {
      const targetIndex = quizWords.findIndex(qw => qw.japanese === selectedWord.japanese && qw.english === selectedWord.english);
      if (targetIndex >= 0) {
        quizCurrentIndex = targetIndex;
        quizScore = targetIndex;
        for (let i = 0; i < targetIndex; i++) {
          quizStates[i] = {
            answered: true,
            userTyped: quizWords[i].japanese || "",
            isCorrect: true
          };
        }
      }
    }
  }

  // Toggle Quiz Views and Reset Navigation Controls
  document.getElementById('quiz-setup-view').classList.add('hidden');
  document.getElementById('quiz-active-view').classList.remove('hidden');

  document.getElementById('btn-quiz-prev').classList.remove('hidden');
  document.getElementById('btn-quiz-next').classList.remove('hidden');
  document.getElementById('btn-quiz-flag').classList.remove('hidden');
  document.getElementById('quiz-completion-controls').classList.add('hidden');

  showQuizQuestion();
}

function updateQuizNavigationButtons() {
  const prevBtn = document.getElementById('btn-quiz-prev');
  const nextBtn = document.getElementById('btn-quiz-next');
  if (!prevBtn || !nextBtn) return;

  prevBtn.disabled = (quizCurrentIndex === 0);

  if (quizCurrentIndex === quizWords.length - 1) {
    nextBtn.innerHTML = `
      Finish
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
    `;
    nextBtn.classList.remove('btn-accent');
    nextBtn.classList.add('btn-success');
  } else {
    nextBtn.innerHTML = `
      Next
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
    `;
    nextBtn.classList.add('btn-accent');
    nextBtn.classList.remove('btn-success');
  }
}

function cleanRomajiForMatch(str) {
  if (!str) return "";
  return str.toLowerCase().replace(/[\s\-~()]/g, '');
}

function checkRomajiMatch(typed, correct) {
  return cleanRomajiForMatch(typed) === cleanRomajiForMatch(correct);
}

function showQuizQuestion() {
  if (quizCurrentIndex >= quizWords.length) {
    finishQuiz();
    return;
  }

  const word = quizWords[quizCurrentIndex];
  const mode = currentSettings.quizMode;
  const state = quizStates[quizCurrentIndex];

  // Reset inputs & feedback DOM
  document.getElementById('quiz-typed-answer').value = state.userTyped || "";
  
  const qBox = document.querySelector('.quiz-question-box');
  const feedbackBox = document.getElementById('quiz-feedback-box');
  const inputContainer = document.getElementById('quiz-input-container');
  const btnReveal = document.getElementById('btn-quiz-reveal');
  const scoreText = document.getElementById('quiz-score-text');

  qBox.classList.add('hidden');
  feedbackBox.classList.add('hidden');
  feedbackBox.className = "quiz-feedback-box hidden";
  inputContainer.classList.add('hidden');
  btnReveal.classList.add('hidden');

  console.log('word peak:',word);

  var dataTem = getCopiedCategoriesList(word);
  console.log('data bro',dataTem);
  if(dataTem.length>0){
      qBox.classList.add('green-border-left');
  }
  else{
    qBox.classList.remove('green-border-left');
  }

  // Set Score displays
  const isWritingQuiz = ['quiz3', 'quiz4', 'quiz5', 'quiz7'].includes(mode);
  if (isWritingQuiz) {
    scoreText.classList.remove('hidden');
    scoreText.textContent = `Score: ${quizScore} / ${quizWords.length}`;
  } else {
    scoreText.classList.add('hidden');
  }

  // Update Progress DOM
  document.getElementById('quiz-progress-text').textContent = `Question ${quizCurrentIndex + 1} of ${quizWords.length}`;
  const pct = (quizCurrentIndex / quizWords.length) * 100;
  document.getElementById('quiz-progress-bar').style.width = `${pct}%`;

  // Display and trigger sound synthesis depending on Quiz mode
  const qTextEl = document.getElementById('quiz-question-text');
  qTextEl.className = "quiz-question-text";

  // Setup based on answered state
  if (state.answered) {
    // Answer Side (Only Answer is visible, Question box is hidden)
    document.getElementById('quiz-reveal-japanese').textContent = word.japanese;
    document.getElementById('quiz-reveal-english').textContent = word.english;
    document.getElementById('quiz-reveal-romaji').textContent = word.romaji;

    const feedbackTitle = document.getElementById('quiz-feedback-title');
    feedbackBox.classList.remove('hidden');
    feedbackBox.classList.add('flashcard-back-active');

    if (isWritingQuiz) {
      if (state.isCorrect) {
        feedbackBox.className = "quiz-feedback-box correct flashcard-back-active";
        feedbackTitle.textContent = "Correct!";
      } else {
        feedbackBox.className = "quiz-feedback-box incorrect flashcard-back-active";
        feedbackTitle.textContent = `Incorrect! You typed: "${state.userTyped}"`;
      }
    } else {
      feedbackBox.className = "quiz-feedback-box flashcard-back-active";
      feedbackTitle.textContent = "Answer:";
    }

    const revealRomajiSection = feedbackBox.querySelector('.reveal-romaji-section');
    if (revealRomajiSection) revealRomajiSection.style.display = "flex";
  } else {
    // Question Side (Only Question is visible, Feedback box is hidden)
    qBox.classList.remove('hidden');
    
    if (mode === 'quiz1' || mode === 'quiz3' || mode === 'quiz7') {
      // English -> Japanese/Romaji
      qTextEl.textContent = word.english;
      speakText(word.english, 'en');
    } else if (mode === 'quiz6') {
      // Romaji -> English
      qTextEl.textContent = word.romaji;
      speakText(cleanJapaneseSpeakText(word.japanese), 'ja');
    } else if (mode === 'quiz9') {
      // Kanji -> Japanese (don't read out question)
      qTextEl.textContent = word.kanji || word.japanese;
      qTextEl.classList.add('text-japanese');
    } else {
      // Japanese -> English/Romaji (Review / Writing)
      qTextEl.textContent = word.japanese;
      qTextEl.classList.add('text-japanese');
      if (mode !== 'quiz8') {
        speakText(cleanJapaneseSpeakText(word.japanese), 'ja');
      }
    }

    if (isWritingQuiz) {
      inputContainer.classList.remove('hidden');
      const input = document.getElementById('quiz-typed-answer');
      input.focus();
    } else {
      btnReveal.classList.remove('hidden');
      btnReveal.focus();
    }
  }

  const answerArea = document.querySelector('.quiz-answer-area');
  if (answerArea) {
    answerArea.style.marginBottom = state.answered ? "0px" : "";
  }

  updateQuizNavigationButtons();

  const belongs = belongsToAnyCustomCategory(word);
  if (belongs) {
    qBox.classList.add('atleast-one-category');
    feedbackBox.classList.add('atleast-one-category');
  } else {
    qBox.classList.remove('atleast-one-category');
    feedbackBox.classList.remove('atleast-one-category');
  }
}

// Speak the current quiz word Japanese audio manually
function speakCurrentQuizWord() {
  if (quizCurrentIndex >= quizWords.length) return;
  const word = quizWords[quizCurrentIndex];
  stopSpeech();
  speakText(cleanJapaneseSpeakText(word.japanese), 'ja');
}

function speakQuizAnswer() {
  if (quizCurrentIndex >= quizWords.length) return;
  const word = quizWords[quizCurrentIndex];
  const mode = currentSettings.quizMode;
  
  stopSpeech();
  
  if (mode === 'quiz1' || mode === 'quiz3' || mode === 'quiz5' || mode === 'quiz7' || mode === 'quiz8' || mode === 'quiz9') {
    speakText(cleanJapaneseSpeakText(word.japanese), 'ja');
  } else {
    speakText(word.english, 'en');
  }
}

// Reveal Answer and Validate User Entry
function checkQuizAnswer() {
  const state = quizStates[quizCurrentIndex];
  if (state.answered) return;

  const word = quizWords[quizCurrentIndex];
  const mode = currentSettings.quizMode;
  const isWritingQuiz = ['quiz3', 'quiz4', 'quiz5', 'quiz7'].includes(mode);

  let isCorrect = false;
  let userTyped = "";

  if (isWritingQuiz) {
    userTyped = document.getElementById('quiz-typed-answer').value;
    state.userTyped = userTyped;
    
    if (mode === 'quiz3') {
      isCorrect = checkJapaneseMatch(userTyped, word.japanese);
    } else if (mode === 'quiz4') {
      isCorrect = checkEnglishMatch(userTyped, word.english);
    } else if (mode === 'quiz5' || mode === 'quiz7') {
      isCorrect = checkRomajiMatch(userTyped, word.romaji);
    }

    state.isCorrect = isCorrect;
    if (isCorrect) {
      quizScore++;
    }
  }

  state.answered = true;
  showQuizQuestion();

  // If flashcard modes, speak the revealed word
  if (!isWritingQuiz) {
    if (mode === 'quiz1' || mode === 'quiz8' || mode === 'quiz9') {
      speakText(cleanJapaneseSpeakText(word.japanese), 'ja');
    } else if (mode === 'quiz2' || mode === 'quiz6') {
      speakText(word.english, 'en');
    }
  }
}

function nextQuizQuestion() {
  if (quizCurrentIndex < quizWords.length - 1) {
    quizCurrentIndex++;
    const state = quizStates[quizCurrentIndex];
    const mode = currentSettings.quizMode;
    const isWritingQuiz = ['quiz3', 'quiz4', 'quiz5', 'quiz7'].includes(mode);
    
    if (state.answered) {
      if (isWritingQuiz && state.isCorrect) {
        quizScore = Math.max(0, quizScore - 1);
      }
      state.answered = false;
    }
    
    showQuizQuestion();
  } else {
    finishQuiz();
  }
}

function prevQuizQuestion() {
  if (quizCurrentIndex > 0) {
    quizCurrentIndex--;
    const state = quizStates[quizCurrentIndex];
    const mode = currentSettings.quizMode;
    const isWritingQuiz = ['quiz3', 'quiz4', 'quiz5', 'quiz7'].includes(mode);
    
    if (state.answered) {
      if (isWritingQuiz && state.isCorrect) {
        quizScore = Math.max(0, quizScore - 1);
      }
      state.answered = false;
    }
    
    showQuizQuestion();
  }
}

function finishQuiz() {
  document.getElementById('quiz-progress-bar').style.width = '100%';
  const mode = currentSettings.quizMode;
  const isWritingQuiz = ['quiz3', 'quiz4', 'quiz5', 'quiz7'].includes(mode);

  const qTextEl = document.getElementById('quiz-question-text');
  qTextEl.className = "quiz-question-text";
  
  if (isWritingQuiz) {
    const pct = quizWords.length > 0 ? Math.round((quizScore / quizWords.length) * 100) : 0;
    qTextEl.textContent = `Quiz Complete! Score: ${quizScore}/${quizWords.length} (${pct}%)`;
  } else {
    qTextEl.textContent = "Quiz Complete!";
  }

  // Ensure the main question box is visible for completion text
  document.querySelector('.quiz-question-box').classList.remove('hidden');

  document.getElementById('quiz-feedback-box').className = "quiz-feedback-box hidden";
  document.getElementById('btn-quiz-reveal').classList.add('hidden');
  document.getElementById('quiz-input-container').classList.add('hidden');
  
  // Hide standard quiz navigation
  document.getElementById('btn-quiz-prev').classList.add('hidden');
  document.getElementById('btn-quiz-next').classList.add('hidden');
  document.getElementById('btn-quiz-flag').classList.add('hidden');

  // Show Completion Controls
  const completionControls = document.getElementById('quiz-completion-controls');
  if (completionControls) {
    completionControls.classList.remove('hidden');
    
    // Update the Toggle Difficulty button label based on current mode
    const toggleDiffBtn = document.getElementById('btn-quiz-toggle-difficulty');
    if (toggleDiffBtn) {
      toggleDiffBtn.textContent = currentSettings.isHard ? "Start Normal Quiz" : "Start Hard Quiz";
    }
  }

  showToast("Quiz completed successfully!", "success");
}

function restartCurrentQuiz() {
  startQuiz();
}

function toggleDifficultyAndQuiz() {
  currentSettings.isHard = !currentSettings.isHard;
  
  const normalRadio = document.getElementById('mode-normal');
  const hardRadio = document.getElementById('mode-hard');
  if (currentSettings.isHard) {
    if (hardRadio) hardRadio.checked = true;
  } else {
    if (normalRadio) normalRadio.checked = true;
  }
  
  currentSettings.focusedWordIndex = -1;
  currentSettings.selectedWordIndices = [];
  saveSettings();
  renderCards();
  
  startQuiz();
  showToast(`Switched category to: ${currentSettings.isHard ? 'Hard' : 'Normal'} and restarted quiz!`, 'info');
}

function startNextLessonQuiz(isNextHardMode = false) {
  const cats = getCategoriesForActiveGroup();
  const filteredCats = cats.filter(c => c !== "Show All Words" && c !== "Same Meaning" && c !== "Same Romaji" && c !== "Similar Words");
  if (filteredCats.length === 0) return;
  
  let idx = filteredCats.indexOf(currentSettings.currentLesson);
  if (idx === -1) {
    currentSettings.currentLesson = filteredCats[0];
  } else {
    idx = (idx + 1) % filteredCats.length;
    currentSettings.currentLesson = filteredCats[idx];
  }
  
  currentSettings.isHard = isNextHardMode;
  
  const selectLesson = document.getElementById('select-lesson');
  if (selectLesson) selectLesson.value = currentSettings.currentLesson;
  
  const normalRadio = document.getElementById('mode-normal');
  const hardRadio = document.getElementById('mode-hard');
  if (isNextHardMode) {
    if (hardRadio) hardRadio.checked = true;
  } else {
    if (normalRadio) normalRadio.checked = true;
  }
  
  currentSettings.focusedWordIndex = -1;
  currentSettings.selectedWordIndices = [];
  saveSettings();
  renderCards();
  
  // Re-populate the quiz checklist with the new next lesson active check
  populateQuizSetupLessons();

  startQuiz();
  showToast(`Moved to ${cleanCategoryNameForUI(currentSettings.currentLesson)} (${isNextHardMode ? 'Hard' : 'Normal'}) and started quiz!`, 'info');
}

function flagCurrentQuizWord() {
  if (quizCurrentIndex >= quizWords.length) return;
  const word = quizWords[quizCurrentIndex];
  incrementWordFlag(word);
}

// Increment flag count on word
function incrementWordFlag(word) {
  const wKey = getWordKey(word);
  if (!currentSettings.flagCounts[wKey]) {
    currentSettings.flagCounts[wKey] = 0;
  }
  currentSettings.flagCounts[wKey]++;
  saveSettings();
  renderCards();
  showToast(`Flagged word: "${word.japanese}" (${currentSettings.flagCounts[wKey]} times)`, 'info');
}

// ==========================================================================
// SYSTEM EXPORTS & CLIPBOARD SYNC
// ==========================================================================

// Reset storage cache and reload settings
function resetCache() {
  if (confirm("Warning: This will clear all local overrides and flag records. Reset local storage cache?")) {
    localStorage.removeItem('n5_words');
    localStorage.removeItem('n5_app_settings');
    window.location.reload();
  }
}

// Export the complete data package for words.js clipboard replacement
function copySettingsToClipboard() {
  stopSpeech();
  
  let clipContent = "const allWords = {};\n\n";
  for (const key in currentWordsDb) {
    if (key === 'Search Results' || key === 'Search Results - Hard') continue;
    clipContent += `allWords["${key}"] = \`${serializeWords(currentWordsDb[key])}\`;\n\n`;
  }

  // 2. Serialize current settings & stats
  clipContent += "const appSettings = " + JSON.stringify(currentSettings, null, 2) + ";\n";

  // 3. Write copy
  navigator.clipboard.writeText(clipContent)
    .then(() => {
      showToast("Configuration copied to clipboard successfully!", "success");
    })
    .catch(err => {
      console.error("Failed to copy clipboard data:", err);
      showToast("Error writing configuration copy to clipboard.", "danger");
    });
}

function copyCurrentCategoryToClipboardNewFormat() {
  stopSpeech();
  
  const cat = currentSettings.currentLesson;
  const words = getActiveWords();

  let text = "";
  words.forEach(w => {
    text += `${w.japanese}\n${w.english}\n${w.romaji}\n\n`;
  });

  text = text.trim();

  if (!text) {
    showToast("No words in this category to copy.", "warning");
    return;
  }

  navigator.clipboard.writeText(text)
    .then(() => {
      showToast(`Copied words of "${cat}" to clipboard!`, "success");
    })
    .catch(err => {
      console.error("Failed to copy words:", err);
      showToast("Error writing to clipboard.", "danger");
    });
}

function updateGroupDropdownOptionsVisibility() {
  const selectLevel = document.getElementById('select-db-level');
  const selectGroup = document.getElementById('select-db-group');
  if (!selectLevel || !selectGroup) return;

  const level = selectLevel.value;
  const genkiOpt = document.getElementById('opt-db-group-genki');
  if (genkiOpt) {
    if (level === "N5" || level === "N4") {
      genkiOpt.style.display = "block";
    } else {
      genkiOpt.style.display = "none";
      if (selectGroup.value === "Genki") {
        selectGroup.value = "Lessons";
      }
    }
  }
}

function syncSettingsDropdownsFromActiveGroup() {
  const selectLevel = document.getElementById('select-db-level');
  const selectGroup = document.getElementById('select-db-group');
  if (!selectLevel || !selectGroup) return;

  const active = currentSettings.activeDbGroup || "N5 Lessons";
  if (active === "Kanji") {
    selectGroup.value = "Kanji";
    const levelGroup = selectLevel.closest('.quiz-option-group');
    if (levelGroup) levelGroup.style.display = "none";
  } else {
    const levelGroup = selectLevel.closest('.quiz-option-group');
    if (levelGroup) levelGroup.style.display = "block";

    const parts = active.split(" ");
    const level = parts[0];
    const group = parts.slice(1).join(" ");
    selectLevel.value = level;
    selectGroup.value = group;
  }
  updateGroupDropdownOptionsVisibility();
}

function syncActiveGroupFromSettingsDropdowns() {
  const selectLevel = document.getElementById('select-db-level');
  const selectGroup = document.getElementById('select-db-group');
  if (!selectLevel || !selectGroup) return;

  updateGroupDropdownOptionsVisibility();

  const group = selectGroup.value;
  if (group === "Kanji") {
    currentSettings.activeDbGroup = "Kanji";
    const levelGroup = selectLevel.closest('.quiz-option-group');
    if (levelGroup) levelGroup.style.display = "none";
  } else {
    const levelGroup = selectLevel.closest('.quiz-option-group');
    if (levelGroup) levelGroup.style.display = "block";

    const level = selectLevel.value;
    currentSettings.activeDbGroup = `${level} ${group}`;
  }
}

// ==========================================================================
// MODAL STATE OVERLAY TOGGLES
// ==========================================================================

function openModal(modalId) {
  stopSpeech();
  document.getElementById('modal-backdrop').classList.remove('hidden');
  document.getElementById(modalId).classList.remove('hidden');
  
  if (modalId === 'modal-flagged') {
    renderFlaggedWordsList();
  } else if (modalId === 'modal-settings') {
    syncSettingsDropdownsFromActiveGroup();
    const selectGroup = document.getElementById('select-db-group');
    if (selectGroup) {
      setTimeout(() => {
        selectGroup.focus();
      }, 100);
    }
  }
}

function closeActiveModal() {
  document.getElementById('modal-backdrop').classList.add('hidden');
  document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));

  // Reset quiz panel view back to setup mode if quiz was closed
  document.getElementById('quiz-setup-view').classList.remove('hidden');
  document.getElementById('quiz-active-view').classList.add('hidden');
}

// Populate Flagged words modal interface
function renderFlaggedWordsList() {
  const container = document.getElementById('flagged-list-container');
  if (!container) return;

  container.innerHTML = "";

  // 1. Gather all words from currentWordsDb having flags > 0
  const flaggedItems = [];
  
  // Look through all lessons
  for (const lessonKey in currentWordsDb) {
    const list = currentWordsDb[lessonKey];
    list.forEach(w => {
      const wKey = getWordKey(w);
      const flags = currentSettings.flagCounts[wKey] || 0;
      if (flags > 0) {
        // Prevent duplication if the same word matches multiple instances, but check details
        const exists = flaggedItems.find(f => f.japanese === w.japanese && f.english === w.english);
        if (!exists) {
          flaggedItems.push({
            word: w,
            count: flags,
            lesson: lessonKey
          });
        }
      }
    });
  }

  // 2. Sort flagged count descending
  flaggedItems.sort((a, b) => b.count - a.count);

  if (flaggedItems.length === 0) {
    container.innerHTML = '<p class="modal-instruction">No flagged vocabulary found.</p>';
    return;
  }

  flaggedItems.forEach(item => {
    const row = document.createElement('div');
    row.className = 'flagged-row';

    const left = document.createElement('div');
    left.className = 'flagged-row-left';
    left.innerHTML = `
      <div class="japanese">${item.word.japanese}</div>
      <div class="english">${item.word.english}</div>
      <div class="romaji">${item.word.romaji} (from ${item.lesson})</div>
    `;

    const right = document.createElement('div');
    right.className = 'flagged-row-right';
    
    const countPill = document.createElement('span');
    countPill.className = 'flag-count-pill';
    countPill.textContent = `${item.count} flag(s)`;

    const btnUnflag = document.createElement('button');
    btnUnflag.className = 'btn btn-secondary btn-small';
    btnUnflag.textContent = 'Clear';
    btnUnflag.addEventListener('click', () => {
      const wKey = getWordKey(item.word);
      delete currentSettings.flagCounts[wKey];
      saveSettings();
      renderCards();
      renderFlaggedWordsList();
      showToast(`Flags cleared for "${item.word.japanese}".`, 'info');
    });

    right.appendChild(countPill);
    right.appendChild(btnUnflag);

    row.appendChild(left);
    row.appendChild(right);
    container.appendChild(row);
  });
}
// ==========================================================================
// KEYBOARD SHORTCUT HELPER FUNCTIONS
// ==========================================================================

function navigateLessonCategory(direction) {
  const selectLesson = document.getElementById('select-lesson');
  if (!selectLesson || selectLesson.options.length === 0) return;
  
  let index = selectLesson.selectedIndex;
  if (direction === 'next') {
    index = (index + 1) % selectLesson.options.length;
  } else if (direction === 'prev') {
    index = (index - 1 + selectLesson.options.length) % selectLesson.options.length;
  }
  
  const targetCategory = selectLesson.options[index].value;
  stopSpeech();
  
  currentSettings.currentLesson = targetCategory;
  currentSettings.focusedWordIndex = -1;
  currentSettings.selectedWordIndices = [];
  selectLesson.value = targetCategory;
  
  saveSettings();
  renderCards();
  showToast(`Category: ${targetCategory}`, 'info');
}

function navigateActiveGroup(direction) {
  const groups = [
    "N5 Lessons",
    "N5 Others",
    "N5 Grammer",
    "N5 Grammer Others",
    "N5 Extra",
    "N5 Listening",
    "N5 Dumps",
    "N5 Genki",
    "N4 Lessons",
    "N4 Others",
    "N4 Grammer",
    "N4 Grammer Others",
    "N4 Extra",
    "N4 Listening",
    "N4 Dumps",
    "N4 Genki",
    "N3 Lessons",
    "N3 Others",
    "N3 Grammer",
    "N3 Grammer Others",
    "N3 Extra",
    "N3 Listening",
    "N3 Dumps",
    "N2 Lessons",
    "N2 Others",
    "N2 Grammer",
    "N2 Grammer Others",
    "N2 Extra",
    "N2 Listening",
    "N2 Dumps",
    "N1 Lessons",
    "N1 Others",
    "N1 Grammer",
    "N1 Grammer Others",
    "N1 Extra",
    "N1 Listening",
    "N1 Dumps",
    "Kanji"
  ];
  
  const currentGroup = currentSettings.activeDbGroup || "N5 Lessons";
  let idx = groups.indexOf(currentGroup);
  if (idx === -1) idx = 0;
  
  if (direction === 'next') {
    idx = (idx + 1) % groups.length;
  } else if (direction === 'prev') {
    idx = (idx - 1 + groups.length) % groups.length;
  }
  
  const targetGroup = groups[idx];
  currentSettings.activeDbGroup = targetGroup;
  
  if (currentSettings.lastGroupCategories && currentSettings.lastGroupCategories[targetGroup]) {
    currentSettings.currentLesson = currentSettings.lastGroupCategories[targetGroup];
  }
  
  syncSettingsDropdownsFromActiveGroup();
  
  saveSettings();
  populateLessonsDropdown();
  renderCards();
  populateQuizSetupLessons();
  
  showToast(`Database Group: ${targetGroup}`, 'info');
}

function selectFirstNonLessonNonKanjiCategory() {
  const selectLesson = document.getElementById('select-lesson');
  if (!selectLesson) return;
  for (let i = 0; i < selectLesson.options.length; i++) {
    const val = selectLesson.options[i].value;
    const isLesson = val.match(/^Lesson\s+\d+/i);
    const isKanji = val.match(/^Kanji\s+\d+/i) || val.match(/Kanji/i);
    if (!isLesson && !isKanji) {
      stopSpeech();
      currentSettings.currentLesson = val;
      currentSettings.focusedWordIndex = -1;
      currentSettings.selectedWordIndices = [];
      selectLesson.value = val;
      saveSettings();
      renderCards();
      showToast(`Category: ${val}`, 'info');
      break;
    }
  }
}

function gotoQuestionsCategory() {
  const selectLesson = document.getElementById('select-lesson');
  if (!selectLesson) return;
  const group = currentSettings.activeDbGroup || "N5 Lessons";
  let targetSuffix = "1";
  if (group.startsWith("N4")) {
    targetSuffix = "2";
  } else if (group.startsWith("N3")) {
    targetSuffix = "3";
  }
  const targetCategory = `Questions${targetSuffix}`;
  
  let found = false;
  for (let i = 0; i < selectLesson.options.length; i++) {
    if (selectLesson.options[i].value === targetCategory) {
      found = true;
      break;
    }
  }
  
  if (found) {
    stopSpeech();
    currentSettings.currentLesson = targetCategory;
    currentSettings.focusedWordIndex = -1;
    currentSettings.selectedWordIndices = [];
    selectLesson.value = targetCategory;
    saveSettings();
    renderCards();
    showToast(`Category: ${targetCategory}`, 'info');
  } else {
    showToast(`Category "${targetCategory}" not found in active group.`, 'warning');
  }
}

function selectAllWordsInSelectionMode() {
  const activeWords = getActiveWords();
  currentSettings.selectedWordIndices = activeWords.map((_, idx) => idx);
  saveSettings();
  renderCards();
  showToast(`Selected all ${activeWords.length} words`, 'info');
}

function populateQuizSetupLessons() {
  const container = document.getElementById('quiz-lessons-container');
  if (!container) return;
  
  container.innerHTML = "";
  
  const keys = getCategoriesForActiveGroup();
  
  keys.forEach(val => {
    if (val === "Show All Words" || val === "Similar Words") return;
    
    const div = document.createElement('div');
    div.style.display = "flex";
    div.style.gap = "0.25rem";
    div.style.alignItems = "center";
    
    const isChecked = currentSettings.currentLesson === val;
    const cleanId = val.replace(/[^a-zA-Z0-9]/g, '');
    
    div.innerHTML = `
      <input type="checkbox" id="quiz-cb-${cleanId}" value="${val}" ${isChecked ? 'checked' : ''}>
      <label for="quiz-cb-${cleanId}" style="cursor:pointer; font-size: 0.9rem; color: var(--text-primary);">${cleanCategoryNameForUI(val)}</label>
    `;
    container.appendChild(div);
  });
}

function openQuizModal() {
  populateQuizSetupLessons();
  openModal('modal-quiz');
}

function navigateQuizMode(direction) {
  const modeSelect = document.getElementById('quiz-mode-select');
  if (!modeSelect) return;
  
  let idx = modeSelect.selectedIndex;
  if (direction === 'next') {
    idx = (idx + 1) % modeSelect.options.length;
  } else {
    idx = (idx - 1 + modeSelect.options.length) % modeSelect.options.length;
  }
  
  modeSelect.selectedIndex = idx;
  currentSettings.quizMode = modeSelect.value;
  saveSettings();
  
  showToast(`Selected Mode: ${modeSelect.options[idx].text}`, 'info');
}

function setQuizOrder(order) {
  const orderRadio = document.getElementById(order === 'random' ? 'order-random' : 'order-original');
  if (orderRadio) {
    orderRadio.checked = true;
    currentSettings.quizOrder = order;
    saveSettings();
    showToast(`Order set to: ${order.toUpperCase()}`, 'info');
  }
}

function toggleQuizHardMode() {
  currentSettings.isHard = !currentSettings.isHard;
  
  const normalRadio = document.getElementById('mode-normal');
  const hardRadio = document.getElementById('mode-hard');
  if (currentSettings.isHard) {
    if (hardRadio) hardRadio.checked = true;
  } else {
    if (normalRadio) normalRadio.checked = true;
  }
  
  currentSettings.focusedWordIndex = -1;
  currentSettings.selectedWordIndices = [];
  saveSettings();
  renderCards();
  
  showToast(`Toggled category to: ${currentSettings.isHard ? 'Hard' : 'Normal'}`, 'info');
}

function updateSelectionModeUI() {
  const badge = document.getElementById('selection-mode-badge');
  const toggleBtn = document.getElementById('btn-toggle-selection-mode');
  const isActive = currentSettings.isSelectionModeActive;

  if (badge) {
    if (isActive) {
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  if (toggleBtn) {
    if (isActive) {
      toggleBtn.textContent = "Disable Selection Mode";
      toggleBtn.classList.add('btn-active-selection');
    } else {
      toggleBtn.textContent = "Enable Selection Mode";
      toggleBtn.classList.remove('btn-active-selection');
    }
  }

  document.body.classList.toggle('selection-mode-active', isActive);
}

function isMobileDevice() {
  return window.innerWidth <= 768;
}

// --------------------------------------------------------------------------
// CUSTOM CATEGORIES, SIMILAR WORDS, & EDITING MANAGEMENT
// --------------------------------------------------------------------------

function populateLessonsDropdown() {
  const selectLesson = document.getElementById('select-lesson');
  if (!selectLesson) return;
  
  selectLesson.innerHTML = "";

  const group = currentSettings.activeDbGroup || "N5 Lessons";
  
  const lessonsList = [];
  const kanjiList = [];
  const grammerList = [];
  const othersList = [];
  
  const addStandard = (list, prefix, start, end) => {
    for (let i = start; i <= end; i++) {
      list.push(`${prefix} ${String(i).padStart(2, '0')}`);
    }
  };

  const addCustom = (list, suffix) => {
    const allKeys = Object.keys(currentWordsDb).filter(k => !k.endsWith(" - Hard"));
    allKeys.forEach(k => {
      if (k.endsWith(suffix)) {
        if (!list.includes(k)) list.push(k);
      }
    });
    if (currentSettings.customCategories) {
      currentSettings.customCategories.forEach(cat => {
        if (cat.endsWith(suffix)) {
          if (!list.includes(cat)) list.push(cat);
        }
      });
    }
  };

  if (group === "N5 Lessons") addStandard(lessonsList, "Lesson", 1, 25);
  else if (group === "N4 Lessons") addStandard(lessonsList, "Lesson", 26, 50);
  else if (group === "N3 Lessons") addStandard(lessonsList, "Lesson", 51, 75);
  else if (group === "N2 Lessons") addStandard(lessonsList, "Lesson", 76, 100);
  else if (group === "N1 Lessons") addStandard(lessonsList, "Lesson", 101, 125);
  
  else if (group === "N5 Grammer") addStandard(grammerList, "Grammer", 1, 25);
  else if (group === "N4 Grammer") addStandard(grammerList, "Grammer", 26, 50);
  else if (group === "N3 Grammer") addStandard(grammerList, "Grammer", 51, 75);
  else if (group === "N2 Grammer") addStandard(grammerList, "Grammer", 76, 100);
  else if (group === "N1 Grammer") addStandard(grammerList, "Grammer", 101, 125);
  
  else if (group === "N5 Grammer Others") addCustom(othersList, " G5");
  else if (group === "N4 Grammer Others") addCustom(othersList, " G4");
  else if (group === "N3 Grammer Others") addCustom(othersList, " G3");
  else if (group === "N2 Grammer Others") addCustom(othersList, " G2");
  else if (group === "N1 Grammer Others") addCustom(othersList, " G1");

  else if (group === "N5 Extra") {
    addStandard(lessonsList, "Extra", 1, 25);
    addCustom(othersList, " E5");
  } else if (group === "N4 Extra") {
    addStandard(lessonsList, "Extra", 26, 50);
    addCustom(othersList, " E4");
  } else if (group === "N3 Extra") {
    addStandard(lessonsList, "Extra", 51, 75);
    addCustom(othersList, " E3");
  } else if (group === "N2 Extra") {
    addStandard(lessonsList, "Extra", 76, 100);
    addCustom(othersList, " E2");
  } else if (group === "N1 Extra") {
    addStandard(lessonsList, "Extra", 101, 125);
    addCustom(othersList, " E1");
  }

  else if (group === "N5 Listening") {
    addStandard(lessonsList, "Listening", 1, 58);
    addCustom(othersList, " L5");
  } else if (group === "N4 Listening") {
    addStandard(lessonsList, "Listening", 59, 116);
    addCustom(othersList, " L4");
  } else if (group === "N3 Listening") {
    addStandard(lessonsList, "Listening", 117, 174);
    addCustom(othersList, " L3");
  } else if (group === "N2 Listening") {
    addStandard(lessonsList, "Listening", 175, 232);
    addCustom(othersList, " L2");
  } else if (group === "N1 Listening") {
    addStandard(lessonsList, "Listening", 233, 290);
    addCustom(othersList, " L1");
  }

  else if (group === "N5 Dumps") addCustom(othersList, " D5");
  else if (group === "N4 Dumps") addCustom(othersList, " D4");
  else if (group === "N3 Dumps") addCustom(othersList, " D3");
  else if (group === "N2 Dumps") addCustom(othersList, " D2");
  else if (group === "N1 Dumps") addCustom(othersList, " D1");

  else if (group === "N5 Genki") addStandard(lessonsList, "Genki", 1, 12);
  else if (group === "N4 Genki") addStandard(lessonsList, "Genki", 13, 23);

  else if (group.endsWith("Others")) {
    let suffix = "";
    let lvl = "";
    if (group === "N5 Others") { suffix = "1"; lvl = "5"; }
    else if (group === "N4 Others") { suffix = "2"; lvl = "4"; }
    else if (group === "N3 Others") { suffix = "3"; lvl = "3"; }
    else if (group === "N2 Others") { suffix = "4"; lvl = "2"; }
    else if (group === "N1 Others") { suffix = "5"; lvl = "1"; }

    if (suffix) {
      const filterFn = (k) => {
        return k.endsWith(suffix) && 
               !k.endsWith(` G${lvl}`) && 
               !k.endsWith(` E${lvl}`) && 
               !k.endsWith(` L${lvl}`) &&
               !k.endsWith(` D${lvl}`) &&
               !k.match(/^Lesson\s+\d+/i) && 
               !k.match(/^Kanji\s+\d+/i) && 
               !k.match(/^Grammer\s+\d+/i) && 
               !k.match(/^Extra\s+\d+/i) && 
               !k.match(/^Listening\s+\d+/i) && 
               !k.match(/^N[1-5]\s+Kanji/i);
      };

      const allKeys = Object.keys(currentWordsDb).filter(k => !k.endsWith(" - Hard"));
      allKeys.forEach(k => {
        if (filterFn(k)) {
          if (!othersList.includes(k)) othersList.push(k);
        }
      });
      if (currentSettings.customCategories) {
        currentSettings.customCategories.forEach(cat => {
          if (filterFn(cat)) {
            if (!othersList.includes(cat)) othersList.push(cat);
          }
        });
      }
    }
  }

  else if (group === "Kanji") {
    const levels = ["N5", "N4", "N3", "N2", "N1"];
    levels.forEach(lv => {
      kanjiList.push(`${lv} Kanji`);
      kanjiList.push(`${lv} Kanji New Vocab`);
      kanjiList.push(`${lv} Kanji Hard`);
    });
  }

  // Sort lists
  lessonsList.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  if (group !== "Kanji") {
    kanjiList.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  }
  grammerList.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  othersList.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

  const specialList = [];
  if (group.endsWith("Others") && !group.includes("Grammer")) {
    specialList.push("Show All Words", "Same Meaning", "Same Romaji");
  }
  const finalCategories = [...lessonsList, ...kanjiList, ...grammerList, ...othersList, ...specialList];

  finalCategories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cleanCategoryNameForUI(cat);
    selectLesson.appendChild(opt);
  });

  if (currentSettings.currentLesson) {
    if (!finalCategories.includes(currentSettings.currentLesson)) {
      currentSettings.currentLesson = finalCategories[0] || "Show All Words";
      saveSettings();
    }
    selectLesson.value = currentSettings.currentLesson;
  }

  populateHiddenCategoriesUI();
}

function createCustomCategory() {
  const group = currentSettings.activeDbGroup || "N5 Lessons";
  if (group.endsWith("Lessons") || group === "Kanji") {
    showToast("Cannot create custom categories in Lessons or Kanji groups.", "danger");
    return;
  }

  const catName = prompt(`Enter new custom category name for ${group}:`);
  if (catName === null) return;
  
  let trimmed = catName.trim();
  if (!trimmed) {
    showToast("Category name cannot be empty.", "danger");
    return;
  }
  
  let suffix = "";
  if (group === "N5 Others") suffix = " 1";
  else if (group === "N4 Others") suffix = " 2";
  else if (group === "N3 Others") suffix = " 3";
  else if (group === "N2 Others") suffix = " 4";
  else if (group === "N1 Others") suffix = " 5";
  else if (group === "N5 Grammer" || group === "N5 Grammer Others") suffix = " G5";
  else if (group === "N4 Grammer" || group === "N4 Grammer Others") suffix = " G4";
  else if (group === "N3 Grammer" || group === "N3 Grammer Others") suffix = " G3";
  else if (group === "N2 Grammer" || group === "N2 Grammer Others") suffix = " G2";
  else if (group === "N1 Grammer" || group === "N1 Grammer Others") suffix = " G1";
  else if (group === "N5 Extra") suffix = " E5";
  else if (group === "N4 Extra") suffix = " E4";
  else if (group === "N3 Extra") suffix = " E3";
  else if (group === "N2 Extra") suffix = " E2";
  else if (group === "N1 Extra") suffix = " E1";
  else if (group === "N5 Listening") suffix = " L5";
  else if (group === "N4 Listening") suffix = " L4";
  else if (group === "N3 Listening") suffix = " L3";
  else if (group === "N2 Listening") suffix = " L2";
  else if (group === "N1 Listening") suffix = " L1";
  else if (group === "N5 Dumps") suffix = " D5";
  else if (group === "N4 Dumps") suffix = " D4";
  else if (group === "N3 Dumps") suffix = " D3";
  else if (group === "N2 Dumps") suffix = " D2";
  else if (group === "N1 Dumps") suffix = " D1";
  
  if (suffix && !trimmed.endsWith(suffix)) {
    trimmed += suffix;
  }
  
  const reserved = ["Show All Words", "Similar Words", "Same Meaning", "Same Romaji"];
  if (reserved.includes(trimmed) || trimmed.startsWith("Lesson ") || trimmed.startsWith("Grammer ") || trimmed.startsWith("Kanji ") || trimmed.startsWith("Extra ") || trimmed.startsWith("Listening ") || trimmed.startsWith("Dumps ")) {
    showToast("This name is reserved or invalid.", "danger");
    return;
  }
  
  if (currentSettings.customCategories.includes(trimmed)) {
    showToast("This category already exists.", "danger");
    return;
  }

  currentSettings.customCategories.push(trimmed);
  currentWordsDb[trimmed] = [];
  currentWordsDb[trimmed + " - Hard"] = [];
  
  saveSettings();
  saveWords();
  
  // Switch group if needed
  let activeGroup = currentSettings.activeDbGroup || "N5 Lessons";
  if (activeGroup.endsWith(" Grammer")) {
    const level = activeGroup.split(" ")[0];
    const targetGroup = `${level} Grammer Others`;
    currentSettings.activeDbGroup = targetGroup;
    syncSettingsDropdownsFromActiveGroup();
  }
  
  populateLessonsDropdown();
  
  // Switch to new category
  currentSettings.currentLesson = trimmed;
  const selectLesson = document.getElementById('select-lesson');
  if (selectLesson) selectLesson.value = trimmed;
  currentSettings.focusedWordIndex = -1;
  currentSettings.selectedWordIndices = [];
  saveSettings();
  renderCards();
  
  showToast(`Created category "${trimmed}"`, 'success');
}

function openWordEditModal(lesson, index) {
  let targetWord = null;
  let sourceLesson = lesson;
  let sourceIndex = index;
  
  if (lesson === 'Same Meaning') {
    const all = getActiveWords();
    const wordToFind = all[index];
    if (!wordToFind) return;
    
    // Find in database
    for (const key in currentWordsDb) {
      const idx = currentWordsDb[key].findIndex(w => w.japanese === wordToFind.japanese && w.english === wordToFind.english);
      if (idx >= 0) {
        sourceLesson = key;
        sourceIndex = idx;
        targetWord = currentWordsDb[key][idx];
        break;
      }
    }
  } else if (lesson === 'Show All Words') {
    const all = getShowAllWords();
    const wordToFind = all[index];
    if (!wordToFind) return;
    
    // Find in database
    for (const key in currentWordsDb) {
      const idx = currentWordsDb[key].findIndex(w => w.japanese === wordToFind.japanese && w.english === wordToFind.english);
      if (idx >= 0) {
        sourceLesson = key;
        sourceIndex = idx;
        targetWord = currentWordsDb[key][idx];
        break;
      }
    }
  } else if (lesson === 'Similar Words') {
    // Similar Words can be edited too, but they live in currentSettings.similarWordGroups
    // Find group index and word index from the caller
    // E.g. index is {groupIdx: g, wordIdx: w}
    const groupIdx = index.groupIdx;
    const wordIdx = index.wordIdx;
    const group = currentSettings.similarWordGroups[groupIdx];
    if (group) {
      targetWord = group.words[wordIdx];
      sourceLesson = 'Similar Words';
      sourceIndex = JSON.stringify({ groupIdx, wordIdx });
    }
  } else {
    const listKey = getActiveLessonKey();
    targetWord = currentWordsDb[listKey] ? currentWordsDb[listKey][index] : null;
    sourceLesson = listKey;
  }
  
  if (!targetWord) return;
  
  const modal = document.getElementById('modal-edit-word');
  modal.setAttribute('data-source-lesson', sourceLesson);
  modal.setAttribute('data-source-index', String(sourceIndex));
  modal.setAttribute('data-orig-japanese', targetWord.japanese);
  modal.setAttribute('data-orig-english', targetWord.english);
  
  document.getElementById('edit-word-japanese').value = targetWord.japanese;
  document.getElementById('edit-word-romaji').value = targetWord.romaji;
  document.getElementById('edit-word-english').value = targetWord.english;
  document.getElementById('edit-word-kanji').value = targetWord.kanji || "";
  
  openModal('modal-edit-word');
  setTimeout(() => {
    const jpInput = document.getElementById('edit-word-japanese');
    if (jpInput) {
      jpInput.focus();
      jpInput.select();
    }
  }, 100);
}

function saveWordEditChanges() {
  const modal = document.getElementById('modal-edit-word');
  const origJp = modal.getAttribute('data-orig-japanese');
  const origEng = modal.getAttribute('data-orig-english');
  
  const newJp = document.getElementById('edit-word-japanese').value.trim();
  const newRomaji = document.getElementById('edit-word-romaji').value.trim();
  const newEng = document.getElementById('edit-word-english').value.trim();
  const newKanji = document.getElementById('edit-word-kanji').value.trim();
  
  if (!newJp || !newRomaji || !newEng) {
    showToast("All fields must be filled.", "danger");
    return;
  }

  // Update in all categories of currentWordsDb
  for (const key in currentWordsDb) {
    const list = currentWordsDb[key] || [];
    list.forEach(w => {
      if (w.japanese === origJp && w.english === origEng) {
        w.japanese = newJp;
        w.romaji = newRomaji;
        w.english = newEng;
        w.kanji = newKanji;
      }
    });
  }

  // Update in Similar Words groups
  if (currentSettings.similarWordGroups) {
    currentSettings.similarWordGroups.forEach(group => {
      if (group.words) {
        group.words.forEach(w => {
          if (w.japanese === origJp && w.english === origEng) {
            w.japanese = newJp;
            w.romaji = newRomaji;
            w.english = newEng;
            w.kanji = newKanji;
          }
        });
      }
    });
  }

  // Update flag counts key if changed
  const oldKey = `${origJp}::${origEng}`;
  const newKey = `${newJp}::${newEng}`;
  if (currentSettings.flagCounts && currentSettings.flagCounts[oldKey] !== undefined) {
    currentSettings.flagCounts[newKey] = currentSettings.flagCounts[oldKey];
    delete currentSettings.flagCounts[oldKey];
  }
  
  saveWords();
  saveSettings();
  
  closeActiveModal();
  renderCards();
  showToast("Saved word changes.", "success");
}

function getAutoGroup1Words() {
  const allWords = getShowAllWords();
  const meaningMap = new Map();
  
  allWords.forEach(w => {
    if (!w.english) return;
    const meanings = w.english.split(',').map(m => m.trim().toLowerCase()).filter(m => m.length > 0);
    const uniqueMeanings = [...new Set(meanings)];
    uniqueMeanings.forEach(m => {
      if (!meaningMap.has(m)) {
        meaningMap.set(m, []);
      }
      meaningMap.get(m).push(w);
    });
  });
  
  const matchedWordKeys = new Set();
  const matchedWords = [];
  
  for (const [meaning, list] of meaningMap.entries()) {
    if (list.length >= 2) {
      list.forEach(w => {
        const key = `${w.japanese.trim()}|${w.english.trim()}|${w.romaji.trim()}`;
        if (!matchedWordKeys.has(key)) {
          matchedWordKeys.add(key);
          matchedWords.push(w);
        }
      });
    }
  }
  return matchedWords;
}

function getAutoGroup2Words() {
  const allWords = getShowAllWords();
  const romajiMap = new Map();
  
  allWords.forEach(w => {
    if (!w.romaji) return;
    const r = w.romaji.trim().toLowerCase();
    if (r.length === 0) return;
    if (!romajiMap.has(r)) {
      romajiMap.set(r, []);
    }
    romajiMap.get(r).push(w);
  });
  
  const matchedWordKeys = new Set();
  const matchedWords = [];
  
  for (const [romaji, list] of romajiMap.entries()) {
    if (list.length >= 2) {
      list.forEach(w => {
        const key = `${w.japanese.trim()}|${w.english.trim()}|${w.romaji.trim()}`;
        if (!matchedWordKeys.has(key)) {
          matchedWordKeys.add(key);
          matchedWords.push(w);
        }
      });
    }
  }
  return matchedWords;
}

function renderSimilarWordsGroups() {
  const container = document.getElementById('vocab-grid');
  if (!container) return;
  
  container.className = "vocab-grid similar-groups-container";
  container.innerHTML = "";

  // 1. Create New Group button
  const actionBar = document.createElement('div');
  actionBar.className = "similar-action-bar";
  actionBar.innerHTML = `
    <button id="btn-create-similar-group" class="btn btn-primary">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      Create New Group
    </button>
  `;
  container.appendChild(actionBar);
  
  document.getElementById('btn-create-similar-group').addEventListener('click', createSimilarWordGroup);

  // 2. Render Auto Group 1
  const group1Words = getAutoGroup1Words();
  const g1Block = document.createElement('div');
  g1Block.className = "similar-group-box auto-generated-group";
  
  const g1Header = document.createElement('div');
  g1Header.className = "similar-group-header";
  g1Header.innerHTML = `
    <h3>Group 1 - Common English Meaning <span style="font-size: 0.75rem; font-weight: normal; color: var(--text-secondary); background: var(--border-color); padding: 0.2rem 0.5rem; border-radius: 4px; margin-left: 0.5rem; display: inline-block;">Read Only</span></h3>
  `;
  g1Block.appendChild(g1Header);
  
  const g1CardsContainer = document.createElement('div');
  g1CardsContainer.className = "similar-group-cards";
  if (group1Words.length === 0) {
    const p = document.createElement('p');
    p.className = "group-empty-placeholder";
    p.textContent = "No words share English meanings.";
    g1CardsContainer.appendChild(p);
  } else {
    group1Words.forEach(w => {
      const card = document.createElement('div');
      card.className = "similar-word-card read-only-word-card";
      
      const copiedCats = getCopiedCategoriesList(w);
      if (copiedCats.length > 0) {
        card.setAttribute('title', `Copied to:\n` + copiedCats.map(c => `• ${c}`).join('\n'));
        card.classList.add("atleast-one-category");
      }
      if (belongsToAnyCustomCategory(w)) {
        card.classList.add('atleast-one-category');
      }
      
      card.addEventListener('click', () => {
        speakText(cleanJapaneseSpeakText(w.japanese), 'ja');
      });
      
      let catsHtml = "";
      if (currentSettings.showCategoryModeActive && !isMobileDevice()) {
        const cats = getAllCategoriesForWord(w);
        if (cats.length > 0) {
          catsHtml = `<div class="card-categories-list">${cats.map(c => `<span class="card-category-tag">${c}</span>`).join(' ')}</div>`;
        }
      }

      card.innerHTML = `
        <div class="card-jp text-japanese">${w.japanese}</div>
        <div class="card-romaji">${w.romaji}</div>
        <div class="card-eng">${w.english}</div>
        ${catsHtml}
      `;
      g1CardsContainer.appendChild(card);
    });
  }
  g1Block.appendChild(g1CardsContainer);
  container.appendChild(g1Block);

  // 3. Render Auto Group 2
  const group2Words = getAutoGroup2Words();
  const g2Block = document.createElement('div');
  g2Block.className = "similar-group-box auto-generated-group";
  
  const g2Header = document.createElement('div');
  g2Header.className = "similar-group-header";
  g2Header.innerHTML = `
    <h3>Group 2 - Same Romanji <span style="font-size: 0.75rem; font-weight: normal; color: var(--text-secondary); background: var(--border-color); padding: 0.2rem 0.5rem; border-radius: 4px; margin-left: 0.5rem; display: inline-block;">Read Only</span></h3>
  `;
  g2Block.appendChild(g2Header);
  
  const g2CardsContainer = document.createElement('div');
  g2CardsContainer.className = "similar-group-cards";
  if (group2Words.length === 0) {
    const p = document.createElement('p');
    p.className = "group-empty-placeholder";
    p.textContent = "No words share exactly the same Romanji.";
    g2CardsContainer.appendChild(p);
  } else {
    group2Words.forEach(w => {
      const card = document.createElement('div');
      card.className = "similar-word-card read-only-word-card";
      
      const copiedCats = getCopiedCategoriesList(w);
      if (copiedCats.length > 0) {
        card.setAttribute('title', `Copied to:\n` + copiedCats.map(c => `• ${c}`).join('\n'));
        card.classList.add('atleast-one-category');
      }
      if (belongsToAnyCustomCategory(w)) {
        card.classList.add('atleast-one-category');
      }
      
      card.addEventListener('click', () => {
        speakText(cleanJapaneseSpeakText(w.japanese), 'ja');
      });
      
      let catsHtml = "";
      if (currentSettings.showCategoryModeActive && !isMobileDevice()) {
        const cats = getAllCategoriesForWord(w);
        if (cats.length > 0) {
          catsHtml = `<div class="card-categories-list">${cats.map(c => `<span class="card-category-tag">${c}</span>`).join(' ')}</div>`;
        }
      }

      card.innerHTML = `
        <div class="card-jp text-japanese">${w.japanese}</div>
        <div class="card-romaji">${w.romaji}</div>
        <div class="card-eng">${w.english}</div>
        ${catsHtml}
      `;
      g2CardsContainer.appendChild(card);
    });
  }
  g2Block.appendChild(g2CardsContainer);
  container.appendChild(g2Block);

  // 4. Render User Groups (from Group 3 onward)
  const groups = currentSettings.similarWordGroups || [];
  groups.forEach((group, gIdx) => {
    const groupBlock = document.createElement('div');
    groupBlock.className = "similar-group-box";
    groupBlock.setAttribute('data-group-index', gIdx);
    
    // Drag & Drop Zone for User Groups
    groupBlock.addEventListener('dragover', (e) => {
      e.preventDefault();
      groupBlock.classList.add('drag-over');
    });
    
    groupBlock.addEventListener('dragleave', () => {
      groupBlock.classList.remove('drag-over');
    });
    
    groupBlock.addEventListener('drop', (e) => {
      e.preventDefault();
      groupBlock.classList.remove('drag-over');
      const dataStr = e.dataTransfer.getData('text/plain');
      if (dataStr) {
        try {
          const dragData = JSON.parse(dataStr);
          const fromGroupIdx = dragData.groupIdx;
          const fromWordIdx = dragData.wordIdx;
          
          if (fromGroupIdx !== undefined && fromWordIdx !== undefined) {
            if (fromGroupIdx === gIdx) return;
            
            const word = currentSettings.similarWordGroups[fromGroupIdx].words[fromWordIdx];
            currentSettings.similarWordGroups[fromGroupIdx].words.splice(fromWordIdx, 1);
            currentSettings.similarWordGroups[gIdx].words.push(word);
            
            saveSettings();
            renderCards();
          }
        } catch(err) {
          console.error("Drop error", err);
        }
      }
    });

    // Group Header (Starts at Group 3)
    const header = document.createElement('div');
    header.className = "similar-group-header";
    header.innerHTML = `
      <h3>Group ${gIdx + 3}</h3>
      <button class="btn-delete-group btn btn-danger btn-small" title="Delete Group">&times;</button>
    `;
    
    header.querySelector('.btn-delete-group').addEventListener('click', () => {
      if (confirm(`Are you sure you want to delete Group ${gIdx + 3}?`)) {
        currentSettings.similarWordGroups.splice(gIdx, 1);
        saveSettings();
        renderCards();
      }
    });
    
    groupBlock.appendChild(header);

    // Group Cards Container
    const cardsContainer = document.createElement('div');
    cardsContainer.className = "similar-group-cards";
    
    if (group.words.length === 0) {
      const p = document.createElement('p');
      p.className = "group-empty-placeholder";
      p.textContent = "Drag words here or select words and press 'S' to add.";
      cardsContainer.appendChild(p);
    } else {
      group.words.forEach((w, wIdx) => {
        const card = document.createElement('div');
        card.className = "similar-word-card";
        card.setAttribute('draggable', 'true');
        
        const copiedCats = getCopiedCategoriesList(w);
        if (copiedCats.length > 0) {
          card.setAttribute('title', `Copied to:\n` + copiedCats.map(c => `• ${c}`).join('\n'));
          card.classList.add('atleast-one-category');
        }
        if (belongsToAnyCustomCategory(w)) {
          card.classList.add('atleast-one-category');
        }
        
        card.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', JSON.stringify({
            groupIdx: gIdx,
            wordIdx: wIdx
          }));
          card.classList.add('dragging');
        });
        
        card.addEventListener('dragend', () => {
          card.classList.remove('dragging');
        });

        card.addEventListener('click', () => {
          speakText(cleanJapaneseSpeakText(w.japanese), 'ja');
        });

      let catsHtml = "";
      if (currentSettings.showCategoryModeActive && !isMobileDevice()) {
        const cats = getAllCategoriesForWord(w);
        if (cats.length > 0) {
          catsHtml = `<div class="card-categories-list">${cats.map(c => `<span class="card-category-tag">${c}</span>`).join(' ')}</div>`;
        }
      }

      card.innerHTML = `
        <div class="card-jp text-japanese">${w.japanese}</div>
        <div class="card-romaji">${w.romaji}</div>
        <div class="card-eng">${w.english}</div>
        ${catsHtml}
        <button class="btn-card-edit atleast-one-category" title="Edit Word" style="top: 4px; right: 24px; opacity: 1;">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </button>
        <button class="btn-remove-from-group" title="Remove Word">&times;</button>
      `;
        
        card.querySelector('.btn-card-edit').addEventListener('click', (e) => {
          e.stopPropagation();
          openWordEditModal('Similar Words', { groupIdx: gIdx, wordIdx: wIdx });
        });

        card.querySelector('.btn-remove-from-group').addEventListener('click', (e) => {
          e.stopPropagation();
          group.words.splice(wIdx, 1);
          saveSettings();
          renderCards();
        });
        
        cardsContainer.appendChild(card);
      });
    }
    
    groupBlock.appendChild(cardsContainer);
    container.appendChild(groupBlock);
  });
}

function getSameMeaningWords() {
  if (sameMeaningWordsCache) {
    return sameMeaningWordsCache;
  }
  const allWords = getShowAllWords();
  
  const meaningMap = new Map();
  const origMeaningMap = new Map();

  allWords.forEach(w => {
    if (!w.english) return;
    const parts = w.english.split(',').map(m => m.trim()).filter(m => m.length > 0);
    parts.forEach(p => {
      const sanitized = p.toLowerCase().replace(/[^a-z0-9\-]/g, '');
      if (sanitized.length > 0) {
        if (!meaningMap.has(sanitized)) {
          meaningMap.set(sanitized, []);
          origMeaningMap.set(sanitized, p);
        }
        meaningMap.get(sanitized).push(w);
      }
    });
  });

  const validSanitizedKeys = [];
  for (const [sanitized, wordsList] of meaningMap.entries()) {
    if (wordsList.length > 1) {
      validSanitizedKeys.push(sanitized);
    }
  }

  validSanitizedKeys.sort((a, b) => {
    const origA = origMeaningMap.get(a);
    const origB = origMeaningMap.get(b);
    return origA.localeCompare(origB, undefined, { sensitivity: 'base' });
  });

  const resultWords = [];
  validSanitizedKeys.forEach(sanitized => {
    const wordsList = meaningMap.get(sanitized);
    wordsList.forEach(w => {
      resultWords.push(w);
    });
  });

  sameMeaningWordsCache = resultWords;
  sameMeaningWordsKeysCache = new Set(resultWords.map(w => `${w.japanese.trim()}::${w.english.trim()}`));
  return resultWords;
}

function getSameRomajiWords() {
  if (sameRomajiWordsCache) {
    return sameRomajiWordsCache;
  }
  const allWords = getShowAllWords();
  
  const romajiMap = new Map();
  const origRomajiMap = new Map();

  allWords.forEach(w => {
    if (!w.romaji) return;
    const r = w.romaji.trim();
    const sanitized = r.toLowerCase().replace(/[^a-z0-9\-]/g, '');
    if (sanitized.length > 0) {
      if (!romajiMap.has(sanitized)) {
        romajiMap.set(sanitized, []);
        origRomajiMap.set(sanitized, r);
      }
      romajiMap.get(sanitized).push(w);
    }
  });

  const validSanitizedKeys = [];
  for (const [sanitized, wordsList] of romajiMap.entries()) {
    if (wordsList.length > 1) {
      validSanitizedKeys.push(sanitized);
    }
  }

  validSanitizedKeys.sort((a, b) => {
    const origA = origRomajiMap.get(a);
    const origB = origRomajiMap.get(b);
    return origA.localeCompare(origB, undefined, { sensitivity: 'base' });
  });

  const resultWords = [];
  validSanitizedKeys.forEach(sanitized => {
    const wordsList = romajiMap.get(sanitized);
    wordsList.forEach(w => {
      resultWords.push(w);
    });
  });

  sameRomajiWordsCache = resultWords;
  sameRomajiWordsKeysCache = new Set(resultWords.map(w => `${w.japanese.trim()}::${w.english.trim()}`));
  return resultWords;
}

function createSimilarWordGroup() {
  if (!currentSettings.similarWordGroups) currentSettings.similarWordGroups = [];
  currentSettings.similarWordGroups.push({
    words: []
  });
  saveSettings();
  renderCards();
  showToast("Created similar word group.", "success");
}

let wordsToCopy = [];

function openCategorySelectorModal(customWordsList = null) {
  if (customWordsList && Array.isArray(customWordsList)) {
    wordsToCopy = customWordsList;
  } else {
    const words = getActiveWords();
    wordsToCopy = currentSettings.selectedWordIndices.map(idx => words[idx]);
  }

  if (wordsToCopy.length === 0) {
    showToast("Please select words to copy first.", "info");
    return;
  }
  
  const selectDest = document.getElementById('select-copy-destination');
  if (!selectDest) return;
  
  selectDest.innerHTML = "";
  
  const currentL = currentSettings.currentLesson;
  
  const group = currentSettings.activeDbGroup || "N5 Lessons";
  let targetSuffix = "1";
  if (group.startsWith("N4")) {
    targetSuffix = "2";
  } else if (group.startsWith("N3")) {
    targetSuffix = "3";
  }

  const targetCats = [];

  const addStandard = (prefix, start, end) => {
    for (let i = start; i <= end; i++) {
      const name = `${prefix} ${String(i).padStart(2, '0')}`;
      if (name !== currentL && !targetCats.includes(name)) {
        targetCats.push(name);
      }
    }
  };

  const addCustom = (suffix) => {
    const allKeys = Object.keys(currentWordsDb).filter(k => !k.endsWith(" - Hard"));
    allKeys.forEach(k => {
      if (k.endsWith(suffix) && k !== currentL && !targetCats.includes(k)) {
        targetCats.push(k);
      }
    });
    if (currentSettings.customCategories) {
      currentSettings.customCategories.forEach(cat => {
        if (cat.endsWith(suffix) && cat !== currentL && !targetCats.includes(cat)) {
          targetCats.push(cat);
        }
      });
    }
  };

  if (group.includes("Grammer")) {
    let suffix = " G5";
    if (group.startsWith("N4")) suffix = " G4";
    else if (group.startsWith("N3")) suffix = " G3";
    else if (group.startsWith("N2")) suffix = " G2";
    else if (group.startsWith("N1")) suffix = " G1";
    addCustom(suffix);
  } else {
    // Except "Grammer" and "Grammer Others" categories, allow copy words to "Others" categories
    // For Kanji Group, if category name contains N5, show "N5 Others" categories, lly N4..N1
    let targetSuffix = "1";
    let lvl = "5";

    if (group === "Kanji") {
      if (currentL.includes("N4")) { targetSuffix = "2"; lvl = "4"; }
      else if (currentL.includes("N3")) { targetSuffix = "3"; lvl = "3"; }
      else if (currentL.includes("N2")) { targetSuffix = "4"; lvl = "2"; }
      else if (currentL.includes("N1")) { targetSuffix = "5"; lvl = "1"; }
      else { targetSuffix = "1"; lvl = "5"; }
    } else {
      if (group.startsWith("N4")) { targetSuffix = "2"; lvl = "4"; }
      else if (group.startsWith("N3")) { targetSuffix = "3"; lvl = "3"; }
      else if (group.startsWith("N2")) { targetSuffix = "4"; lvl = "2"; }
      else if (group.startsWith("N1")) { targetSuffix = "5"; lvl = "1"; }
      else { targetSuffix = "1"; lvl = "5"; }
    }

    const filterFn = (k) => {
      return k.endsWith(targetSuffix) && 
             !k.endsWith(` G${lvl}`) && 
             !k.endsWith(` E${lvl}`) && 
             !k.endsWith(` L${lvl}`) && 
             !k.endsWith(` D${lvl}`) && 
             !k.match(/^Lesson\s+\d+/i) && 
             !k.match(/^Kanji\s+\d+/i) && 
             !k.match(/^Grammer\s+\d+/i) && 
             !k.match(/^Extra\s+\d+/i) && 
             !k.match(/^Listening\s+\d+/i) && 
             !k.match(/^Genki\s+\d+/i) && 
             !k.match(/^N[1-5]\s+Kanji/i);
    };

    const allKeys = Object.keys(currentWordsDb).filter(k => !k.endsWith(" - Hard"));
    allKeys.forEach(k => {
      if (filterFn(k) && k !== "Same Meaning" && k !== "Same Romaji" && k !== "Show All Words" && k !== currentL && !targetCats.includes(k)) {
        targetCats.push(k);
      }
    });
    if (currentSettings.customCategories) {
      currentSettings.customCategories.forEach(cat => {
        if (filterFn(cat) && cat !== "Same Meaning" && cat !== "Same Romaji" && cat !== "Show All Words" && cat !== currentL && !targetCats.includes(cat)) {
          targetCats.push(cat);
        }
      });
    }
  }



  targetCats.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

  targetCats.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cleanCategoryNameForUI(cat);
    selectDest.appendChild(opt);
  });
  
  // Set default selection to last used destination category, otherwise first available
  const lastDest = currentSettings.lastDestCategory;
  if (lastDest && Array.from(selectDest.options).some(opt => opt.value === lastDest)) {
    selectDest.value = lastDest;
  } else if (selectDest.options.length > 0) {
    selectDest.value = selectDest.options[0].value;
  }
  
  openModal('modal-category-selector');
  setTimeout(() => {
    const dropdown = document.getElementById('select-copy-destination');
    if (dropdown) {
      dropdown.focus();
    }
  }, 100);
}

function executeCategoryWordCopy() {
  const selectDest = document.getElementById('select-copy-destination');
  if (!selectDest) return;
  
  const destCategory = selectDest.value;
  currentSettings.lastDestCategory = destCategory;
  saveSettings();
  if (wordsToCopy.length === 0) return;
  
  // Always copy the Normal version of the word (never the Hard version)
  const targetKey = destCategory;
  
  if (!currentWordsDb[targetKey]) currentWordsDb[targetKey] = [];

  console.log('wrodstOCopy:',wordsToCopy);
  
  let copiedCount = 0;
  // Copy words (clone objects to prevent reference conflicts, ensuring no duplicates)
  wordsToCopy.forEach(w => {
    if (!w) return;
    const isDuplicate = currentWordsDb[targetKey].some(destWord => 
      destWord.japanese.trim() === w.japanese.trim() && 
      destWord.english.trim() === w.english.trim()
    );
    if (!isDuplicate) {
      currentWordsDb[targetKey].push({
        japanese: w.japanese,
        english: w.english,
        romaji: w.romaji,
        kanji: w.kanji || ""
      });
      copiedCount++;
    }
  });
  
  saveWords();
  
  // Clean selections
  currentSettings.selectedWordIndices = [];
  currentSettings.focusedWordIndex = -1;
  saveSettings();
  
  closeActiveModal();
  renderCards();
  if (copiedCount > 0) {
    showToast(`Copied ${copiedCount} words to ${destCategory} (Normal)`, 'success');
  } else {
    showToast(`All words already exist in ${destCategory}.`, 'info');
  }
}

function openSimilarGroupSelectorModal(customWordsList = null) {
  if (customWordsList && Array.isArray(customWordsList)) {
    wordsToCopy = customWordsList;
  } else {
    const words = getActiveWords();
    wordsToCopy = currentSettings.selectedWordIndices.map(idx => words[idx]);
  }

  if (wordsToCopy.length === 0) {
    showToast("Please select words to copy first.", "info");
    return;
  }
  
  const groups = currentSettings.similarWordGroups || [];
  if (groups.length === 0) {
    createSimilarWordGroup();
  }
  
  const selectDest = document.getElementById('select-similar-group-dest');
  if (!selectDest) return;
  
  selectDest.innerHTML = "";
  currentSettings.similarWordGroups.forEach((g, gIdx) => {
    const opt = document.createElement('option');
    opt.value = gIdx;
    opt.textContent = `Group ${gIdx + 3}`;
    selectDest.appendChild(opt);
  });

  // Automatically select the last group
  if (currentSettings.similarWordGroups.length > 0) {
    selectDest.value = currentSettings.similarWordGroups.length - 1;
  }
  
  openModal('modal-group-selector');
  setTimeout(() => {
    selectDest.focus();
  }, 100);
}

function executeSimilarGroupWordCopy() {
  const selectDest = document.getElementById('select-similar-group-dest');
  if (!selectDest) return;
  
  const targetGroupIdx = parseInt(selectDest.value, 10);
  if (wordsToCopy.length === 0) return;
  
  const targetGroup = currentSettings.similarWordGroups[targetGroupIdx];
  let copiedCount = 0;
  if (targetGroup) {
    wordsToCopy.forEach(w => {
      const isDuplicate = (targetGroup.words || []).some(destWord => 
        destWord.japanese.trim() === w.japanese.trim() && 
        destWord.english.trim() === w.english.trim()
      );
      if (!isDuplicate) {
        targetGroup.words.push({
          japanese: w.japanese,
          english: w.english,
          romaji: w.romaji,
          kanji: w.kanji || ""
        });
        copiedCount++;
      }
    });
    
    saveSettings();
  }
  
  currentSettings.selectedWordIndices = [];
  currentSettings.focusedWordIndex = -1;
  saveSettings();
  
  closeActiveModal();
  renderCards();
  if (copiedCount > 0) {
    showToast(`Copied ${copiedCount} words to Group ${targetGroupIdx + 3}`, 'success');
  } else {
    showToast(`All words already exist in Group ${targetGroupIdx + 3}.`, 'info');
  }
}

let activeCategoryJumpIndex = -1;
let categoryJumpMatches = [];

function getAllAppCategories() {
  const cats = [];
  const added = new Set();
  
  for (const key in currentWordsDb) {
    if (key === "Search Results" || key === "Search Results - Hard") continue;
    const baseKey = key.endsWith(" - Hard") ? key.replace(" - Hard", "") : key;
    if (!added.has(baseKey)) {
      added.add(baseKey);
      cats.push({
        name: baseKey,
        group: determineGroupForCategory(baseKey)
      });
    }
  }

  if (currentSettings.customCategories) {
    currentSettings.customCategories.forEach(cat => {
      if (!added.has(cat)) {
        added.add(cat);
        cats.push({
          name: cat,
          group: determineGroupForCategory(cat)
        });
      }
    });
  }

  cats.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
  return cats;
}

function initCategoryJump() {
  const jumpInput = document.getElementById('category-jump-input');
  const jumpResults = document.getElementById('category-jump-results');
  if (!jumpInput || !jumpResults) return;

  jumpInput.addEventListener('input', () => {
    const query = jumpInput.value.trim().toLowerCase();
    const allCats = getAllAppCategories();
    activeCategoryJumpIndex = -1;

    if (query.length > 0) {
      categoryJumpMatches = allCats.filter(c => c.name.toLowerCase().includes(query));
    } else {
      categoryJumpMatches = allCats;
    }
    
    renderCategoryJumpResults();
  });

  jumpInput.addEventListener('keydown', (e) => {
    const rows = jumpResults.querySelectorAll('.category-jump-row');
    
    if (e.key === 'Escape') {
      e.preventDefault();
      closeActiveModal();
      return;
    }

    if (rows.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeCategoryJumpIndex++;
      if (activeCategoryJumpIndex >= rows.length) {
        activeCategoryJumpIndex = rows.length - 1;
      }
      updateCategoryJumpHighlight(rows);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeCategoryJumpIndex--;
      if (activeCategoryJumpIndex < 0) {
        activeCategoryJumpIndex = -1;
      }
      updateCategoryJumpHighlight(rows);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      let selectedCat = null;
      if (activeCategoryJumpIndex >= 0 && activeCategoryJumpIndex < categoryJumpMatches.length) {
        selectedCat = categoryJumpMatches[activeCategoryJumpIndex];
      } else if (categoryJumpMatches.length > 0) {
        selectedCat = categoryJumpMatches[0];
      }
      if (selectedCat) {
        jumpToCategory(selectedCat.name);
        closeActiveModal();
      }
    }
  });

  function updateCategoryJumpHighlight(rows) {
    rows.forEach((r, idx) => {
      if (idx === activeCategoryJumpIndex) {
        r.classList.add('selected');
        r.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        r.classList.remove('selected');
      }
    });
  }
}

function renderCategoryJumpResults() {
  const jumpResults = document.getElementById('category-jump-results');
  if (!jumpResults) return;
  jumpResults.innerHTML = "";

  if (categoryJumpMatches.length === 0) {
    jumpResults.innerHTML = '<div style="padding: 0.6rem 0.8rem; font-size: 0.9rem; color: var(--text-secondary); text-align: center;">No matches found.</div>';
    return;
  }

  const sliced = categoryJumpMatches.slice(0, 30);
  sliced.forEach((item, idx) => {
    const row = document.createElement('div');
    row.className = 'category-jump-row';
    if (idx === activeCategoryJumpIndex) {
      row.classList.add('selected');
    }
    row.innerHTML = `
      <span>${item.name}</span>
      <span class="group-tag">${item.group}</span>
    `;

    row.addEventListener('click', () => {
      jumpToCategory(item.name);
      closeActiveModal();
    });

    jumpResults.appendChild(row);
  });
}

function openCategoryJumpModal() {
  const jumpInput = document.getElementById('category-jump-input');
  if (jumpInput) {
    jumpInput.value = "";
  }
  activeCategoryJumpIndex = -1;
  categoryJumpMatches = getAllAppCategories();
  renderCategoryJumpResults();
  
  openModal('modal-category-jump');
  setTimeout(() => {
    if (jumpInput) {
      jumpInput.focus();
      jumpInput.select();
    }
  }, 100);
}

function jumpToCategory(categoryName) {
  stopSpeech();
  
  const targetGroup = determineGroupForCategory(categoryName);
  
  if (targetGroup !== currentSettings.activeDbGroup) {
    currentSettings.activeDbGroup = targetGroup;
    syncSettingsDropdownsFromActiveGroup();
    populateLessonsDropdown();
    populateQuizSetupLessons();
  }

  currentSettings.currentLesson = categoryName;
  currentSettings.focusedWordIndex = -1;
  currentSettings.selectedWordIndices = [];
  
  if (!currentSettings.lastGroupCategories) {
    currentSettings.lastGroupCategories = {};
  }
  currentSettings.lastGroupCategories[targetGroup] = categoryName;

  const selectLesson = document.getElementById('select-lesson');
  if (selectLesson) {
    selectLesson.value = categoryName;
  }

  saveSettings();
  renderCards();
  
  showToast(`Jumped to: ${categoryName} (${targetGroup})`, 'info');
}

// --------------------------------------------------------------------------
// GLOBAL SEARCH KEYBOARD NAVIGATION & IMPROVEMENTS
// --------------------------------------------------------------------------

function determineGroupForCategory(lessonKey) {
  const isHardWord = lessonKey.endsWith(" - Hard");
  const baseKey = isHardWord ? lessonKey.replace(" - Hard", "") : lessonKey;
  
  if (baseKey.match(/^Lesson\s+(\d+)/i)) {
    const num = parseInt(baseKey.match(/^Lesson\s+(\d+)/i)[1], 10);
    if (num >= 1 && num <= 25) return "N5 Lessons";
    if (num >= 26 && num <= 50) return "N4 Lessons";
    if (num >= 51 && num <= 75) return "N3 Lessons";
    if (num >= 76 && num <= 100) return "N2 Lessons";
    if (num >= 101 && num <= 125) return "N1 Lessons";
  } else if (baseKey.match(/^Kanji\s+(\d+)/i)) {
    const num = parseInt(baseKey.match(/^Kanji\s+(\d+)/i)[1], 10);
    if (num >= 1 && num <= 20) return "N5 Kanji";
    if (num === 21) return "N4 Kanji";
    if (num >= 41 && num <= 60) return "N3 Kanji";
  } else if (baseKey.match(/^Grammer\s+(\d+)/i)) {
    const num = parseInt(baseKey.match(/^Grammer\s+(\d+)/i)[1], 10);
    if (num >= 1 && num <= 25) return "N5 Grammer";
    if (num >= 26 && num <= 50) return "N4 Grammer";
    if (num >= 51 && num <= 75) return "N3 Grammer";
    if (num >= 76 && num <= 100) return "N2 Grammer";
    if (num >= 101 && num <= 125) return "N1 Grammer";
  } else if (baseKey.match(/^Extra\s+(\d+)/i)) {
    const num = parseInt(baseKey.match(/^Extra\s+(\d+)/i)[1], 10);
    if (num >= 1 && num <= 25) return "N5 Extra";
    if (num >= 26 && num <= 50) return "N4 Extra";
    if (num >= 51 && num <= 75) return "N3 Extra";
    if (num >= 76 && num <= 100) return "N2 Extra";
    if (num >= 101 && num <= 125) return "N1 Extra";
  } else if (baseKey.match(/^Listening\s+(\d+)/i)) {
    const num = parseInt(baseKey.match(/^Listening\s+(\d+)/i)[1], 10);
    if (num >= 1 && num <= 58) return "N5 Listening";
    if (num >= 59 && num <= 116) return "N4 Listening";
    if (num >= 117 && num <= 174) return "N3 Listening";
    if (num >= 175 && num <= 232) return "N2 Listening";
    if (num >= 233 && num <= 290) return "N1 Listening";
  } else if (baseKey.match(/^Genki\s+(\d+)/i)) {
    const num = parseInt(baseKey.match(/^Genki\s+(\d+)/i)[1], 10);
    if (num >= 1 && num <= 12) return "N5 Genki";
    if (num >= 13 && num <= 23) return "N4 Genki";
  } else if (baseKey.match(/^(N[1-5])\s+Kanji/i)) {
    return "Kanji";
  } else {
    if (baseKey.endsWith(" G5")) return "N5 Grammer Others";
    if (baseKey.endsWith(" G4")) return "N4 Grammer Others";
    if (baseKey.endsWith(" G3")) return "N3 Grammer Others";
    if (baseKey.endsWith(" G2")) return "N2 Grammer Others";
    if (baseKey.endsWith(" G1")) return "N1 Grammer Others";
    if (baseKey.endsWith(" E5")) return "N5 Extra";
    if (baseKey.endsWith(" E4")) return "N4 Extra";
    if (baseKey.endsWith(" E3")) return "N3 Extra";
    if (baseKey.endsWith(" E2")) return "N2 Extra";
    if (baseKey.endsWith(" E1")) return "N1 Extra";
    if (baseKey.endsWith(" L5")) return "N5 Listening";
    if (baseKey.endsWith(" L4")) return "N4 Listening";
    if (baseKey.endsWith(" L3")) return "N3 Listening";
    if (baseKey.endsWith(" L2")) return "N2 Listening";
    if (baseKey.endsWith(" L1")) return "N1 Listening";
    if (baseKey.endsWith("1")) return "N5 Others";
    if (baseKey.endsWith("2")) return "N4 Others";
    if (baseKey.endsWith("3")) return "N3 Others";
    if (baseKey.endsWith("4")) return "N2 Others";
    if (baseKey.endsWith("5")) return "N1 Others";
  }
  return "N5 Lessons";
}

let activeSearchResultIndex = -1;

function initGlobalSearch() {
  const searchInput = document.getElementById('global-search-input');
  const searchResults = document.getElementById('search-results-dropdown');
  const btnClear = document.getElementById('btn-clear-search');
  if (!searchInput || !searchResults) return;

  searchInput.addEventListener('input', (e) => {
    const rawVal = e.target.value;
    localStorage.setItem('n5_search_term', rawVal);
    const query = rawVal.trim().toLowerCase();
    activeSearchResultIndex = -1;
    
    if (query.length > 0) {
      if (btnClear) btnClear.classList.remove('hidden');
      searchResults.classList.remove('hidden');
      
      const currentL = currentSettings.currentLesson;
      const currentLHard = currentL + " - Hard";

      const group1 = []; // current category
      const group2 = []; // exact match
      const group3 = []; // partial match
      
      for (const lessonKey in currentWordsDb) {
        if (lessonKey === "Search Results" || lessonKey === "Search Results - Hard") continue;
        const list = currentWordsDb[lessonKey];
        const isCurrentCat = (lessonKey === currentL || lessonKey === currentLHard);

        list.forEach(w => {
          const engLower = w.english.toLowerCase();
          const romajiLower = w.romaji.toLowerCase();
          const jpLower = w.japanese.toLowerCase();

          const engMatch = engLower.includes(query);
          const romajiMatch = romajiLower.includes(query);
          const jpMatch = jpLower.includes(query);

          if (engMatch || romajiMatch || jpMatch) {
            const isExact = (engLower === query || romajiLower === query || jpLower === query);
            const item = {
              word: w,
              lessonKey: lessonKey
            };
            if (isCurrentCat) {
              group1.push(item);
            } else if (isExact) {
              group2.push(item);
            } else {
              group3.push(item);
            }
          }
        });
      }

      const results = [...group1, ...group2, ...group3];
      
      // Render results
      searchResults.innerHTML = "";
      if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-no-results">No matches found.</div>';
      } else {
        // Limit to 20 results
        const sliced = results.slice(0, 20);
        sliced.forEach(res => {
          const row = document.createElement('div');
          row.className = 'search-result-row';
          
          // Display Lesson and category
          const isHardWord = res.lessonKey.endsWith(" - Hard");
          const lessonBase = isHardWord ? res.lessonKey.replace(" - Hard", "") : res.lessonKey;
          const categoryName = isHardWord ? "Hard" : "Normal";
          
          row.innerHTML = `
            <div class="search-result-meta">
              <span>${lessonBase}</span>
              <span>${categoryName}</span>
            </div>
            <div class="search-result-text">
              <span class="jp">${res.word.japanese}</span>
              <span>${res.word.english}</span>
              <span class="romaji">${res.word.romaji}</span>
            </div>
          `;
          
          row.addEventListener('click', () => {
            // Click handler
            stopSpeech();
            
            // Switch DB Group if it has changed
            const targetGroup = determineGroupForCategory(res.lessonKey);
            if (targetGroup !== currentSettings.activeDbGroup) {
              currentSettings.activeDbGroup = targetGroup;
              syncSettingsDropdownsFromActiveGroup();
              populateLessonsDropdown();
              populateQuizSetupLessons();
            }

            // Switch lesson and difficulty
            currentSettings.currentLesson = lessonBase;
            currentSettings.isHard = isHardWord;
            
            // Update lastGroupCategories for that group
            if (!currentSettings.lastGroupCategories) {
              currentSettings.lastGroupCategories = {};
            }
            currentSettings.lastGroupCategories[targetGroup] = lessonBase;

            // Update dropdown and radios
            const selectLesson = document.getElementById('select-lesson');
            if (selectLesson) selectLesson.value = lessonBase;
            
            const normalRadio = document.getElementById('mode-normal');
            const hardRadio = document.getElementById('mode-hard');
            if (isHardWord) {
              if (hardRadio) hardRadio.checked = true;
            } else {
              if (normalRadio) normalRadio.checked = true;
            }
            
            saveSettings();
            renderCards();
            
            // Find index of matching word in new list
            const activeWords = getActiveWords();
            const idx = activeWords.findIndex(w => w.japanese === res.word.japanese && w.english === res.word.english);
            
            if (idx >= 0) {
              currentSettings.focusedWordIndex = idx;
              currentSettings.selectedWordIndices = [idx];
              saveSettings();
              renderCards();
              
              // Scroll and focus
              setTimeout(() => {
                const card = document.querySelector(`.vocab-card[data-index="${idx}"]`);
                if (card) {
                  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  card.focus();
                }
                speakText(cleanJapaneseSpeakText(res.word.japanese), 'ja');
              }, 100);
            }
            
            // Clear search
            searchInput.value = "";
            localStorage.removeItem('n5_search_term');
            if (btnClear) btnClear.classList.add('hidden');
            searchResults.classList.add('hidden');
          });
          
          searchResults.appendChild(row);
        });
      }
    } else {
      if (btnClear) btnClear.classList.add('hidden');
      searchResults.classList.add('hidden');
      searchResults.innerHTML = "";
    }
  });

  searchInput.addEventListener('keydown', (e) => {
    const rows = searchResults.querySelectorAll('.search-result-row');
    
    if (e.key === 'Escape') {
      e.preventDefault();
      searchInput.value = "";
      localStorage.removeItem('n5_search_term');
      if (btnClear) btnClear.classList.add('hidden');
      searchResults.classList.add('hidden');
      searchResults.innerHTML = "";
      searchInput.blur();
      return;
    }

    if (rows.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeSearchResultIndex++;
      if (activeSearchResultIndex >= rows.length) {
        activeSearchResultIndex = rows.length - 1;
      }
      updateActiveSearchResultHighlight(rows);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeSearchResultIndex--;
      if (activeSearchResultIndex < 0) {
        activeSearchResultIndex = -1;
      }
      updateActiveSearchResultHighlight(rows);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSearchResultIndex >= 0 && activeSearchResultIndex < rows.length) {
        rows[activeSearchResultIndex].click();
      } else {
        triggerSearchResultsCategory();
      }
    }
  });

  function updateActiveSearchResultHighlight(rows) {
    rows.forEach((r, idx) => {
      if (idx === activeSearchResultIndex) {
        r.classList.add('selected');
        r.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        r.classList.remove('selected');
      }
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      searchInput.value = "";
      localStorage.removeItem('n5_search_term');
      btnClear.classList.add('hidden');
      searchResults.classList.add('hidden');
      searchResults.innerHTML = "";
      searchInput.focus();
    });
  }

  // Hide search results when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-area')) {
      searchResults.classList.add('hidden');
    }
  });

  // Restore saved search query
  const savedSearch = localStorage.getItem('n5_search_term');
  if (savedSearch) {
    searchInput.value = savedSearch;
    // Dispatch input event to trigger search results
    searchInput.dispatchEvent(new Event('input'));
  }
}

function triggerSearchResultsCategory() {
  const searchInput = document.getElementById('global-search-input');
  if (!searchInput) return;
  const query = searchInput.value.trim().toLowerCase();
  if (!query) return;

  const results = [];
  const uniqueKeys = new Set();

  for (const key in currentWordsDb) {
    if (key === "Search Results" || key === "Search Results - Hard") continue;
    const list = currentWordsDb[key] || [];
    list.forEach(w => {
      const engMatch = w.english.toLowerCase().includes(query);
      const romajiMatch = w.romaji.toLowerCase().includes(query);
      if (engMatch || romajiMatch) {
        const dupKey = `${w.japanese.trim()}::${w.english.trim()}::${w.romaji.trim()}`;
        if (!uniqueKeys.has(dupKey)) {
          uniqueKeys.add(dupKey);
          results.push(w);
        }
      }
    });
  }

  currentWordsDb["Search Results"] = results;
  currentWordsDb["Search Results - Hard"] = results;

  const selectLesson = document.getElementById('select-lesson');
  if (selectLesson) {
    let exists = false;
    for (let i = 0; i < selectLesson.options.length; i++) {
      if (selectLesson.options[i].value === "Search Results") {
        exists = true;
        break;
      }
    }
    if (!exists) {
      const opt = document.createElement('option');
      opt.value = "Search Results";
      opt.textContent = "Search Results";
      let showAllIdx = -1;
      for (let i = 0; i < selectLesson.options.length; i++) {
        if (selectLesson.options[i].value === "Show All Words") {
          showAllIdx = i;
          break;
        }
      }
      if (showAllIdx >= 0) {
        selectLesson.add(opt, selectLesson.options[showAllIdx]);
      } else {
        selectLesson.appendChild(opt);
      }
    }
    selectLesson.value = "Search Results";
  }

  currentSettings.currentLesson = "Search Results";
  currentSettings.focusedWordIndex = -1;
  currentSettings.selectedWordIndices = [];
  saveSettings();
  renderCards();

  const searchResults = document.getElementById('search-results-dropdown');
  if (searchResults) {
    searchResults.classList.add('hidden');
    searchResults.innerHTML = "";
  }
  searchInput.blur();
}

// ==========================================================================
// SYSTEM INITIALIZATION & INPUT EVENT LOOPS
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // 1. Restore local storage configuration
  loadState();

  // Populate lessons and custom categories dropdown
  populateLessonsDropdown();

  // Set selectors match loaded state
  const selectLesson = document.getElementById('select-lesson');
  if (selectLesson) selectLesson.value = currentSettings.currentLesson;
  document.getElementById(currentSettings.isHard ? 'mode-hard' : 'mode-normal').checked = true;
  document.getElementById('select-display-mode').value = currentSettings.displayMode;
  document.getElementById('select-gap').value = currentSettings.readingGap;
  document.getElementById('quiz-mode-select').value = currentSettings.quizMode;
  document.getElementById(currentSettings.quizOrder === 'random' ? 'order-random' : 'order-original').checked = true;

  // Set Light/Dark theme configuration
  const savedTheme = localStorage.getItem('n5_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  // Render Layout UI cards
  renderCards();
  updateSelectionModeUI();

  // ================= EVENT DELEGATION LISTENERS =================

  // Category creation click
  const btnAddCategory = document.getElementById('btn-add-category');
  if (btnAddCategory) {
    btnAddCategory.addEventListener('click', createCustomCategory);
  }

  // Modal actions confirmations
  const btnConfirmCopy = document.getElementById('btn-confirm-copy');
  if (btnConfirmCopy) {
    btnConfirmCopy.addEventListener('click', executeCategoryWordCopy);
  }
  const btnConfirmAddSimilar = document.getElementById('btn-confirm-add-similar');
  if (btnConfirmAddSimilar) {
    btnConfirmAddSimilar.addEventListener('click', executeSimilarGroupWordCopy);
  }
  const btnSaveWord = document.getElementById('btn-save-word');
  if (btnSaveWord) {
    btnSaveWord.addEventListener('click', saveWordEditChanges);
  }

  // Quiz lessons checkbox multi-select buttons
  const btnQuizSelectAll = document.getElementById('btn-quiz-select-all');
  if (btnQuizSelectAll) {
    btnQuizSelectAll.addEventListener('click', () => {
      document.querySelectorAll('#quiz-lessons-container input[type="checkbox"]').forEach(cb => cb.checked = true);
    });
  }
  const btnQuizSelectNone = document.getElementById('btn-quiz-select-none');
  if (btnQuizSelectNone) {
    btnQuizSelectNone.addEventListener('click', () => {
      document.querySelectorAll('#quiz-lessons-container input[type="checkbox"]').forEach(cb => cb.checked = false);
    });
  }

  let lastQuizCheckbox = null;
  const quizLessonsContainer = document.getElementById('quiz-lessons-container');
  if (quizLessonsContainer) {
    quizLessonsContainer.addEventListener('click', (e) => {
      const target = e.target;
      if (target.type === 'checkbox') {
        const checkboxes = Array.from(quizLessonsContainer.querySelectorAll('input[type="checkbox"]'));
        if (e.shiftKey && lastQuizCheckbox) {
          const start = checkboxes.indexOf(lastQuizCheckbox);
          const end = checkboxes.indexOf(target);
          const checkedState = target.checked;
          if (start !== -1 && end !== -1) {
            const min = Math.min(start, end);
            const max = Math.max(start, end);
            for (let i = min; i <= max; i++) {
              checkboxes[i].checked = checkedState;
            }
          }
        }
        lastQuizCheckbox = target;
      }
    });
  }

  // Selectors changed updates
  if (selectLesson) {
    selectLesson.addEventListener('change', (e) => {
      stopSpeech();
      const val = e.target.value;
      currentSettings.currentLesson = val;
      if (val !== 'Search Results' && val !== 'Search Results - Hard') {
        if (!currentSettings.lastGroupCategories) {
          currentSettings.lastGroupCategories = {};
        }
        currentSettings.lastGroupCategories[currentSettings.activeDbGroup] = val;
      }
      currentSettings.focusedWordIndex = -1;
      currentSettings.selectedWordIndices = [];
      saveSettings();
      renderCards();
    });
  }

  document.querySelectorAll('input[name="lesson-type"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      stopSpeech();
      currentSettings.isHard = (e.target.value === 'hard');
      currentSettings.focusedWordIndex = -1;
      currentSettings.selectedWordIndices = [];
      saveSettings();
      renderCards();
    });
  });

  document.getElementById('select-display-mode').addEventListener('change', (e) => {
    stopSpeech();
    currentSettings.displayMode = e.target.value;
    saveSettings();
    renderCards();
  });

  document.getElementById('select-gap').addEventListener('change', (e) => {
    currentSettings.readingGap = e.target.value;
    saveSettings();
  });

  // Action Buttons
  document.getElementById('btn-play-all').addEventListener('click', togglePlayAll);
  document.getElementById('btn-quiz').addEventListener('click', openQuizModal);
  document.getElementById('btn-flagged').addEventListener('click', () => openModal('modal-flagged'));
  document.getElementById('btn-help').addEventListener('click', () => openModal('modal-help'));
  
  document.getElementById('btn-import').addEventListener('click', () => openModal('modal-import'));
  document.getElementById('btn-empty-import').addEventListener('click', () => openModal('modal-import'));

  // Management controls
  document.getElementById('btn-move-to-hard').addEventListener('click', moveSelectedToHard);
  document.getElementById('btn-move-to-normal').addEventListener('click', moveSelectedToNormal);
  document.getElementById('btn-move-up').addEventListener('click', moveSelectedUp);
  document.getElementById('btn-move-down').addEventListener('click', moveSelectedDown);
  document.getElementById('btn-delete').addEventListener('click', deleteSelected);
  
  const btnCopyTo = document.getElementById('btn-copy-to');
  if (btnCopyTo) {
    btnCopyTo.addEventListener('click', openCategorySelectorModal);
  }

  const btnCopyC = document.getElementById('btn-copy-c-format');
  if (btnCopyC) {
    btnCopyC.addEventListener('click', copyCurrentCategoryToClipboardNewFormat);
  }
  document.getElementById('btn-clipboard').addEventListener('click', copySettingsToClipboard);
  document.getElementById('btn-reset-cache').addEventListener('click', resetCache);

  // Settings Toggle
  const settingsToggle = document.getElementById('settings-toggle');
  if (settingsToggle) {
    settingsToggle.addEventListener('click', () => {
      const modal = document.getElementById('modal-settings');
      if (modal && modal.classList.contains('hidden')) {
        openModal('modal-settings');
      } else {
        closeActiveModal();
      }
    });
  }

  // Active DB Level & Group selection
  const selectDbLevel = document.getElementById('select-db-level');
  const selectDbGroup = document.getElementById('select-db-group');

  const handleDbSelectionChange = () => {
    syncActiveGroupFromSettingsDropdowns();
    const targetGroup = currentSettings.activeDbGroup || "N5 Lessons";
    if (currentSettings.lastGroupCategories && currentSettings.lastGroupCategories[targetGroup]) {
      currentSettings.currentLesson = currentSettings.lastGroupCategories[targetGroup];
    }
    saveSettings();
    populateLessonsDropdown();
    renderCards();
    populateQuizSetupLessons();
  };

  if (selectDbLevel) {
    selectDbLevel.addEventListener('change', handleDbSelectionChange);
  }
  if (selectDbGroup) {
    selectDbGroup.addEventListener('change', (e) => {
      if (e.target.value === "Kanji") {
        if (selectDbLevel) {
          const lg = selectDbLevel.closest('.quiz-option-group');
          if (lg) lg.style.display = "none";
        }
      } else {
        if (selectDbLevel) {
          const lg = selectDbLevel.closest('.quiz-option-group');
          if (lg) lg.style.display = "block";
        }
      }
      handleDbSelectionChange();
      closeActiveModal();
    });
  }

  // Settings modal enter/escape close
  const settingsModal = document.getElementById('modal-settings');
  if (settingsModal) {
    settingsModal.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        closeActiveModal();
      }
    });
  }

  // Import Modal Ctrl + Enter submit
  const importText = document.getElementById('import-text');
  if (importText) {
    importText.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        const btnSubmit = document.getElementById('btn-submit-import');
        if (btnSubmit) btnSubmit.click();
      }
    });
  }

  // Modals close triggers
  document.getElementById('modal-backdrop').addEventListener('click', closeActiveModal);
  document.querySelectorAll('.btn-close-modal').forEach(btn => {
    btn.addEventListener('click', closeActiveModal);
  });

  // Toggle Selection Mode button listener
  document.getElementById('btn-toggle-selection-mode').addEventListener('click', () => {
    currentSettings.isSelectionModeActive = !currentSettings.isSelectionModeActive;
    saveSettings();
    updateSelectionModeUI();
    if (!currentSettings.isSelectionModeActive) {
      if (currentSettings.focusedWordIndex >= 0) {
        currentSettings.selectedWordIndices = [currentSettings.focusedWordIndex];
      } else {
        currentSettings.selectedWordIndices = [];
      }
    }
    renderCards();
  });

  // Quiz Completion buttons listeners
  document.getElementById('btn-quiz-restart').addEventListener('click', restartCurrentQuiz);
  document.getElementById('btn-quiz-toggle-difficulty').addEventListener('click', toggleDifficultyAndQuiz);
  document.getElementById('btn-quiz-next-lesson-normal').addEventListener('click', () => startNextLessonQuiz(false));
  document.getElementById('btn-quiz-next-lesson-hard').addEventListener('click', () => startNextLessonQuiz(true));

  // Click on Quiz Card emulates Enter key behavior
  document.querySelector('.quiz-question-box').addEventListener('click', (e) => {
    if (e.target.closest('#quiz-speak-btn')) return; // ignore click on speak audio button
    
    const activeModalVisible = !document.getElementById('modal-backdrop').classList.contains('hidden');
    if (activeModalVisible) {
      const quizActive = !document.getElementById('modal-quiz').classList.contains('hidden');
      if (quizActive) {
        const isQuizPlaying = !document.getElementById('quiz-active-view').classList.contains('hidden');
        if (isQuizPlaying) {
          const state = quizStates[quizCurrentIndex];
          if (!state.answered) {
            checkQuizAnswer();
          }
        }
      }
    }
  });

  document.querySelector('.quiz-feedback-box').addEventListener('click', (e) => {
    if (e.target.closest('button') || e.target.closest('.toast') || e.target.closest('.toast-close')) return;
    
    const activeModalVisible = !document.getElementById('modal-backdrop').classList.contains('hidden');
    if (activeModalVisible) {
      const quizActive = !document.getElementById('modal-quiz').classList.contains('hidden');
      if (quizActive) {
        const isQuizPlaying = !document.getElementById('quiz-active-view').classList.contains('hidden');
        if (isQuizPlaying) {
          const state = quizStates[quizCurrentIndex];
          if (state.answered) {
            nextQuizQuestion();
          }
        }
      }
    }
  });

  // Initialize Global Search popover
  initGlobalSearch();

  // Initialize Category Jump modal
  initCategoryJump();

  // Word Edit Modal keyboard shortcuts (Enter to save, Esc to cancel)
  const editModal = document.getElementById('modal-edit-word');
  if (editModal) {
    editModal.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        saveWordEditChanges();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        closeActiveModal();
      }
    });
  }

  // Copy to Category Modal keyboard shortcuts (Enter to copy, Esc to cancel)
  const copyModal = document.getElementById('modal-category-selector');
  if (copyModal) {
    copyModal.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        executeCategoryWordCopy();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        closeActiveModal();
      }
    });
  }

  // Similar Words Group Selector keyboard shortcuts (Enter to copy, Esc to cancel)
  const groupModal = document.getElementById('modal-group-selector');
  if (groupModal) {
    groupModal.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        executeSimilarGroupWordCopy();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        closeActiveModal();
      }
    });
  }

  // Theme Toggle Button
  document.getElementById('theme-toggle').addEventListener('click', () => {
    const curTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = curTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('n5_theme', newTheme);
  });

  // Deselect All when clicking outside card/controls
  document.addEventListener('click', (e) => {
    const isModalOpen = !document.getElementById('modal-backdrop').classList.contains('hidden');
    if (isModalOpen) return;

    if (currentSettings.selectedWordIndices.length === 0) return;

    // Do NOT deselect if clicking a word card, controls, buttons, theme switcher, modal dialogs, etc.
    if (e.target.closest('.vocab-card')) return;
    if (e.target.closest('.similar-word-card')) return;
    if (e.target.closest('.management-panel')) return;
    if (e.target.closest('.control-panel')) return;
    if (e.target.closest('.app-header')) return;
    if (e.target.closest('.modal')) return;
    if (e.target.closest('.btn')) return;

    currentSettings.selectedWordIndices = [];
    currentSettings.focusedWordIndex = -1;
    saveSettings();
    renderCards();
    showToast("Cleared selections", "info");
  });

  // Import submits
  document.getElementById('btn-submit-import').addEventListener('click', triggerImport);

  // Quiz interactive elements
  document.getElementById('btn-start-quiz').addEventListener('click', startQuiz);
  document.getElementById('quiz-speak-btn').addEventListener('click', speakCurrentQuizWord);
  const quizAnswerSpeakBtn = document.getElementById('quiz-answer-speak-btn');
  if (quizAnswerSpeakBtn) {
    quizAnswerSpeakBtn.addEventListener('click', speakQuizAnswer);
  }
  const btnQuizReload = document.getElementById('btn-quiz-reload');
  if (btnQuizReload) {
    btnQuizReload.addEventListener('click', restartCurrentQuiz);
  }
  
  document.getElementById('btn-quiz-reveal').addEventListener('click', checkQuizAnswer);
  document.getElementById('btn-quiz-submit').addEventListener('click', checkQuizAnswer);
  document.getElementById('btn-quiz-prev').addEventListener('click', prevQuizQuestion);
  document.getElementById('btn-quiz-next').addEventListener('click', nextQuizQuestion);
  document.getElementById('btn-quiz-flag').addEventListener('click', flagCurrentQuizWord);

  // Typing submit event on enter key
  document.getElementById('quiz-typed-answer').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const state = quizStates[quizCurrentIndex];
      if (!state.answered) {
        checkQuizAnswer();
      } else {
        nextQuizQuestion();
      }
    }
  });

  // ================= GLOBAL KEYBOARD SHORTCUTS =================

  document.addEventListener('keydown', (e) => {
    // Shift + Enter for Quick Category Jump
    if (e.shiftKey && e.key === 'Enter') {
      e.preventDefault();
      openCategoryJumpModal();
      return;
    }

    // Ctrl + P toggle category mode
    if (e.ctrlKey && (e.key === 'p' || e.key === 'P')) {
      if (!isMobileDevice()) {
        e.preventDefault();
        currentSettings.showCategoryModeActive = !currentSettings.showCategoryModeActive;
        saveSettings();
        renderCards();
        showToast(currentSettings.showCategoryModeActive ? "Show Category Mode: ON" : "Show Category Mode: OFF", "info");
        return;
      }
    }

    // ESC to close modals/deselect (handled before standard inputs bypass so it works when inputs are focused)
    if (e.key === 'Escape') {
      const activeModalVisible = !document.getElementById('modal-backdrop').classList.contains('hidden');
      if (activeModalVisible) {
        e.preventDefault();
        closeActiveModal();
      } else {
        currentSettings.selectedWordIndices = [];
        currentSettings.focusedWordIndex = -1;
        saveSettings();
        renderCards();
      }
      return;
    }

    // If typing in standard inputs, bypass keyboard shortcuts except enter for quiz
    const tag = e.target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) {
      if (e.target.id === 'quiz-typed-answer') {
        if (e.key !== 'Enter') return;
      } else {
        return;
      }
    }

    // Alt + 1-5 for Display Mode selection
    if (e.altKey && e.key >= '1' && e.key <= '5') {
      e.preventDefault();
      const selectDisplayMode = document.getElementById('select-display-mode');
      if (selectDisplayMode) {
        const index = parseInt(e.key, 10) - 1;
        selectDisplayMode.selectedIndex = index;
        selectDisplayMode.dispatchEvent(new Event('change'));
        showToast(`Display Mode: ${selectDisplayMode.options[index].text}`, 'info');
      }
      return;
    }

    // Shift + Q / U Questions sequence detection
    if (e.shiftKey && (e.key === 'q' || e.key === 'Q')) {
      e.preventDefault();
      shiftQActive = true;
      if (shiftQTimeout) clearTimeout(shiftQTimeout);
      shiftQTimeout = setTimeout(() => {
        shiftQActive = false;
      }, 1000);
      return;
    }
    if (shiftQActive && (e.key === 'u' || e.key === 'U')) {
      e.preventDefault();
      shiftQActive = false;
      if (shiftQTimeout) clearTimeout(shiftQTimeout);
      gotoQuestionsCategory();
      return;
    }

    // Modal is currently visible: limit shortcut overrides
    const modalBackdropVisible = !document.getElementById('modal-backdrop').classList.contains('hidden');
    if (modalBackdropVisible) {
      const quizActive = !document.getElementById('modal-quiz').classList.contains('hidden');
      
      // Inside active quiz
      if (quizActive) {
        const isQuizPlaying = !document.getElementById('quiz-active-view').classList.contains('hidden');
        if (isQuizPlaying) {
          const isCompletionVisible = !document.getElementById('quiz-completion-controls').classList.contains('hidden');
          if (isCompletionVisible) {
            if (e.key === '1') {
              e.preventDefault();
              restartCurrentQuiz();
              return;
            } else if (e.key === '2') {
              e.preventDefault();
              toggleDifficultyAndQuiz();
              return;
            } else if (e.key === '3') {
              e.preventDefault();
              startNextLessonQuiz(false); // Normal
              return;
            } else if (e.key === '4') {
              e.preventDefault();
              startNextLessonQuiz(true); // Hard
              return;
            }
          }

          const isInputFocused = (document.activeElement && document.activeElement.id === 'quiz-typed-answer');

          if (e.key === 'c' || e.key === 'C') {
            if (!isInputFocused && !isCompletionVisible) {
              e.preventDefault();
              openCategorySelectorModal([quizWords[quizCurrentIndex]]);
              return;
            }
          }

          if (e.key === 'r' || e.key === 'R') {
            if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
            if (!isInputFocused) {
              e.preventDefault();
              restartCurrentQuiz();
              return;
            }
          }

          if (e.key === 'Enter') {
            e.preventDefault();
            const state = quizStates[quizCurrentIndex];
            if (!state.answered) {
              checkQuizAnswer();
            } else {
              nextQuizQuestion();
            }
          } else if (e.key === 'ArrowLeft') {
            if (!isInputFocused) {
              e.preventDefault();
              prevQuizQuestion();
            }
          } else if (e.key === 'ArrowRight') {
            if (!isInputFocused) {
              e.preventDefault();
              nextQuizQuestion();
            }
          } else if (e.key === ' ') {
            if (!isInputFocused) {
              e.preventDefault();
              speakText(cleanJapaneseSpeakText(quizWords[quizCurrentIndex].japanese), 'ja');
            }
          }
        } else {
          // Inside quiz SETUP view
          if (e.key === 'Enter') {
            e.preventDefault();
            if (e.ctrlKey) {
              toggleQuizHardMode();
            } else {
              startQuiz();
            }
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            navigateQuizMode('next');
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            navigateQuizMode('prev');
          } else if (e.key === 'o' || e.key === 'O') {
            e.preventDefault();
            setQuizOrder('original');
          } else if (e.key === 'r' || e.key === 'R') {
            if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
            e.preventDefault();
            setQuizOrder('random');
          }
        }
      }
      return;
    }

    // Ctrl + M to toggle Selection Mode
    if (e.ctrlKey && (e.key === 'm' || e.key === 'M')) {
      e.preventDefault();
      currentSettings.isSelectionModeActive = !currentSettings.isSelectionModeActive;
      saveSettings();
      updateSelectionModeUI();
      showToast(`Selection Mode: ${currentSettings.isSelectionModeActive ? 'ENABLED' : 'DISABLED'}`, 'info');
      if (!currentSettings.isSelectionModeActive) {
        if (currentSettings.focusedWordIndex >= 0) {
          currentSettings.selectedWordIndices = [currentSettings.focusedWordIndex];
        } else {
          currentSettings.selectedWordIndices = [];
        }
        renderCards();
      }
      return;
    }

    // Grid Keyboard Shortcuts (No Modals open)
    // Check Ctrl shortcuts for Lesson Navigation first (Disabled in Selection Mode)
    if (e.ctrlKey) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateLessonCategory('prev');
        return;
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateLessonCategory('next');
        return;
      } else if (e.key === 'Enter') {
        e.preventDefault();
        toggleQuizHardMode();
        return;
      }
    }

    // Selection Mode Arrow Navigation (Left/Up or Right/Down Arrow move cards)
    if (currentSettings.isSelectionModeActive) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        moveSelectedUp();
        return;
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        moveSelectedDown();
        return;
      }
    } else {
      // Normal Mode Card Navigation
      if (e.shiftKey && e.key === 'ArrowRight') {
        e.preventDefault();
        navigateActiveGroup('next');
        return;
      } else if (e.shiftKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateActiveGroup('prev');
        return;
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateFocus('next');
        return;
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateFocus('prev');
        return;
      }
    }

    // Shift + F for Global Search Focus
    if (e.shiftKey && (e.key === 'f' || e.key === 'F')) {
      e.preventDefault();
      const searchInput = document.getElementById('global-search-input');
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
      return;
    }

    // Shift + 0..9 multi-digit lesson shortcuts
    if (e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
      if (['Digit0', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9'].includes(e.code)) {
        e.preventDefault();
        const digit = e.code.replace('Digit', '');
        handleShiftDigit(digit);
        return;
      }
    }

    switch(e.key) {
      case ' ':
        if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
        e.preventDefault();
        const words = getActiveWords();
        if (words.length > 0 && currentSettings.focusedWordIndex >= 0) {
          speakText(cleanJapaneseSpeakText(words[currentSettings.focusedWordIndex].japanese), 'ja');
        }
        break;
      case 'Delete':
      case 'Backspace':
        if (e.ctrlKey || e.altKey || e.metaKey) return;
        e.preventDefault();
        deleteSelected();
        break;
      case 'e':
      case 'E':
        if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
        if (!currentSettings.isSelectionModeActive) {
          if (currentSettings.focusedWordIndex >= 0) {
            e.preventDefault();
            openWordEditModal(currentSettings.currentLesson, currentSettings.focusedWordIndex);
          }
        }
        break;
      case 'q':
      case 'Q':
        if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
        e.preventDefault();
        openQuizModal();
        break;
      case 'h':
      case 'H':
        if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
        e.preventDefault();
        openModal('modal-help');
        break;
      case 'p':
      case 'P':
        if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
        e.preventDefault();
        togglePlayAll();
        break;
      case 'm':
      case 'M':
        if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
        if (currentSettings.isSelectionModeActive) {
          e.preventDefault();
          if (currentSettings.isHard) {
            moveSelectedToNormal();
          } else {
            moveSelectedToHard();
          }
        }
        break;
      case 'd':
      case 'D':
        if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
        if (currentSettings.isSelectionModeActive) {
          e.preventDefault();
          deleteSelected();
        }
        break;
      case 'a':
      case 'A':
        if (e.ctrlKey) {
          if (currentSettings.isSelectionModeActive) {
            e.preventDefault();
            selectAllWordsInSelectionMode();
          }
          return;
        }
        break;
      case 'i':
      case 'I':
        if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
        e.preventDefault();
        const btnImport = document.getElementById('btn-import');
        if (btnImport) {
          btnImport.click();
          setTimeout(() => {
            const txt = document.getElementById('import-text');
            if (txt) txt.focus();
          }, 100);
        }
        break;
      case 'l':
      case 'L':
          var selectLesson = document.querySelector('#select-lesson');
          selectLesson.focus();
      case 'c':
      case 'C':
        if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
        e.preventDefault();
        if (currentSettings.isSelectionModeActive) {
          const btnCopyTo = document.getElementById('btn-copy-to');
          if (btnCopyTo) btnCopyTo.click();
        } else {
          const btnClipboard = document.getElementById('btn-clipboard');
          if (btnClipboard) btnClipboard.click();
        }
        break;
      case 's':
      case 'S':
        if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
        e.preventDefault();
        if (currentSettings.isSelectionModeActive) {
          openSimilarGroupSelectorModal();
        } else {
          const modal = document.getElementById('modal-settings');
          if (modal && modal.classList.contains('hidden')) {
            openModal('modal-settings');
          } else {
            closeActiveModal();
          }
        }
        break;
      case 'Enter':
        if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
        if (currentSettings.currentLesson === 'Similar Words') {
          e.preventDefault();
          createSimilarWordGroup();
        }
        break;
      case '+':
      case '=':
        if (currentSettings.currentLesson === 'Similar Words') {
          e.preventDefault();
          createSimilarWordGroup();
        }
        break;
      case 't':
      case 'T':
        if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
        e.preventDefault();
        const btnTheme = document.getElementById('theme-toggle');
        if (btnTheme) btnTheme.click();
        break;
      case 'r':
      case 'R':
        if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
        e.preventDefault();
        resetCache();
        break;
      case 'f':
      case 'F':
        if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
        e.preventDefault();
        const btnFlagged = document.getElementById('btn-flagged');
        if (btnFlagged) btnFlagged.click();
        break;
    }
  });
});

let shiftDigitBuffer = "";
let shiftDigitTimeout = null;
let shiftQActive = false;
let shiftQTimeout = null;

function handleShiftDigit(digit) {
  if (shiftDigitTimeout) {
    clearTimeout(shiftDigitTimeout);
    shiftDigitTimeout = null;
  }
  
  shiftDigitBuffer += digit;
  
  const currentGroup = currentSettings.activeDbGroup || "N5 Lessons";
  let mode = "Lesson";
  if (currentGroup.includes("Kanji")) {
    mode = "Kanji";
  } else if (currentGroup.includes("Grammer")) {
    mode = "Grammer";
  } else if (currentGroup.includes("Extra")) {
    mode = "Extra";
  } else if (currentGroup.includes("Listening")) {
    mode = "Listening";
  } else if (currentGroup.includes("Genki")) {
    mode = "Genki";
  }
  
  if (shiftDigitBuffer.length === 2) {
    let num = parseInt(shiftDigitBuffer, 10);
    if (num < 1) num = 1;
    
    switchLessonOrKanjiDirectly(num, mode);
    shiftDigitBuffer = "";
  } else {
    // Wait 450ms for a second digit
    shiftDigitTimeout = setTimeout(() => {
      let num = parseInt(shiftDigitBuffer, 10);
      if (num < 1) num = 1;
      
      switchLessonOrKanjiDirectly(num, mode);
      shiftDigitBuffer = "";
      shiftDigitTimeout = null;
    }, 450);
  }
}

function switchLessonOrKanjiDirectly(num, mode) {
  stopSpeech();
  
  let targetGroup = "";
  let categoryName = "";
  
  if (mode === "Kanji") {
    if (num < 1) num = 1;
    if (num > 5) num = 5;
    targetGroup = "Kanji";
    categoryName = `N${num} Kanji`;
  } else {
    const active = currentSettings.activeDbGroup || "N5 Lessons";
    let level = "N5";
    let levelIndex = 0;
    if (active.startsWith("N4")) { level = "N4"; levelIndex = 1; }
    else if (active.startsWith("N3")) { level = "N3"; levelIndex = 2; }
    else if (active.startsWith("N2")) { level = "N2"; levelIndex = 3; }
    else if (active.startsWith("N1")) { level = "N1"; levelIndex = 4; }

    if (num < 1) num = 1;
    
    let prefix = "Lesson";
    let max = 25;
    let min = 1;
    if (mode === "Grammer") {
      prefix = "Grammer";
      max = 25;
      min = 1;
      targetGroup = `${level} Grammer`;
      if (num < min) num = min;
      if (num > max) num = max;
      let internalNum = num + (levelIndex * 25);
      categoryName = `${prefix} ${String(internalNum).padStart(2, '0')}`;
    } else if (mode === "Extra") {
      prefix = "Extra";
      max = 25;
      min = 1;
      targetGroup = `${level} Extra`;
      if (num < min) num = min;
      if (num > max) num = max;
      let internalNum = num + (levelIndex * 25);
      categoryName = `${prefix} ${String(internalNum).padStart(2, '0')}`;
    } else if (mode === "Listening") {
      prefix = "Listening";
      max = 58;
      min = 1;
      targetGroup = `${level} Listening`;
      if (num < min) num = min;
      if (num > max) num = max;
      let internalNum = num + (levelIndex * 58);
      categoryName = `${prefix} ${String(internalNum).padStart(2, '0')}`;
    } else if (mode === "Genki") {
      prefix = "Genki";
      targetGroup = `${level} Genki`;
      if (level === "N5") {
        min = 1;
        max = 12;
      } else if (level === "N4") {
        min = 13;
        max = 23;
      } else {
        min = 1;
        max = 12;
      }
      if (num < min) num = min;
      if (num > max) num = max;
      categoryName = `${prefix} ${String(num).padStart(2, '0')}`;
    } else {
      prefix = "Lesson";
      targetGroup = `${level} Lessons`;
      let baseStart = levelIndex * 25 + 1; // N5: 1, N4: 26, N3: 51, N2: 76, N1: 101
      let baseEnd = baseStart + 24;        // N5: 25, N4: 50, N3: 75, N2: 100, N1: 125
      let internalNum = num;
      if (num >= baseStart && num <= baseEnd) {
        internalNum = num;
      } else if (num >= 1 && num <= 25) {
        internalNum = (baseStart - 1) + num;
      } else if (num < 1) {
        internalNum = baseStart;
      } else {
        internalNum = baseEnd;
      }
      categoryName = `${prefix} ${String(internalNum).padStart(2, '0')}`;
    }
  }
  
  currentSettings.activeDbGroup = targetGroup;
  currentSettings.currentLesson = categoryName;
  currentSettings.focusedWordIndex = -1;
  currentSettings.selectedWordIndices = [];
  
  syncSettingsDropdownsFromActiveGroup();
  
  saveSettings();
  populateLessonsDropdown();
  
  const selectLesson = document.getElementById('select-lesson');
  if (selectLesson) selectLesson.value = categoryName;
  
  renderCards();
  populateQuizSetupLessons();
  
  showToast(`Group set to ${targetGroup}, navigated to ${categoryName}`, 'info');
}
