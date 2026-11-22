// ==========================================================================
// LESSON BULK VOCABULARY COPY & UPDATE SYSTEM (CL & ICL)
// ==========================================================================

// Get configured number of categories for CL & ICL (Default: 3)
function getClCategoryCount() {
  const saved = localStorage.getItem('cl_category_count');
  if (saved !== null) {
    const parsed = parseInt(saved, 10);
    if (!isNaN(parsed) && parsed >= 1) {
      return parsed;
    }
  }
  return 3; // Default is 3
}

// Set configured number of categories for CL & ICL
function setClCategoryCount(count) {
  const val = Math.max(1, Math.min(50, parseInt(count, 10) || 3));
  localStorage.setItem('cl_category_count', String(val));
  if (typeof currentSettings !== 'undefined' && currentSettings) {
    currentSettings.clCategoryCount = val;
  }
  syncClCategoryCountUI(val);
}

// Synchronize all CL category count inputs and tooltips in UI
function syncClCategoryCountUI(count) {
  const num = typeof count === 'number' && count >= 1 ? count : getClCategoryCount();
  
  const elDesktop = document.getElementById('input-cl-cat-count');
  if (elDesktop && parseInt(elDesktop.value, 10) !== num) {
    elDesktop.value = num;
  }
  const elMobile = document.getElementById('input-cl-cat-count-mobile');
  if (elMobile && parseInt(elMobile.value, 10) !== num) {
    elMobile.value = num;
  }
  const elModal = document.getElementById('input-cl-cat-count-modal');
  if (elModal && parseInt(elModal.value, 10) !== num) {
    elModal.value = num;
  }

  // Update button tooltips
  const btnCL = document.getElementById('btn-copy-lesson-cl');
  const btnCLMobile = document.getElementById('btn-copy-lesson-cl-mobile');
  const btnICL = document.getElementById('btn-import-lesson-icl');
  const btnICLMobile = document.getElementById('btn-import-lesson-icl-mobile');
  
  const clTitle = `Copy vocabulary of ${num} ${num === 1 ? 'category' : 'categories'} starting from current (CL)`;
  const iclTitle = `Update vocabulary of ${num} ${num === 1 ? 'category' : 'categories'} (ICL)`;

  if (btnCL) btnCL.title = clTitle;
  if (btnCLMobile) btnCLMobile.title = clTitle;
  if (btnICL) btnICL.title = iclTitle;
  if (btnICLMobile) btnICLMobile.title = iclTitle;
}

// Get the sequence of N target categories starting from current category in custom/display order
function getTargetCategoriesForCL(count) {
  const currentCat = currentSettings.currentLesson;
  if (!currentCat || currentCat === 'Show All Words' || currentCat === 'Multi-Category View' || currentCat === 'Same Meaning' || currentCat === 'Same Romaji' || currentCat === 'Search Results' || currentCat === 'Similar Words') {
    return [];
  }
  
  const num = typeof count === 'number' && count >= 1 ? count : getClCategoryCount();
  const orderedCats = getOrderedCategoriesForActiveGroup();
  
  if (!orderedCats || orderedCats.length === 0) {
    return [currentCat];
  }
  
  let startIndex = orderedCats.indexOf(currentCat);
  if (startIndex === -1) {
    const currentClean = cleanCategoryNameForUI(currentCat);
    startIndex = orderedCats.findIndex(c => cleanCategoryNameForUI(c) === currentClean);
  }
  
  if (startIndex === -1) {
    return [currentCat];
  }
  
  const result = [];
  for (let i = 0; i < num; i++) {
    const idx = startIndex + i;
    if (idx < orderedCats.length) {
      result.push(orderedCats[idx]);
    } else {
      break;
    }
  }
  
  return result.length > 0 ? result : [currentCat];
}

