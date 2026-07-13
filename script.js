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
  isSelectionModeActive: false
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
  if (words.length === 0 || playAllIndex >= words.length) {
    stopSpeech();
    showToast("Completed Play All session.", "success");
    return;
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
  const key = getActiveLessonKey();
  return currentWordsDb[key] || [];
}

// Redraw vocabulary grid from memory state
function renderCards() {
  const container = document.getElementById('vocab-grid');
  const emptyState = document.getElementById('empty-state');
  if (!container) return;

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
  currentWordsDb[currentKey] = currentWordsDb[currentKey].filter((_, idx) => !selectedIdxs.includes(idx));
  currentWordsDb[targetKey].push(...itemsToMove);

  currentSettings.selectedWordIndices = [];
  currentSettings.focusedWordIndex = -1;
  saveWords();
  saveSettings();
  renderCards();
  showToast(`Moved ${selectedIdxs.length} word(s) to Hard list.`, 'success');
}

// Move selected items to Normal list
function moveSelectedToNormal() {
  const selectedIdxs = [...currentSettings.selectedWordIndices].sort((a, b) => a - b);
  if (selectedIdxs.length === 0 || !currentSettings.isHard) return;

  const currentKey = getActiveLessonKey();
  const targetKey = currentSettings.currentLesson;

  const itemsToMove = selectedIdxs.map(idx => currentWordsDb[currentKey][idx]);
  currentWordsDb[currentKey] = currentWordsDb[currentKey].filter((_, idx) => !selectedIdxs.includes(idx));
  currentWordsDb[targetKey].push(...itemsToMove);

  currentSettings.selectedWordIndices = [];
  currentSettings.focusedWordIndex = -1;
  saveWords();
  saveSettings();
  renderCards();
  showToast(`Moved ${selectedIdxs.length} word(s) to Normal list.`, 'success');
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
  const words = getActiveWords();
  if (words.length === 0) {
    showToast("Cannot start quiz: current lesson has no words.", "danger");
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
  document.getElementById('quiz-feedback-box').className = "quiz-feedback-box hidden";
  document.getElementById('btn-quiz-reveal').classList.add('hidden');
  document.getElementById('quiz-input-container').classList.add('hidden');

  // Set Score displays
  const isWritingQuiz = ['quiz3', 'quiz4', 'quiz5'].includes(mode);
  const scoreText = document.getElementById('quiz-score-text');
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

  if (mode === 'quiz1' || mode === 'quiz3') {
    // English -> Japanese
    qTextEl.textContent = word.english;
    speakText(word.english, 'en');
  } else {
    // Japanese -> English/Romaji
    qTextEl.textContent = word.japanese;
    qTextEl.classList.add('text-japanese');
    speakText(cleanJapaneseSpeakText(word.japanese), 'ja');
  }

  // Setup based on answered state
  if (state.answered) {
    document.getElementById('quiz-reveal-japanese').textContent = word.japanese;
    document.getElementById('quiz-reveal-english').textContent = word.english;
    document.getElementById('quiz-reveal-romaji').textContent = word.romaji;

    const feedbackBox = document.getElementById('quiz-feedback-box');
    const feedbackTitle = document.getElementById('quiz-feedback-title');
    feedbackBox.classList.remove('hidden');

    if (isWritingQuiz) {
      if (state.isCorrect) {
        feedbackBox.className = "quiz-feedback-box correct";
        feedbackTitle.textContent = "Correct!";
      } else {
        feedbackBox.className = "quiz-feedback-box incorrect";
        feedbackTitle.textContent = `Incorrect! You typed: "${state.userTyped}"`;
      }
    } else {
      feedbackBox.className = "quiz-feedback-box";
      feedbackTitle.textContent = "Answer:";
    }

    const revealRomajiSection = feedbackBox.querySelector('.reveal-romaji-section');
    revealRomajiSection.style.display = "flex";
  } else {
    if (isWritingQuiz) {
      document.getElementById('quiz-input-container').classList.remove('hidden');
      const input = document.getElementById('quiz-typed-answer');
      input.focus();
    } else {
      document.getElementById('btn-quiz-reveal').classList.remove('hidden');
      document.getElementById('btn-quiz-reveal').focus();
    }
  }

  updateQuizNavigationButtons();
}

// Speak the current quiz question audio manually
function speakCurrentQuizWord() {
  if (quizCurrentIndex >= quizWords.length) return;
  const word = quizWords[quizCurrentIndex];
  const mode = currentSettings.quizMode;

  if (mode === 'quiz1' || mode === 'quiz3') {
    speakText(word.english, 'en');
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
  const isWritingQuiz = ['quiz3', 'quiz4', 'quiz5'].includes(mode);

  let isCorrect = false;
  let userTyped = "";

  if (isWritingQuiz) {
    userTyped = document.getElementById('quiz-typed-answer').value;
    state.userTyped = userTyped;
    
    if (mode === 'quiz3') {
      isCorrect = checkJapaneseMatch(userTyped, word.japanese);
    } else if (mode === 'quiz4') {
      isCorrect = checkEnglishMatch(userTyped, word.english);
    } else if (mode === 'quiz5') {
      isCorrect = (userTyped.trim().toLowerCase() === word.romaji.trim().toLowerCase());
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
    } else if (mode === 'quiz2') {
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
    showQuizQuestion();
  }
}

function finishQuiz() {
  document.getElementById('quiz-progress-bar').style.width = '100%';
  const mode = currentSettings.quizMode;
  const isWritingQuiz = ['quiz3', 'quiz4', 'quiz5'].includes(mode);

  const qTextEl = document.getElementById('quiz-question-text');
  qTextEl.className = "quiz-question-text";
  
  if (isWritingQuiz) {
    const pct = quizWords.length > 0 ? Math.round((quizScore / quizWords.length) * 100) : 0;
    qTextEl.textContent = `Quiz Complete! Score: ${quizScore}/${quizWords.length} (${pct}%)`;
  } else {
    qTextEl.textContent = "Quiz Complete!";
  }

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

function startNextLessonQuiz() {
  let match = currentSettings.currentLesson.match(/\d+/);
  if (!match) return;
  let num = parseInt(match[0], 10);
  num = num + 1;
  if (num > 25) num = 1;
  
  currentSettings.currentLesson = "Lesson " + String(num).padStart(2, '0');
  
  const selectLesson = document.getElementById('select-lesson');
  if (selectLesson) selectLesson.value = currentSettings.currentLesson;
  
  currentSettings.focusedWordIndex = -1;
  currentSettings.selectedWordIndices = [];
  saveSettings();
  renderCards();
  
  startQuiz();
  showToast(`Moved to ${currentSettings.currentLesson} and started quiz!`, 'info');
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

function changeLesson(direction) {
  let match = currentSettings.currentLesson.match(/\d+/);
  if (!match) return;
  let num = parseInt(match[0], 10);
  
  if (direction === 'next') {
    num = num + 1;
    if (num > 25) num = 1;
  } else {
    num = num - 1;
    if (num < 1) num = 25;
  }
  
  stopSpeech();
  currentSettings.currentLesson = "Lesson " + String(num).padStart(2, '0');
  currentSettings.focusedWordIndex = -1;
  currentSettings.selectedWordIndices = [];
  
  const selectLesson = document.getElementById('select-lesson');
  if (selectLesson) selectLesson.value = currentSettings.currentLesson;
  
  saveSettings();
  renderCards();
  showToast(`Changed to ${currentSettings.currentLesson}`, 'info');
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

function initGlobalSearch() {
  const searchInput = document.getElementById('global-search-input');
  const searchResults = document.getElementById('search-results-dropdown');
  const btnClear = document.getElementById('btn-clear-search');
  if (!searchInput || !searchResults) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    
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

  // Populate lessons dropdown (Lesson 01 to Lesson 25)
  const selectLesson = document.getElementById('select-lesson');
  for (let i = 1; i <= 25; i++) {
    const opt = document.createElement('option');
    const val = `Lesson ${String(i).padStart(2, '0')}`;
    opt.value = val;
    opt.textContent = val;
    selectLesson.appendChild(opt);
  }

  // Set selectors match loaded state
  selectLesson.value = currentSettings.currentLesson;
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

  // ================= EVENT DELEGATION LISTNERS =================

  // Selectors changed updates
  selectLesson.addEventListener('change', (e) => {
    stopSpeech();
    currentSettings.currentLesson = e.target.value;
    currentSettings.focusedWordIndex = -1;
    currentSettings.selectedWordIndices = [];
    saveSettings();
    renderCards();
  });

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
  document.getElementById('btn-quiz').addEventListener('click', () => openModal('modal-quiz'));
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
  document.getElementById('btn-quiz-next-lesson').addEventListener('click', startNextLessonQuiz);

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
          } else {
            nextQuizQuestion();
          }
        }
      }
    }
  });

  document.querySelector('.quiz-feedback-box').addEventListener('click', (e) => {
    if (e.target.closest('#quiz-speak-btn')) return; // ignore click on speak audio button
    
    const activeModalVisible = !document.getElementById('modal-backdrop').classList.contains('hidden');
    if (activeModalVisible) {
      // Find the feedback item that was clicked (or fallback to first)
      const feedbackBox = document.querySelector('.quiz-feedback-box');
      const feedbackItem = e.target.closest('.feedback-item') || feedbackBox.querySelector('.feedback-item');

      let japaneseWord = '';
      if (feedbackItem) {
        // prefer element with class text-japanese, then data attribute, then textContent
        const jpEl = feedbackItem.querySelector('.text-japanese');
        if (jpEl && jpEl.textContent.trim()) {
          japaneseWord = jpEl.textContent.trim();
        } else if (feedbackItem.dataset && feedbackItem.dataset.japanese) {
          japaneseWord = feedbackItem.dataset.japanese.trim();
        } else {
          japaneseWord = feedbackItem.textContent.trim();
        }
      }

      if (japaneseWord) {
        speakText(cleanJapaneseSpeakText(japaneseWord), 'ja');
      }
    }
  });

  // Initialize Global Search popover
  initGlobalSearch();

  // Theme Toggle Button
  document.getElementById('theme-toggle').addEventListener('click', () => {
    const curTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = curTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('n5_theme', newTheme);
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
    // If typing in standard inputs, bypass keyboard shortcuts except enter for quiz
    const tag = e.target.tagName.toLowerCase();
    if (tag === 'input' && e.target.id !== 'quiz-typed-answer') return;
    if (tag === 'textarea' || e.target.isContentEditable) return;

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

    // if(e.key === '')

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
              startNextLessonQuiz();
              return;
            }
          }

          const isInputFocused = (document.activeElement && document.activeElement.id === 'quiz-typed-answer');

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
          changeLesson('prev');
        }
        return;
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (!currentSettings.isSelectionModeActive) {
          changeLesson('next');
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

    // Shift + 1..5 for Display Mode
    if (e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
      const displayModes = ['big-english', 'big-japanese', 'english-only', 'japanese-only', 'romaji-only'];
      if (['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'].includes(e.code)) {
        e.preventDefault();
        const modeIndex = parseInt(e.code.replace('Digit', ''), 10) - 1;
        const selectMode = document.getElementById('select-display-mode');
        if (selectMode && modeIndex >= 0 && modeIndex < displayModes.length) {
          selectMode.value = displayModes[modeIndex];
          // Dispatch change to update settings & redraw
          selectMode.dispatchEvent(new Event('change'));
          showToast(`Display Mode: ${selectMode.options[selectMode.selectedIndex].text}`, 'info');
        }
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
        openModal('modal-quiz');
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
        const btnClip = document.getElementById('btn-clipboard');
        if (btnClip) btnClip.click();
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
