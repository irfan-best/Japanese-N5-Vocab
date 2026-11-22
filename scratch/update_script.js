const fs = require('fs');

const scriptPath = 'c:/Custom Documents/japanese-n5-vocab/script.js';
const enginePath = 'c:/Custom Documents/japanese-n5-vocab/scratch/new_engine.js';

let content = fs.readFileSync(scriptPath, 'utf8');
const newEngineCode = fs.readFileSync(enginePath, 'utf8');

const startMarker = '// ==========================================================================\n// LESSON BULK VOCABULARY COPY & UPDATE SYSTEM (CL & ICL)';
const endMarker = '\n\n// CUSTOM DISPLAY MODE ENGINE & MODAL CONTROLLER';

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('Markers not found! startIdx:', startIdx, 'endIdx:', endIdx);
  process.exit(1);
}

content = content.substring(0, startIdx) + newEngineCode + content.substring(endIdx);

// Also add listeners for input-cl-cat-count
const targetMarker = 'submitImportLessonICL();\n      }\n    });\r\n  }';

const listenerAddition = `submitImportLessonICL();\n      }\n    });\r
  }\r
\r
  // Number of categories input change listeners (CL & ICL)\r
  const inputClCount = document.getElementById('input-cl-cat-count');\r
  if (inputClCount) {\r
    inputClCount.addEventListener('input', (e) => {\r
      const val = parseInt(e.target.value, 10);\r
      if (!isNaN(val) && val >= 1) {\r
        setClCategoryCount(val);\r
      }\r
    });\r
  }\r
  const inputClCountMobile = document.getElementById('input-cl-cat-count-mobile');\r
  if (inputClCountMobile) {\r
    inputClCountMobile.addEventListener('input', (e) => {\r
      const val = parseInt(e.target.value, 10);\r
      if (!isNaN(val) && val >= 1) {\r
        setClCategoryCount(val);\r
      }\r
    });\r
  }\r
  const inputClCountModal = document.getElementById('input-cl-cat-count-modal');\r
  if (inputClCountModal) {\r
    inputClCountModal.addEventListener('input', (e) => {\r
      const val = parseInt(e.target.value, 10);\r
      if (!isNaN(val) && val >= 1) {\r
        setClCategoryCount(val);\r
        updateICLLivePreview();\r
      }\r
    });\r
  }\r
\r
  // Initialize CL category count UI\r
  syncClCategoryCountUI(getClCategoryCount());`;

if (content.includes(targetMarker)) {
  content = content.replace(targetMarker, listenerAddition);
  console.log('Successfully added listeners for input-cl-cat-count!');
} else {
  console.error('targetMarker not found!');
  process.exit(1);
}

fs.writeFileSync(scriptPath, content, 'utf8');
console.log('Successfully updated script.js with multi-category CL & ICL engine!');