// Serialize single word object to 4-line block (or 5 lines if tags exist)
function serializeCLWord(w) {
  if (!w) return "";
  const jp = (w.japanese || '').trim();
  const eng = (w.english || '').trim();
  const romaji = (w.romaji || '').trim();
  const kanji = (w.kanji && w.kanji.trim()) ? w.kanji.trim() : jp;
  const hasTags = Array.isArray(w.tags) && w.tags.length > 0;
  if (hasTags) {
    const tagsStr = w.tags.map(t => t.trim()).filter(Boolean).join(', ');
    return `${jp}\n${eng}\n${romaji}\n${kanji}\n${tagsStr}`;
  }
  return `${jp}\n${eng}\n${romaji}\n${kanji}`;
}

// Serialize categories into CL format (with `=== Category ===` headers if multi-category)
function serializeLessonCL(categoriesOrCategory) {
  let categories = [];
  if (Array.isArray(categoriesOrCategory)) {
    categories = categoriesOrCategory;
  } else if (typeof categoriesOrCategory === 'string') {
    categories = [categoriesOrCategory];
  } else {
    categories = getTargetCategoriesForCL();
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  // Filter out any virtual categories
  const validCategories = categories.filter(cat => 
    cat && cat !== 'Show All Words' && cat !== 'Multi-Category View' && 
    cat !== 'Same Meaning' && cat !== 'Same Romaji' && 
    cat !== 'Search Results' && cat !== 'Similar Words'
  );

  if (validCategories.length === 0) {
    return null;
  }

  const db = getActiveDb();
  let totalNormalCount = 0;
  let totalHardCount = 0;
  const categoryBlocks = [];

  validCategories.forEach(cat => {
    const normalWords = Array.isArray(db[cat]) ? db[cat] : [];
    const hardKey = cat + " - Hard";
    const hardWords = Array.isArray(db[hardKey]) ? db[hardKey] : [];

    totalNormalCount += normalWords.length;
    totalHardCount += hardWords.length;

    const normalBlocks = normalWords.map(serializeCLWord).filter(Boolean).join('\n\n');
    const hardBlocks = hardWords.map(serializeCLWord).filter(Boolean).join('\n\n');

    let body = "";
    if (normalBlocks && hardBlocks) {
      body = `${normalBlocks}\n\n--- hard ---\n\n${hardBlocks}`;
    } else if (normalBlocks && !hardBlocks) {
      body = `${normalBlocks}\n\n--- hard ---`;
    } else if (!normalBlocks && hardBlocks) {
      body = `--- hard ---\n\n${hardBlocks}`;
    } else {
      body = `--- hard ---`;
    }

    if (validCategories.length > 1) {
      categoryBlocks.push(`=== ${cat} ===\n\n${body}`);
    } else {
      categoryBlocks.push(body);
    }
  });

  const fullText = categoryBlocks.join('\n\n\n') + '\n';

  return {
    text: fullText,
    normalCount: totalNormalCount,
    hardCount: totalHardCount,
    categoryCount: validCategories.length,
    categories: validCategories
  };
}

// Copy Current Lesson(s) to Clipboard (CL button)
function copyCurrentLessonCL() {
  const currentCat = currentSettings.currentLesson;
  if (!currentCat || currentCat === 'Show All Words' || currentCat === 'Multi-Category View' || currentCat === 'Same Meaning' || currentCat === 'Same Romaji' || currentCat === 'Search Results' || currentCat === 'Similar Words') {
    showToast("Please select a specific lesson/category to copy (CL).", "warning");
    return;
  }

  const num = getClCategoryCount();
  const targetCats = getTargetCategoriesForCL(num);
  const res = serializeLessonCL(targetCats);
  if (!res) {
    showToast("No words found in targeted categories to copy.", "warning");
    return;
  }

  const textToCopy = res.text;
  const totalCount = res.normalCount + res.hardCount;
  
  let successMsg = "";
  if (res.categories.length > 1) {
    const names = res.categories.map(c => `"${cleanCategoryNameForUI(c)}"`).join(', ');
    successMsg = `Copied ${totalCount} vocab words (${res.normalCount} Normal, ${res.hardCount} Hard) across ${res.categories.length} categories (${names}) to clipboard!`;
  } else {
    const cleanName = cleanCategoryNameForUI(res.categories[0] || currentCat);
    successMsg = `Copied ${totalCount} vocab words (${res.normalCount} Normal, ${res.hardCount} Hard) from "${cleanName}" to clipboard!`;
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        showToast(successMsg, "success");
      })
      .catch(() => {
        fallbackCopyReportToClipboard(textToCopy, successMsg);
      });
  } else {
    fallbackCopyReportToClipboard(textToCopy, successMsg);
  }
}

