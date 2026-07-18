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
  similarWordGroups: []
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
  // Split by newlines, trim, filter out empty lines
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const words = [];
  for (let i = 0; i < lines.length; i += 3) {
    if (i + 2 < lines.length) {
      words.push({
        japanese: lines[i],
        english: lines[i+1],
        romaji: lines[i+2]
      });
    }
  }
  return words;
}

// Convert parsed words array back into a three-line text format
function serializeWords(wordsArray) {
  if (!wordsArray || wordsArray.length === 0) return "";
  let text = "\n";
  wordsArray.forEach(w => {
    text += `${w.japanese}\n${w.english}\n${w.romaji}\n\n`;
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

// Save application state to local storage
function saveSettings() {
  localStorage.setItem('n5_app_settings', JSON.stringify(currentSettings));
}

function saveWords() {
  localStorage.setItem('n5_words', JSON.stringify(currentWordsDb));
}

// Load application state (restoring settings and parsed words)
function loadState() {
  let settingsInitializedFromJs = false;
  let wordsInitializedFromJs = false;

  // 1. Load Settings
  const savedSettings = localStorage.getItem('n5_app_settings');
  if (savedSettings) {
    currentSettings = JSON.parse(savedSettings);
  } else {
    if (typeof appSettings !== 'undefined') {
      currentSettings = { ...appSettings };
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

  // 2. Load Words
  const savedWords = localStorage.getItem('n5_words');
  if (savedWords) {
    currentWordsDb = JSON.parse(savedWords);
  } else {
    currentWordsDb = {};
    // Load from words.js allWords object
    for (const key in allWords) {
      currentWordsDb[key] = parseWords(allWords[key]);
    }
    wordsInitializedFromJs = true;
  }

  // Ensure all 25 lessons and hard versions exist
  for (let i = 1; i <= 25; i++) {
    const lStr = `Lesson ${String(i).padStart(2, '0')}`;
    const hStr = `${lStr} - Hard`;
    if (!currentWordsDb[lStr]) currentWordsDb[lStr] = [];
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
    return getShowAllWords();
  }
  const key = getActiveLessonKey();
  return currentWordsDb[key] || [];
}

function reorderWords(fromIdx, toIdx) {
  const key = getActiveLessonKey();
  if (key === 'Show All Words' || key === 'Similar Words') return;

  const list = currentWordsDb[key];
  if (!list || fromIdx < 0 || fromIdx >= list.length || toIdx < 0 || toIdx >= list.length) return;

  // Move the item
  const [movedWord] = list.splice(fromIdx, 1);
  list.splice(toIdx, 0, movedWord);

  saveWords();
  renderCards();
}

function getShowAllWords() {
  const uniqueMap = new Map();
  for (const key in currentWordsDb) {
    const list = currentWordsDb[key] || [];
    list.forEach(w => {
      const dupKey = `${w.japanese.trim()}|${w.english.trim()}|${w.romaji.trim()}`;
      if (!uniqueMap.has(dupKey)) {
        uniqueMap.set(dupKey, w);
      }
    });
  }
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
  return merged;
}

function belongsToAnyCustomCategory(word) {
  if (!word || !word.japanese || !word.english) return false;
  const wordJp = word.japanese.trim();
  const wordEng = word.english.trim();
  
  if (currentSettings.customCategories) {
    for (const cat of currentSettings.customCategories) {
      const normalList = currentWordsDb[cat] || [];
      const hardList = currentWordsDb[cat + " - Hard"] || [];
      
      const inNormal = normalList.some(w => w.japanese.trim() === wordJp && w.english.trim() === wordEng);
      const inHard = hardList.some(w => w.japanese.trim() === wordJp && w.english.trim() === wordEng);
      
      if (inNormal || inHard) {
        return true;
      }
    }
  }

  const groups = currentSettings.similarWordGroups || [];
  const inSimilar = groups.some(g => (g.words || []).some(w => w.japanese.trim() === wordJp && w.english.trim() === wordEng));
  if (inSimilar) {
    return true;
  }

  return false;
}

let showCategoryModeActive = false;

function getAllCategoriesForWord(word) {
  const categories = [];
  if (!word || !word.japanese || !word.english) return categories;
  const wordJp = word.japanese.trim();
  const wordEng = word.english.trim();

  // Check all lessons and custom categories in currentWordsDb
  for (const key in currentWordsDb) {
    const isHardKey = key.endsWith(" - Hard");
    const baseKey = isHardKey ? key.slice(0, -9) : key;
    
    if (categories.includes(baseKey)) continue;

    const list = currentWordsDb[key] || [];
    const found = list.some(w => w.japanese.trim() === wordJp && w.english.trim() === wordEng);
    if (found) {
      categories.push(baseKey);
    }
  }

  // Check Similar Words groups
  const groups = currentSettings.similarWordGroups || [];
  let inSimilar = false;
  groups.forEach((g, gIdx) => {
    const found = (g.words || []).some(w => w.japanese.trim() === wordJp && w.english.trim() === wordEng);
    if (found) {
      inSimilar = true;
    }
  });
  if (inSimilar) {
    categories.push("Similar Words");
  }

  return categories;
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

  // 2. Check Similar Words groups
  const groups = currentSettings.similarWordGroups || [];
  const inSimilar = groups.some(g => (g.words || []).some(w => w.japanese.trim() === wordJp && w.english.trim() === wordEng));
  if (inSimilar) {
    list.push("Similar Words");
  }

  return list;
}

// Redraw vocabulary grid from memory state
function renderCards() {
  console.log('render cards caleld');
  const container = document.getElementById('vocab-grid');
  const emptyState = document.getElementById('empty-state');
  if (!container) return;

  // Reset grid class name
  container.className = "vocab-grid";

  // Update Statistics UI
  const lessonKey = currentSettings.currentLesson;
  const normalCount = currentWordsDb[lessonKey] ? currentWordsDb[lessonKey].length : 0;
  const hardKey = lessonKey + " - Hard";
  const hardCount = currentWordsDb[hardKey] ? currentWordsDb[hardKey].length : 0;
  const selectedCount = currentSettings.selectedWordIndices.length;

  const statLesson = document.getElementById('stat-current-lesson');
  const statTotal = document.getElementById('stat-total-words');
  const statNormal = document.getElementById('stat-normal-count');
  const statHard = document.getElementById('stat-hard-count');
  const statSelected = document.getElementById('stat-selected-count');
  const statSelectedItem = document.getElementById('stat-selected-item');

  if (statLesson) statLesson.textContent = lessonKey;
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

  // Toggle controls display
  const toggleGroup = document.querySelector('.toggle-group');
  const managementPanel = document.querySelector('.management-panel');
  if (toggleGroup) toggleGroup.style.display = (isShowAll || isSimilar) ? 'none' : 'flex';
  if (managementPanel) managementPanel.style.display = (isShowAll || isSimilar) ? 'none' : 'flex';

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

    if (lessonKey !== 'Show All Words' && lessonKey !== 'Similar Words') {
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

    card.appendChild(jpDiv);
    card.appendChild(enDiv);
    card.appendChild(romajiDiv);

    if (showCategoryModeActive && !isMobileDevice()) {
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
  if (!isCustomCategory) {
    currentWordsDb[currentKey] = currentWordsDb[currentKey].filter((_, idx) => !selectedIdxs.includes(idx));
  }
  
  currentWordsDb[targetKey].push(...itemsToMove);

  currentSettings.selectedWordIndices = [];
  currentSettings.focusedWordIndex = -1;
  saveWords();
  saveSettings();
  renderCards();
  showToast(`${isCustomCategory ? 'Copied' : 'Moved'} ${selectedIdxs.length} word(s) to Hard list.`, 'success');
}

// Move selected items to Normal list
function moveSelectedToNormal() {
  const selectedIdxs = [...currentSettings.selectedWordIndices].sort((a, b) => a - b);
  if (selectedIdxs.length === 0 || !currentSettings.isHard) return;

  const currentKey = getActiveLessonKey();
  const targetKey = currentSettings.currentLesson;

  const itemsToMove = selectedIdxs.map(idx => currentWordsDb[currentKey][idx]);
  
  // Custom categories: copy instead of move
  const isCustomCategory = currentSettings.customCategories.includes(currentSettings.currentLesson);
  if (!isCustomCategory) {
    currentWordsDb[currentKey] = currentWordsDb[currentKey].filter((_, idx) => !selectedIdxs.includes(idx));
  }
  
  currentWordsDb[targetKey].push(...itemsToMove);

  currentSettings.selectedWordIndices = [];
  currentSettings.focusedWordIndex = -1;
  saveWords();
  saveSettings();
  renderCards();
  showToast(`${isCustomCategory ? 'Copied' : 'Moved'} ${selectedIdxs.length} word(s) to Normal list.`, 'success');
}

// Move selected items UP in position
function moveSelectedUp() {
  const currentKey = getActiveLessonKey();
  const list = currentWordsDb[currentKey];
  if (!list || list.length === 0) return;

  const selectedIdxs = [...currentSettings.selectedWordIndices].sort((a, b) => a - b);
  if (selectedIdxs.length === 0) return;

  const firstSelected = selectedIdxs[0];
  if (firstSelected === 0) return; // Already at top, do nothing

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

// Move selected items DOWN in position
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
    showToast("No valid vocabulary entries detected. Match 3-line format.", "danger");
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
        words.push({
          japanese: w.japanese,
          english: w.english,
          romaji: w.romaji
        });
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
    } else {
      // Japanese -> English/Romaji (Review / Writing)
      qTextEl.textContent = word.japanese;
      qTextEl.classList.add('text-japanese');
      speakText(cleanJapaneseSpeakText(word.japanese), 'ja');
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

// Speak the current quiz question audio manually
function speakCurrentQuizWord() {
  if (quizCurrentIndex >= quizWords.length) return;
  const word = quizWords[quizCurrentIndex];
  const mode = currentSettings.quizMode;

  if (mode === 'quiz1' || mode === 'quiz3' || mode === 'quiz7') {
    speakText(word.english, 'en');
  } else if (mode === 'quiz6') {
    speakText(cleanJapaneseSpeakText(word.japanese), 'ja');
  } else {
    speakText(cleanJapaneseSpeakText(word.japanese), 'ja');
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
    if (mode === 'quiz1') {
      speakText(cleanJapaneseSpeakText(word.japanese), 'ja');
    } else if (mode === 'quiz2' || mode === 'quiz6') {
      speakText(word.english, 'en');
    }
  }
}

function nextQuizQuestion() {
  if (quizCurrentIndex < quizWords.length - 1) {
    quizCurrentIndex++;
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
  let match = currentSettings.currentLesson.match(/\d+/);
  if (!match) return;
  let num = parseInt(match[0], 10);
  num = num + 1;
  if (num > 25) num = 1;
  
  currentSettings.currentLesson = "Lesson " + String(num).padStart(2, '0');
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
  showToast(`Moved to ${currentSettings.currentLesson} (${isNextHardMode ? 'Hard' : 'Normal'}) and started quiz!`, 'info');
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

  // 1. Serialize Lessons
  for (let i = 1; i <= 25; i++) {
    const pad = String(i).padStart(2, '0');
    const normalKey = `Lesson ${pad}`;
    const hardKey = `${normalKey} - Hard`;

    clipContent += `allWords["${normalKey}"] = \`${serializeWords(currentWordsDb[normalKey])}\`;\n\n`;
    clipContent += `allWords["${hardKey}"] = \`${serializeWords(currentWordsDb[hardKey])}\`;\n\n`;
  }

  // 1.5. Serialize Custom Categories
  if (currentSettings.customCategories) {
    currentSettings.customCategories.forEach(cat => {
      const normalKey = cat;
      const hardKey = `${cat} - Hard`;

      clipContent += `allWords["${normalKey}"] = \`${serializeWords(currentWordsDb[normalKey])}\`;\n\n`;
      clipContent += `allWords["${hardKey}"] = \`${serializeWords(currentWordsDb[hardKey])}\`;\n\n`;
    });
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

// ==========================================================================
// MODAL STATE OVERLAY TOGGLES
// ==========================================================================

function openModal(modalId) {
  stopSpeech();
  document.getElementById('modal-backdrop').classList.remove('hidden');
  document.getElementById(modalId).classList.remove('hidden');
  
  if (modalId === 'modal-flagged') {
    renderFlaggedWordsList();
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

function navigateNonLessonCategories(direction) {
  const selectLesson = document.getElementById('select-lesson');
  if (!selectLesson) return;
  
  const options = Array.from(selectLesson.options);
  const nonLessons = options.filter(opt => {
    const val = opt.value;
    return val !== "Show All Words" && val !== "Similar Words" && !val.match(/^Lesson\s+\d+/i);
  });
  
  // Wait, let's include all non-lessons!
  // "Category navigation: Ctrl + Left Arrow / Ctrl + Right Arrow should navigate only through non-lesson categories.
  // Example order: Show All Words -> Similar Words -> JLPT Revision -> Anime Words
  // Lessons must NOT appear in this navigation anymore."
  // So we filter out only standard lessons!
  const finalNonLessons = options.filter(opt => !opt.value.match(/^Lesson\s+\d+/i));
  if (finalNonLessons.length === 0) return;
  
  let currentVal = currentSettings.currentLesson;
  let idx = finalNonLessons.findIndex(opt => opt.value === currentVal);
  
  if (idx === -1) {
    idx = 0;
  } else {
    if (direction === 'next') {
      idx = (idx + 1) % finalNonLessons.length;
    } else {
      idx = (idx - 1 + finalNonLessons.length) % finalNonLessons.length;
    }
  }
  
  const targetVal = finalNonLessons[idx].value;
  
  stopSpeech();
  currentSettings.currentLesson = targetVal;
  currentSettings.focusedWordIndex = -1;
  currentSettings.selectedWordIndices = [];
  
  selectLesson.value = targetVal;
  saveSettings();
  renderCards();
  showToast(`Switched to category: ${targetVal}`, 'info');
}

function populateQuizSetupLessons() {
  const container = document.getElementById('quiz-lessons-container');
  if (!container) return;
  
  container.innerHTML = "";
  
  // Scan currentWordsDb keys (filter out Hard version names to avoid duplication)
  const keys = Object.keys(currentWordsDb).filter(k => !k.endsWith(" - Hard"));
  
  // Natural sorting to ensure order is logical (e.g. Lesson 01 before Lesson 10)
  keys.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  
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
      <label for="quiz-cb-${cleanId}" style="cursor:pointer; font-size: 0.9rem; color: var(--text-primary);">${val}</label>
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

  // 1. Standard Lessons 01 - 25
  for (let i = 1; i <= 25; i++) {
    const opt = document.createElement('option');
    const val = `Lesson ${String(i).padStart(2, '0')}`;
    opt.value = val;
    opt.textContent = val;
    selectLesson.appendChild(opt);
  }

  // 2. Custom Categories
  if (currentSettings.customCategories) {
    currentSettings.customCategories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      selectLesson.appendChild(opt);
    });
  }

  // 3. Special Categories
  const showAllOpt = document.createElement('option');
  showAllOpt.value = "Show All Words";
  showAllOpt.textContent = "Show All Words";
  selectLesson.appendChild(showAllOpt);

  const similarWordsOpt = document.createElement('option');
  similarWordsOpt.value = "Similar Words";
  similarWordsOpt.textContent = "Similar Words";
  selectLesson.appendChild(similarWordsOpt);
}

function createCustomCategory() {
  const catName = prompt("Enter new custom category name:");
  if (catName === null) return;
  
  const trimmed = catName.trim();
  if (!trimmed) {
    showToast("Category name cannot be empty.", "danger");
    return;
  }
  
  const reserved = ["Show All Words", "Similar Words"];
  if (reserved.includes(trimmed) || trimmed.startsWith("Lesson ")) {
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
  
  if (lesson === 'Show All Words') {
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
  
  document.getElementById('edit-word-japanese').value = targetWord.japanese;
  document.getElementById('edit-word-romaji').value = targetWord.romaji;
  document.getElementById('edit-word-english').value = targetWord.english;
  
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
  const sourceLesson = modal.getAttribute('data-source-lesson');
  const sourceIndexStr = modal.getAttribute('data-source-index');
  
  const newJp = document.getElementById('edit-word-japanese').value.trim();
  const newRomaji = document.getElementById('edit-word-romaji').value.trim();
  const newEng = document.getElementById('edit-word-english').value.trim();
  
  if (!newJp || !newRomaji || !newEng) {
    showToast("All fields must be filled.", "danger");
    return;
  }

  if (sourceLesson === 'Similar Words') {
    const coords = JSON.parse(sourceIndexStr);
    const groupIdx = coords.groupIdx;
    const wordIdx = coords.wordIdx;
    const word = currentSettings.similarWordGroups[groupIdx].words[wordIdx];
    if (word) {
      word.japanese = newJp;
      word.romaji = newRomaji;
      word.english = newEng;
      saveSettings();
    }
  } else {
    const word = currentWordsDb[sourceLesson][parseInt(sourceIndexStr, 10)];
    if (word) {
      word.japanese = newJp;
      word.romaji = newRomaji;
      word.english = newEng;
      saveWords();
    }
  }
  
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
      if (showCategoryModeActive && !isMobileDevice()) {
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
      if (showCategoryModeActive && !isMobileDevice()) {
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
      if (showCategoryModeActive && !isMobileDevice()) {
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
  if (customWordsList) {
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
  
  // Custom categories (non-lessons)
  if (currentSettings.customCategories) {
    currentSettings.customCategories.forEach(cat => {
      if (cat !== currentL) {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        selectDest.appendChild(opt);
      }
    });
  }
  
  // Similar Words (if not currently on Similar Words)
  if (currentL !== "Similar Words") {
    const opt = document.createElement('option');
    opt.value = "Similar Words";
    opt.textContent = "Similar Words";
    selectDest.appendChild(opt);
  }
  
  if (selectDest.options.length === 0) {
    showToast("No other destination categories exist.", "danger");
    return;
  }

  // Set default selection to "Similar Words" if available
  const hasSimilar = Array.from(selectDest.options).some(opt => opt.value === "Similar Words");
  if (hasSimilar) {
    selectDest.value = "Similar Words";
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
  if (wordsToCopy.length === 0) return;

  if (destCategory === "Similar Words") {
    if (!currentSettings.similarWordGroups) {
      currentSettings.similarWordGroups = [];
    }
    if (currentSettings.similarWordGroups.length === 0) {
      currentSettings.similarWordGroups.push({
        words: []
      });
    }
    const lastGroupIdx = currentSettings.similarWordGroups.length - 1;
    const targetGroup = currentSettings.similarWordGroups[lastGroupIdx];
    
    wordsToCopy.forEach(w => {
      targetGroup.words.push({
        japanese: w.japanese,
        english: w.english,
        romaji: w.romaji
      });
    });
    
    saveSettings();
    
    currentSettings.selectedWordIndices = [];
    currentSettings.focusedWordIndex = -1;
    saveSettings();
    
    closeActiveModal();
    renderCards();
    showToast(`Copied ${wordsToCopy.length} words to Group ${lastGroupIdx + 3}`, 'success');
    return;
  }
  
  // Always copy the Normal version of the word (never the Hard version)
  const targetKey = destCategory;
  
  if (!currentWordsDb[targetKey]) currentWordsDb[targetKey] = [];

  console.log('wrodstOCopy:',wordsToCopy);
  
  // Copy words (clone objects to prevent reference conflicts)
  wordsToCopy.forEach(w => {
    currentWordsDb[targetKey].push({
      japanese: w.japanese,
      english: w.english,
      romaji: w.romaji
    });
  });
  
  saveWords();
  
  // Clean selections
  currentSettings.selectedWordIndices = [];
  currentSettings.focusedWordIndex = -1;
  saveSettings();
  
  closeActiveModal();
  renderCards();
  showToast(`Copied ${wordsToCopy.length} words to ${destCategory} (Normal)`, 'success');
}

function openSimilarGroupSelectorModal(customWordsList = null) {
  if (customWordsList) {
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
  if (targetGroup) {
    wordsToCopy.forEach(w => {
      targetGroup.words.push({
        japanese: w.japanese,
        english: w.english,
        romaji: w.romaji
      });
    });
    
    saveSettings();
  }
  
  currentSettings.selectedWordIndices = [];
  currentSettings.focusedWordIndex = -1;
  saveSettings();
  
  closeActiveModal();
  renderCards();
  showToast(`Copied ${wordsToCopy.length} words to Group ${targetGroupIdx + 3}`, 'success');
}

// --------------------------------------------------------------------------
// GLOBAL SEARCH KEYBOARD NAVIGATION & IMPROVEMENTS
// --------------------------------------------------------------------------

let activeSearchResultIndex = -1;


function initGlobalSearch() {
  const searchInput = document.getElementById('global-search-input');
  const searchResults = document.getElementById('search-results-dropdown');
  const btnClear = document.getElementById('btn-clear-search');
  if (!searchInput || !searchResults) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    activeSearchResultIndex = -1;
    
    if (query.length > 0) {
      if (btnClear) btnClear.classList.remove('hidden');
      searchResults.classList.remove('hidden');
      
      // Perform search across all lessons
      const results = [];
      
      for (const lessonKey in currentWordsDb) {
        const list = currentWordsDb[lessonKey];
        list.forEach(w => {
          const engMatch = w.english.toLowerCase().includes(query);
          const romajiMatch = w.romaji.toLowerCase().includes(query);
          if (engMatch || romajiMatch) {
            results.push({
              word: w,
              lessonKey: lessonKey
            });
          }
        });
      }
      
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
            
            // Switch lesson and difficulty
            currentSettings.currentLesson = lessonBase;
            currentSettings.isHard = isHardWord;
            
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
      if (activeSearchResultIndex >= 0 && activeSearchResultIndex < rows.length) {
        e.preventDefault();
        rows[activeSearchResultIndex].click();
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

  // Selectors changed updates
  if (selectLesson) {
    selectLesson.addEventListener('change', (e) => {
      stopSpeech();
      currentSettings.currentLesson = e.target.value;
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

  document.getElementById('btn-clipboard').addEventListener('click', copySettingsToClipboard);
  document.getElementById('btn-reset-cache').addEventListener('click', resetCache);

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
    // Ctrl + P toggle category mode
    if (e.ctrlKey && (e.key === 'p' || e.key === 'P')) {
      if (!isMobileDevice()) {
        e.preventDefault();
        showCategoryModeActive = !showCategoryModeActive;
        renderCards();
        showToast(showCategoryModeActive ? "Show Category Mode: ON" : "Show Category Mode: OFF", "info");
        return;
      }
    }

    // If typing in standard inputs, bypass keyboard shortcuts except enter for quiz
    const tag = e.target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) {
      if (e.target.id === 'quiz-typed-answer') {
        if (e.key !== 'Enter') return;
      } else {
        return;
      }
    }

    // ESC to close modals/deselect
    if (e.key === 'Escape') {
      const activeModalVisible = !document.getElementById('modal-backdrop').classList.contains('hidden');
      if (activeModalVisible) {
        closeActiveModal();
      } else {
        currentSettings.selectedWordIndices = [];
        currentSettings.focusedWordIndex = -1;
        saveSettings();
        renderCards();
      }
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
        if (!currentSettings.isSelectionModeActive) {
          navigateNonLessonCategories('prev');
        }
        return;
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (!currentSettings.isSelectionModeActive) {
          navigateNonLessonCategories('next');
        }
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
      if (e.key === 'ArrowRight') {
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
      case 'q':
      case 'Q':
        if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
        e.preventDefault();
        openQuizModal();
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
      case 'c':
      case 'C':
        if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
        e.preventDefault();
        if (currentSettings.isSelectionModeActive) {
          openCategorySelectorModal();
        } else {
          const btnClip = document.getElementById('btn-clipboard');
          if (btnClip) btnClip.click();
        }
        break;
      case 's':
      case 'S':
        if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
        if (currentSettings.isSelectionModeActive) {
          e.preventDefault();
          openSimilarGroupSelectorModal();
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

function handleShiftDigit(digit) {
  if (shiftDigitTimeout) {
    clearTimeout(shiftDigitTimeout);
    shiftDigitTimeout = null;
  }
  
  shiftDigitBuffer += digit;
  
  if (shiftDigitBuffer.length === 2) {
    let lessonNum = parseInt(shiftDigitBuffer, 10);
    if (lessonNum < 1) lessonNum = 1;
    if (lessonNum > 25) lessonNum = 25;
    
    switchLessonDirectly(lessonNum);
    shiftDigitBuffer = "";
  } else {
    // Wait 450ms for a second digit
    shiftDigitTimeout = setTimeout(() => {
      let lessonNum = parseInt(shiftDigitBuffer, 10);
      if (lessonNum < 1) lessonNum = 1;
      if (lessonNum > 25) lessonNum = 25;
      
      switchLessonDirectly(lessonNum);
      shiftDigitBuffer = "";
      shiftDigitTimeout = null;
    }, 450);
  }
}

function switchLessonDirectly(num) {
  const lessonName = "Lesson " + String(num).padStart(2, '0');
  stopSpeech();
  currentSettings.currentLesson = lessonName;
  currentSettings.focusedWordIndex = -1;
  currentSettings.selectedWordIndices = [];
  
  const selectLesson = document.getElementById('select-lesson');
  if (selectLesson) selectLesson.value = lessonName;
  
  saveSettings();
  renderCards();
  showToast(`Switched to ${lessonName}`, 'info');
}
