# Japanese N5 Vocabulary Learning Website

A modern, responsive, keyboard-friendly, and touch-optimized **Japanese N5 Vocabulary Learning Web Application** built using pure HTML, CSS, and JavaScript. 

---

## 📁 File Structure

```
japanese-n5-vocab/
├── index.html     # Application HTML structure and modal dialog views
├── style.css      # Custom HSL variables, responsive grids, dark/light themes, animations
├── script.js      # App state manager, speech synthesis queue, selection logic, quiz loop
├── words.js       # Vocabulary lists for all 25 lessons and default configurations
└── README.md      # Project instructions and keyboard documentation
```

---

## ⚙️ Vocabulary Format & Cache Reset Workflow

### 1. Data Storage Format
All vocab list data is maintained as structured multi-line text strings inside the `allWords` object in [words.js](file:///c:/Custom%20Documents/japanese-n5-vocab/words.js). 

Each word entry consists of exactly **three consecutive lines**:
1. **Japanese characters** (Alternatives are separated by `(or)`)
2. **English meanings** (Alternatives are separated by commas)
3. **Romaji reading**

#### Example representation:
```javascript
allWords["Lesson 01"] = `
けんきゅうしゃ
researcher, scholar
kenkyuusha

しつれいですが (or) しつれいですな
excuse me, but
shitsurei desu ga
`;
```

### 2. Copy & Cache Reset Workflow
To keep your progress and customized list order synchronized between browser local storage and your source files:
1. Make your edits (e.g. Move Up, Move Down, Import, Flag words, Delete) inside the browser.
2. Click **Copy to Clipboard** at the bottom of the interface. This generates a Javascript representation of all words and preferences.
3. Open [words.js](file:///c:/Custom%20Documents/japanese-n5-vocab/words.js) in your text editor, select all text, and paste the clipboard data.
4. Click **Reset Cache** on the website. This will clear the local storage data and reload the page. The app will immediately display your updated lists directly from the freshly-saved `words.js` without losing any configuration.

---

## 💻 Keyboard Shortcuts Reference

For maximum productivity, the application supports dedicated global keyboard navigation:

| Key Shortcut | Action |
| --- | --- |
| <kbd>Ctrl</kbd> + <kbd>M</kbd> | Toggle Selection Mode (needed to use selection commands). |
| <kbd>&rarr;</kbd> (Right Arrow) (in Normal Mode) | Move focus to next card and play Japanese audio. |
| <kbd>&larr;</kbd> (Left Arrow) (in Normal Mode) | Move focus to previous card and play Japanese audio. |
| <kbd>Space</kbd> | Repeat speaking current card's Japanese audio (or Quiz word). |
| <kbd>Ctrl</kbd> + Click | Select only the clicked word (only in Selection Mode). |
| <kbd>Shift</kbd> + Click | Select range of cards (only in Selection Mode). |
| <kbd>Esc</kbd> | Close active modal dialog or clear card selection. |
| <kbd>Ctrl</kbd> + <kbd>&larr;</kbd> (Left Arrow) | Go to the previous lesson (only when Selection Mode is inactive). |
| <kbd>Ctrl</kbd> + <kbd>&rarr;</kbd> (Right Arrow) | Go to the next lesson (only when Selection Mode is inactive). |
| <kbd>&larr;</kbd> / <kbd>&uarr;</kbd> (Left/Up Arrow) (in Selection Mode) | Move selected card(s) Up (left). |
| <kbd>&rarr;</kbd> / <kbd>&darr;</kbd> (Right/Down Arrow) (in Selection Mode) | Move selected card(s) Down (right). |
| <kbd>Delete</kbd> / <kbd>Backspace</kbd> | Delete selected card(s). |
| <kbd>Q</kbd> | Trigger / Close the Quiz modal. |
| <kbd>Enter</kbd> (in Quiz Setup) | Start Quiz. |
| <kbd>Enter</kbd> (in Quiz Active) | Reveal answer, submit text input, or go to next question. |
| <kbd>&larr;</kbd> (Left Arrow) (in Quiz Active) | Go to previous question (when text input is not focused). |
| <kbd>&rarr;</kbd> (Right Arrow) (in Quiz Active) | Go to next question (when text input is not focused). |
| <kbd>Space</kbd> (in Quiz Active) | Read current word in Japanese (when text input is not focused). |
| <kbd>&uarr;</kbd> (Up Arrow) (in Quiz Setup) | Select previous Quiz Mode. |
| <kbd>&darr;</kbd> (Down Arrow) (in Quiz Setup) | Select next Quiz Mode. |
| <kbd>O</kbd> (in Quiz Setup) | Select Original question order. |
| <kbd>R</kbd> (in Quiz Setup) | Select Random question order. |
| <kbd>Ctrl</kbd> + <kbd>Enter</kbd> (in Quiz Setup) | Toggle between Normal and Hard mode. |

---

## 🔊 Speaking & Display Modes
The app includes **five display modes** which instantly customize card typography:
1. **Big English (Default)**: Large English mean, small Japanese, and small Romaji.
2. **Big Japanese**: Large Japanese char, small English, and small Romaji.
3. **English Only**: Displays English meaning only.
4. **Japanese Only**: Displays Japanese text only.
5. **Romaji**: Displays Romaji in large format with Japanese below.

### Speaking rules:
- Interactive Card clicks or Arrow selections *always* speak only the Japanese voice (`ja-JP`).
- **Play All** loops through current cards with a configurable **Reading Gap** pause. It speaks:
  - *Big English mode*: English text &rarr; pause &rarr; Japanese text.
  - *Big Japanese mode*: Japanese text &rarr; pause &rarr; English text.
  - *English Only*: English text only.
  - *Japanese Only / Romaji modes*: Japanese text only.

---

## 📝 5-Mode Quiz System
Launch customizable quizing decks in either **Random** or **Original** order:
- **Quiz 1**: English &rarr; Japanese (Review flashcard, reveals details on Enter)
- **Quiz 2**: Japanese &rarr; English (Review flashcard, reveals details on Enter)
- **Quiz 3**: English &rarr; Japanese Writing (User text input compared against alternatives)
- **Quiz 4**: Japanese &rarr; English Writing (User text input compared against meanings)
- **Quiz 5**: Japanese &rarr; Romaji Writing (User text input compared against romaji)

---

## 📱 Mobile Responsiveness
Cards resize automatically matching target grid spacing guidelines:
- **Desktop**: 5 cards per row
- **Tablet**: 3-4 cards per row
- **Mobile**: 2 cards per row
Spacers and interactive buttons feature generous touch targets (min $44\text{px}$ width/height) optimized for comfortable mobile browsing.