// Helper to parse a single category's text block divided by `--- hard ---`
function parseSingleCategoryICL(text) {
  if (!text || typeof text !== 'string' || !text.trim()) {
    return { normalWords: [], hardWords: [], hasDivider: false };
  }
  const dividerRegex = /^\s*-{3,}\s*hard\s*-{3,}\s*$/mi;
  const match = text.match(dividerRegex);
  if (match) {
    const idx = match.index;
    const normalPart = text.substring(0, idx).trim();
    const hardPart = text.substring(idx + match[0].length).trim();
    return {
      normalWords: parseWords(normalPart),
      hardWords: parseWords(hardPart),
      hasDivider: true
    };
  } else {
    return {
      normalWords: parseWords(text.trim()),
      hardWords: [],
      hasDivider: false
    };
  }
}

// Parse ICL input text supporting multiple categories separated by `=== Category Name ===`
function parseICLText(rawText) {
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    return {
      isMulti: false,
      categories: [],
      normalWords: [],
      hardWords: [],
      totalNormalCount: 0,
      totalHardCount: 0
    };
  }

  const categoryHeaderRegex = /^\s*={3,}\s*(?:Category:\s*)?(.+?)\s*={3,}\s*$/gim;
  const headerMatches = [];
  let m;
  while ((m = categoryHeaderRegex.exec(rawText)) !== null) {
    headerMatches.push({
      header: m[0],
      name: m[1].trim(),
      index: m.index,
      length: m[0].length
    });
  }

  // If category headers were found:
  if (headerMatches.length > 0) {
    const parsedCategories = [];
    for (let i = 0; i < headerMatches.length; i++) {
      const currentHeader = headerMatches[i];
      const startIdx = currentHeader.index + currentHeader.length;
      const endIdx = (i + 1 < headerMatches.length) ? headerMatches[i + 1].index : rawText.length;
      const categoryBlockText = rawText.substring(startIdx, endIdx).trim();

      const singleParsed = parseSingleCategoryICL(categoryBlockText);
      parsedCategories.push({
        categoryName: currentHeader.name,
        normalWords: singleParsed.normalWords,
        hardWords: singleParsed.hardWords,
        hasDivider: singleParsed.hasDivider
      });
    }

    const totalNormal = parsedCategories.reduce((sum, c) => sum + c.normalWords.length, 0);
    const totalHard = parsedCategories.reduce((sum, c) => sum + c.hardWords.length, 0);

    return {
      isMulti: true,
      categories: parsedCategories,
      normalWords: parsedCategories[0] ? parsedCategories[0].normalWords : [],
      hardWords: parsedCategories[0] ? parsedCategories[0].hardWords : [],
      hasDivider: parsedCategories.some(c => c.hasDivider),
      totalNormalCount: totalNormal,
      totalHardCount: totalHard
    };
  } else {
    // Single category without header
    const single = parseSingleCategoryICL(rawText);
    return {
      isMulti: false,
      categories: [{
        categoryName: currentSettings.currentLesson,
        normalWords: single.normalWords,
        hardWords: single.hardWords,
        hasDivider: single.hasDivider
      }],
      normalWords: single.normalWords,
      hardWords: single.hardWords,
      hasDivider: single.hasDivider,
      totalNormalCount: single.normalWords.length,
      totalHardCount: single.hardWords.length
    };
  }
}

// Check if a word was modified between old and new blocks
function isWordChanged(oldW, newW) {
  if (!oldW || !newW) return false;
  
  const oldJp = (oldW.japanese || '').trim();
  const newJp = (newW.japanese || '').trim();
  if (oldJp !== newJp) return true;

  const oldEng = (oldW.english || '').trim();
  const newEng = (newW.english || '').trim();
  if (oldEng !== newEng) return true;

  const oldRom = (oldW.romaji || '').trim();
  const newRom = (newW.romaji || '').trim();
  if (oldRom !== newRom) return true;

  const oldKanjiEff = (oldW.kanji && oldW.kanji.trim()) ? oldW.kanji.trim() : oldJp;
  const newKanjiEff = (newW.kanji && newW.kanji.trim()) ? newW.kanji.trim() : newJp;
  if (oldKanjiEff !== newKanjiEff) return true;

  const oldTags = (Array.isArray(oldW.tags) ? oldW.tags : []).map(t => t.trim()).filter(Boolean).sort().join(',');
  const newTags = (Array.isArray(newW.tags) ? newW.tags : []).map(t => t.trim()).filter(Boolean).sort().join(',');
  if (oldTags !== newTags) return true;

  return false;
}

// Identify which words were changed when replacing word lists
function findChangedWords(oldWordsList, newWordsList) {
  const changes = [];
  if (!Array.isArray(oldWordsList) || !Array.isArray(newWordsList)) return changes;

  const usedNewIndices = new Set();
  
  // 1. Match by exact (japanese + english)
  for (let i = 0; i < oldWordsList.length; i++) {
    const oldW = oldWordsList[i];
    const oldJp = (oldW.japanese || '').trim().toLowerCase();
    const oldEng = (oldW.english || '').trim().toLowerCase();
    
    // Check same index first if it matches
    if (i < newWordsList.length && !usedNewIndices.has(i)) {
      const newW = newWordsList[i];
      const newJp = (newW.japanese || '').trim().toLowerCase();
      const newEng = (newW.english || '').trim().toLowerCase();
      if (oldJp === newJp && oldEng === newEng) {
        usedNewIndices.add(i);
        if (isWordChanged(oldW, newW)) {
          changes.push({ oldW, newW });
        }
        continue;
      }
    }
    
    // Look across all newWords for matching (japanese + english)
    let found = false;
    for (let j = 0; j < newWordsList.length; j++) {
      if (usedNewIndices.has(j)) continue;
      const newW = newWordsList[j];
      const newJp = (newW.japanese || '').trim().toLowerCase();
      const newEng = (newW.english || '').trim().toLowerCase();
      if (oldJp === newJp && oldEng === newEng) {
        usedNewIndices.add(j);
        found = true;
        if (isWordChanged(oldW, newW)) {
          changes.push({ oldW, newW });
        }
        break;
      }
    }
    if (found) continue;
    
    // 2. Match by exact japanese (reading unchanged, english might have minor edit)
    for (let j = 0; j < newWordsList.length; j++) {
      if (usedNewIndices.has(j)) continue;
      const newW = newWordsList[j];
      const newJp = (newW.japanese || '').trim().toLowerCase();
      if (oldJp === newJp) {
        usedNewIndices.add(j);
        found = true;
        if (isWordChanged(oldW, newW)) {
          changes.push({ oldW, newW });
        }
        break;
      }
    }
    if (found) continue;

    // 3. Match by exact english (reading might have minor typo fix)
    for (let j = 0; j < newWordsList.length; j++) {
      if (usedNewIndices.has(j)) continue;
      const newW = newWordsList[j];
      const newEng = (newW.english || '').trim().toLowerCase();
      if (oldEng === newEng) {
        usedNewIndices.add(j);
        found = true;
        if (isWordChanged(oldW, newW)) {
          changes.push({ oldW, newW });
        }
        break;
      }
    }
  }
  
  return changes;
}

// Open ICL Modal
function openImportLessonICLModal() {
  const currentCat = currentSettings.currentLesson;
  if (!currentCat || currentCat === 'Show All Words' || currentCat === 'Multi-Category View' || currentCat === 'Same Meaning' || currentCat === 'Same Romaji' || currentCat === 'Search Results' || currentCat === 'Similar Words') {
    showToast("Please select a specific lesson/category to update (ICL).", "warning");
    return;
  }

  const num = getClCategoryCount();
  const targetCats = getTargetCategoriesForCL(num);

  const titleCat = document.getElementById('icl-target-cat-name');
  if (titleCat) {
    if (targetCats.length > 1) {
      const names = targetCats.map(c => cleanCategoryNameForUI(c)).join(', ');
      titleCat.textContent = `${targetCats.length} Categories (${names})`;
    } else {
      titleCat.textContent = cleanCategoryNameForUI(currentCat);
    }
  }

  const modalCountInput = document.getElementById('input-cl-cat-count-modal');
  if (modalCountInput) {
    modalCountInput.value = num;
  }

  const inputEl = document.getElementById('input-import-lesson-icl');
  if (inputEl) {
    inputEl.value = '';
  }

  updateICLLivePreview();
  openModal('modal-import-lesson-icl');

  if (inputEl) {
    setTimeout(() => {
      inputEl.focus();
    }, 100);
  }
}

// Load current lesson's words into ICL editor
function loadCurrentWordsIntoICL() {
  const num = getClCategoryCount();
  const targetCats = getTargetCategoriesForCL(num);
  const res = serializeLessonCL(targetCats);
  const inputEl = document.getElementById('input-import-lesson-icl');
  if (res && inputEl) {
    inputEl.value = res.text;
    updateICLLivePreview();
    const countDesc = res.categoryCount > 1 ? `${res.categoryCount} categories` : `category "${cleanCategoryNameForUI(res.categories[0])}"`;
    showToast(`Loaded ${res.normalCount + res.hardCount} words across ${countDesc} into editor.`, "info");
  }
}

// Update live badge and preview inside ICL modal
function updateICLLivePreview() {
  const inputEl = document.getElementById('input-import-lesson-icl');
  const badgeEl = document.getElementById('icl-detected-badge');
  const summaryEl = document.getElementById('icl-preview-summary');
  if (!inputEl) return;

  const num = getClCategoryCount();
  const targetCats = getTargetCategoriesForCL(num);
  const targetNamesStr = targetCats.map(c => `<strong>${cleanCategoryNameForUI(c)}</strong>`).join(', ');

  const titleCat = document.getElementById('icl-target-cat-name');
  if (titleCat) {
    if (targetCats.length > 1) {
      const names = targetCats.map(c => cleanCategoryNameForUI(c)).join(', ');
      titleCat.textContent = `${targetCats.length} Categories (${names})`;
    } else {
      titleCat.textContent = cleanCategoryNameForUI(currentSettings.currentLesson);
    }
  }

  const rawText = inputEl.value || '';
  if (!rawText.trim()) {
    if (badgeEl) badgeEl.textContent = '0 Categories (0 Normal, 0 Hard)';
    if (summaryEl) {
      summaryEl.innerHTML = `Targeting ${targetCats.length} ${targetCats.length === 1 ? 'category' : 'categories'}: ${targetNamesStr}. Click <strong>Load Current Words</strong> to edit current contents, or paste updated words below.`;
    }
    return;
  }

  const parsed = parseICLText(rawText);
  if (parsed.isMulti) {
    if (badgeEl) {
      badgeEl.textContent = `${parsed.categories.length} Categories (${parsed.totalNormalCount} Normal, ${parsed.totalHardCount} Hard)`;
    }
    if (summaryEl) {
      const catDetails = parsed.categories.map(c => `<strong>${cleanCategoryNameForUI(c.categoryName)}</strong> (${c.normalWords.length} N / ${c.hardWords.length} H)`).join(', ');
      summaryEl.innerHTML = `Detected <strong>${parsed.categories.length} categories</strong>: ${catDetails}. Click <strong>Update Lesson Words</strong> to apply changes.`;
    }
  } else {
    if (badgeEl) {
      badgeEl.textContent = `1 Category (${parsed.totalNormalCount} Normal, ${parsed.totalHardCount} Hard)`;
    }
    if (summaryEl) {
      summaryEl.innerHTML = `Detected <strong>${parsed.totalNormalCount} Normal</strong> and <strong>${parsed.totalHardCount} Hard</strong> words for current category (<strong>${cleanCategoryNameForUI(currentSettings.currentLesson)}</strong>). Click <strong>Update Lesson Words</strong> to apply changes.`;
    }
  }
}

// Submit ICL: replace words in target category/categories and synchronize across Ultimate
function submitImportLessonICL() {
  const currentCat = currentSettings.currentLesson;
  if (!currentCat || currentCat === 'Show All Words' || currentCat === 'Multi-Category View' || currentCat === 'Same Meaning' || currentCat === 'Same Romaji' || currentCat === 'Search Results' || currentCat === 'Similar Words') {
    showToast("Please select a specific lesson/category to update (ICL).", "warning");
    return false;
  }

  const inputEl = document.getElementById('input-import-lesson-icl');
  if (!inputEl) return false;

  const rawText = inputEl.value || '';
  if (!rawText.trim()) {
    showToast("Please paste vocabulary words to update.", "danger");
    inputEl.focus();
    return false;
  }

  const parsed = parseICLText(rawText);
  if (parsed.totalNormalCount === 0 && parsed.totalHardCount === 0) {
    showToast("No valid vocabulary words detected. Each block needs at least 3 or 4 lines.", "danger");
    return false;
  }

  const db = getActiveDb();
  const num = getClCategoryCount();
  const targetCatsSequence = getTargetCategoriesForCL(num);

  // Map parsed category blocks to active database category keys
  const categoriesToUpdate = [];
  if (parsed.isMulti) {
    for (let i = 0; i < parsed.categories.length; i++) {
      const item = parsed.categories[i];
      let resolvedKey = null;

      // 1. Direct key match in db
      if (db[item.categoryName] !== undefined || db[item.categoryName + " - Hard"] !== undefined) {
        resolvedKey = item.categoryName;
      } else {
        // 2. Clean UI name match against all known categories
        const cleanItemName = cleanCategoryNameForUI(item.categoryName).toLowerCase();
        for (const k in db) {
          if (cleanCategoryNameForUI(k).toLowerCase() === cleanItemName) {
            resolvedKey = k.endsWith(" - Hard") ? k.replace(" - Hard", "") : k;
            break;
          }
        }
      }

      // 3. Positional fallback from targetCatsSequence
      if (!resolvedKey && i < targetCatsSequence.length) {
        resolvedKey = targetCatsSequence[i];
      }

      // 4. Default to raw name
      if (!resolvedKey) {
        resolvedKey = item.categoryName;
      }

      categoriesToUpdate.push({
        categoryKey: resolvedKey,
        normalWords: item.normalWords,
        hardWords: item.hardWords
      });
    }
  } else {
    // Single category without header
    categoriesToUpdate.push({
      categoryKey: currentCat,
      normalWords: parsed.categories[0].normalWords,
      hardWords: parsed.categories[0].hardWords
    });
  }

  const allChanges = [];
  const updatedCategoryKeys = new Set();

  categoriesToUpdate.forEach(item => {
    const catKey = item.categoryKey;
    const hardKey = catKey + " - Hard";
    updatedCategoryKeys.add(catKey);
    updatedCategoryKeys.add(hardKey);

    const oldNormalWords = Array.isArray(db[catKey]) ? [...db[catKey]] : [];
    const oldHardWords = Array.isArray(db[hardKey]) ? [...db[hardKey]] : [];

    const normalChanges = findChangedWords(oldNormalWords, item.normalWords);
    const hardChanges = findChangedWords(oldHardWords, item.hardWords);
    allChanges.push(...normalChanges, ...hardChanges);

    // Apply updates directly to active db
    db[catKey] = item.normalWords;
    db[hardKey] = item.hardWords;
  });

  // Propagate to other categories if in Ultimate mode
  let propagatedCount = 0;
  const affectedCategories = new Set();

  if (isUltimateMode() && allChanges.length > 0) {
    for (const catKey in currentUltimateWordsDb) {
      if (updatedCategoryKeys.has(catKey)) continue;
      if (catKey === "Search Results" || catKey === "Search Results - Hard") continue;

      const catWords = currentUltimateWordsDb[catKey];
      if (!Array.isArray(catWords)) continue;

      catWords.forEach(targetW => {
        for (const { oldW, newW } of allChanges) {
          const targetJp = (targetW.japanese || '').trim().toLowerCase();
          const targetEng = (targetW.english || '').trim().toLowerCase();
          const oldJp = (oldW.japanese || '').trim().toLowerCase();
          const oldEng = (oldW.english || '').trim().toLowerCase();

          // Match by japanese + english, or japanese + romaji
          const isMatch = (targetJp === oldJp && targetEng === oldEng) ||
                          (targetJp === oldJp && (targetW.romaji || '').trim().toLowerCase() === (oldW.romaji || '').trim().toLowerCase());

          if (isMatch) {
            let wordChanged = false;
            if (targetW.kanji !== newW.kanji) {
              targetW.kanji = newW.kanji;
              wordChanged = true;
            }
            if (targetW.japanese !== newW.japanese) {
              targetW.japanese = newW.japanese;
              wordChanged = true;
            }
            if (targetW.english !== newW.english) {
              targetW.english = newW.english;
              wordChanged = true;
            }
            if (targetW.romaji !== newW.romaji) {
              targetW.romaji = newW.romaji;
              wordChanged = true;
            }
            if (Array.isArray(newW.tags) && newW.tags.length > 0) {
              const existingTags = Array.isArray(targetW.tags) ? targetW.tags : [];
              const merged = Array.from(new Set([...existingTags, ...newW.tags]));
              if (merged.join(',') !== existingTags.join(',')) {
                targetW.tags = merged;
                wordChanged = true;
              }
            }
            if (wordChanged) {
              propagatedCount++;
              affectedCategories.add(catKey);
            }
            break;
          }
        }
      });
    }
  }

  // Persist and refresh UI
  saveWords();
  clearAllStateCaches();
  renderCards();
  if (typeof updateStatsPanel === 'function') {
    updateStatsPanel();
  }
  closeActiveModal();

  const totalNormalUpdated = categoriesToUpdate.reduce((s, c) => s + c.normalWords.length, 0);
  const totalHardUpdated = categoriesToUpdate.reduce((s, c) => s + c.hardWords.length, 0);

  let feedback = "";
  if (categoriesToUpdate.length > 1) {
    const names = categoriesToUpdate.map(c => `"${cleanCategoryNameForUI(c.categoryKey)}"`).join(', ');
    feedback = `Updated ${categoriesToUpdate.length} categories (${names}): ${totalNormalUpdated} Normal, ${totalHardUpdated} Hard words.`;
  } else {
    const cleanName = cleanCategoryNameForUI(categoriesToUpdate[0].categoryKey);
    feedback = `Updated "${cleanName}": ${totalNormalUpdated} Normal, ${totalHardUpdated} Hard words.`;
  }

  if (propagatedCount > 0) {
    feedback += ` Propagated ${propagatedCount} update${propagatedCount === 1 ? '' : 's'} across ${affectedCategories.size} other category/list${affectedCategories.size === 1 ? '' : 's'} in Ultimate.`;
  }
  showToast(feedback, "success");
  return true;
}
