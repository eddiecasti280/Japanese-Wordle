// hiragana mappings
var hiraganas = new Map();
// あ行
hiraganas.set('a', 'あ');
hiraganas.set('i', 'い');
hiraganas.set('u', 'う');
hiraganas.set('e', 'え');
hiraganas.set('o', 'お');
// か行
hiraganas.set('ka', 'か');
hiraganas.set('ki', 'き');
hiraganas.set('ku', 'く');
hiraganas.set('ke', 'け');
hiraganas.set('ko', 'こ');
// さ行
hiraganas.set('sa', 'さ');
hiraganas.set('si', 'し');
hiraganas.set('shi', 'し');
hiraganas.set('su', 'す');
hiraganas.set('se', 'せ');
hiraganas.set('so', 'そ');
// た行
hiraganas.set('ta', 'た');
hiraganas.set('ti', 'ち');
hiraganas.set('chi', 'ち');
hiraganas.set('ci', 'ち');
hiraganas.set('tsu', 'つ');
hiraganas.set('tu', 'つ');
hiraganas.set('te', 'て');
hiraganas.set('to', 'と');
// な行
hiraganas.set('na', 'な');
hiraganas.set('ni', 'に');
hiraganas.set('nu', 'ぬ');
hiraganas.set('ne', 'ね');
hiraganas.set('no', 'の');
// は行
hiraganas.set('ha', 'は');
hiraganas.set('hi', 'ひ');
hiraganas.set('hu', 'ふ');
hiraganas.set('fu', 'ふ');
hiraganas.set('he', 'へ');
hiraganas.set('ho', 'ほ');
// ま行
hiraganas.set('ma', 'ま');
hiraganas.set('mi', 'み');
hiraganas.set('mu', 'む');
hiraganas.set('me', 'め');
hiraganas.set('mo', 'も');
// や行
hiraganas.set('ya', 'や');
hiraganas.set('yu', 'ゆ');
hiraganas.set('yo', 'よ');
// ら行
hiraganas.set('ra', 'ら');
hiraganas.set('ri', 'り');
hiraganas.set('ru', 'る');
hiraganas.set('re', 'れ');
hiraganas.set('ro', 'ろ');
// わ行
hiraganas.set('wa', 'わ');
hiraganas.set('wo', 'を');
hiraganas.set('nn', 'ん');
hiraganas.set('n', 'ん');
// が行
hiraganas.set('ga', 'が');
hiraganas.set('gi', 'ぎ');
hiraganas.set('gu', 'ぐ');
hiraganas.set('ge', 'げ');
hiraganas.set('go', 'ご');
// ざ行
hiraganas.set('za', 'ざ');
hiraganas.set('zi', 'じ');
hiraganas.set('ji', 'じ');
hiraganas.set('zu', 'ず');
hiraganas.set('ze', 'ぜ');
hiraganas.set('zo', 'ぞ');
// だ行
hiraganas.set('da', 'だ');
hiraganas.set('di', 'ぢ');
hiraganas.set('du', 'づ');
hiraganas.set('de', 'で');
hiraganas.set('do', 'ど');
// ば行
hiraganas.set('ba', 'ば');
hiraganas.set('bi', 'び');
hiraganas.set('bu', 'ぶ');
hiraganas.set('be', 'べ');
hiraganas.set('bo', 'ぼ');
// ぱ行
hiraganas.set('pa', 'ぱ');
hiraganas.set('pi', 'ぴ');
hiraganas.set('pu', 'ぷ');
hiraganas.set('pe', 'ぺ');
hiraganas.set('po', 'ぽ');
// 小文字
hiraganas.set('xa', 'ぁ');
hiraganas.set('xi', 'ぃ');
hiraganas.set('xu', 'ぅ');
hiraganas.set('xe', 'ぇ');
hiraganas.set('xo', 'ぉ');
hiraganas.set('xya', 'ゃ');
hiraganas.set('xyu', 'ゅ');
hiraganas.set('xyo', 'ょ');
hiraganas.set('xtu', 'っ');
hiraganas.set('xtsu', 'っ');

// Global variables
var hiraganaArray = [...new Set(Array.from(hiraganas.values()))];
var answer = "";
var answerKanji = "";
var wordsDatabase = null;
var currentRow = 0;
// Global variable to track pending 'n' conversion
var pendingNConversion = null;


// Toast notification system
function showToast(message, type = 'info', duration = 3000) {
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Load words database
async function loadWordsDatabase() {
  try {
    const response = await fetch('words_database.json');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    wordsDatabase = await response.json();
    console.log(`Loaded ${wordsDatabase.metadata.total_words} words`);
    showToast(`Loaded ${wordsDatabase.metadata.total_words} words`, 'success', 2000);
    return wordsDatabase;
  } catch (error) {
    console.error('Error loading words database:', error);
    showToast('Failed to load word database', 'error');
    return null;
  }
}

// Get new answer
async function getNewAnswer() {
  if (!wordsDatabase) {
    showToast('Initializing word list...', 'info', 2000);
    await loadWordsDatabase();
  }
  
  if (!wordsDatabase || !wordsDatabase.words.length) {
    showToast('Failed to load words', 'error');
    return null;
  }
  
  const fourCharWords = wordsDatabase.words.filter(w => w.kana.length === 4);
  const randomIndex = Math.floor(Math.random() * fourCharWords.length);
  const selectedWord = fourCharWords[randomIndex];
  
  answer = selectedWord.kana;
  answerKanji = selectedWord.kanji;
  
  console.log(`Answer selected: ${answer} (${answerKanji})`);
  showToast('New word selected!', 'success', 1500);
  
  return answer;
}

// Validate word
async function validateWord(word) {
  if (!wordsDatabase) return false;
  return wordsDatabase.words.some(w => w.kana === word);
}

// Move to next input field with improved romaji handling
function moveToNext(currentField, nextField) {
  const strr = currentField.value + "";
  currentField.value = currentField.value.trim();
  
  // Clear any pending n conversion if user typed something else
  if (pendingNConversion && pendingNConversion.field === currentField) {
    clearTimeout(pendingNConversion.timeout);
    pendingNConversion = null;
  }

  // Check if it's already a hiragana character
  if (hiraganaArray.includes(strr)) {
    if (nextField != null) {
      nextField.focus();
    }
    return;
  }
  
  // Handle special case for standalone 'n'
  if (strr === 'n') {
    // Wait to see if user will type more characters
    pendingNConversion = {
      field: currentField,
      timeout: setTimeout(() => {
        if (currentField.value === 'n') {
          currentField.value = 'ん';
          if (nextField != null) {
            nextField.focus();
          }
        }
        pendingNConversion = null;
      }, 500) // Wait 500ms before converting standalone 'n'
    };
    return;
  }
  
  // Handle 'nn' immediately
  if (strr === 'nn') {
    currentField.value = 'ん';
    if (nextField != null) {
      nextField.focus();
    }
    return;
  }
  
  // Try to convert romaji to hiragana
  const japchar = hiraganas.get(strr.toLowerCase());
  if (japchar !== undefined) {
    currentField.value = japchar;
    if (nextField != null) {
      nextField.focus();
    }
  }
}

// Updated onKeyDown function to handle the n conversion properly
function onKeyDown(event, previousField, currentField) {
  const key = event.key;
  
  // Handle n conversion on specific keys
  if (pendingNConversion && pendingNConversion.field === currentField) {
    if (key === ' ' || key === 'Enter' || key === 'Tab' || key === 'ArrowRight') {
      // Force conversion of standalone 'n'
      clearTimeout(pendingNConversion.timeout);
      if (currentField.value === 'n') {
        currentField.value = 'ん';
        pendingNConversion = null;
        
        // Move to next field if space or tab was pressed
        if ((key === ' ' || key === 'Tab') && nextField) {
          event.preventDefault();
          const nextField = getNextField(currentField);
          if (nextField && !nextField.disabled) {
            nextField.focus();
          }
        }
      }
    } else if (key.length === 1 && key !== 'n') {
      // User is typing something after 'n', let the natural flow continue
      clearTimeout(pendingNConversion.timeout);
      pendingNConversion = null;
    }
  }

  if (key === "Backspace" || key === "Delete") {
    // Clear any pending conversion when deleting
    if (pendingNConversion && pendingNConversion.field === currentField) {
      clearTimeout(pendingNConversion.timeout);
      pendingNConversion = null;
    }
    
    if (previousField != null && currentField.value === "") {
      previousField.focus();
      const length = previousField.value.length;
      previousField.setSelectionRange(length, length);
    }
  }

  if (answer && key === "Enter") {
    // Convert any pending 'n' before submitting
    if (pendingNConversion) {
      clearTimeout(pendingNConversion.timeout);
      if (pendingNConversion.field.value === 'n') {
        pendingNConversion.field.value = 'ん';
      }
      pendingNConversion = null;
    }
    
    if (currentField.id.endsWith("fof")) {
      processGuess(currentField);
    }
  }
}

// Get next field helper
function getNextField(currentField) {
  const order = ['fif', 'sef', 'thf', 'fof'];
  const currentId = currentField.id;
  
  for (let i = 0; i < order.length - 1; i++) {
    if (currentId.includes(order[i])) {
      return document.getElementById(currentId.replace(order[i], order[i + 1]));
    }
  }
  return null;
}

// Get group inputs
function getGroupInputs(className, groupPrefix) {
  const order = ['fi', 'se', 'th', 'fo'];
  const regex = new RegExp(`^${groupPrefix}(fi|se|th|fo)f$`);
  
  const inputs = Array.from(document.querySelectorAll('.' + className))
    .filter(input => regex.test(input.id));
  
  inputs.sort((a, b) => {
    const aKey = order.findIndex(k => a.id.includes(k));
    const bKey = order.findIndex(k => b.id.includes(k));
    return aKey - bKey;
  });
  
  return inputs.map(i => i.value);
}

// Process user guess
async function processGuess(currentField) {
  const order = ['fi', 'se', 'th', 'fo', 'fv', 'sx', 'sv', 'ei'];
  const groupPrefix = currentField.id.substring(0, 2);
  const userAnswer = getGroupInputs(currentField.className, groupPrefix);
  const joinedUserAnswer = userAnswer.join('');
  
  console.log("Processing guess: " + joinedUserAnswer);
  
  // Check if all fields are filled
  if (userAnswer.some(char => !char)) {
    showToast('Please fill all fields', 'warning', 2000);
    return;
  }
  
  // Validate word
  const isValidWord = await validateWord(joinedUserAnswer);
  
  if (!isValidWord) {
    console.warn("Received an invalid answer.");
    showToast('Word not in word list!', 'warning', 2000);
    return;
  }
  
  const answerArray = answer.split("");
  const answerStatusArray = getCorrectionStateArray(answerArray, userAnswer);
  
  // Color the boxes with delay
  for (let i = 0; i < answerArray.length; i++) {
    const box = document.getElementById(groupPrefix + ['fi', 'se', 'th', 'fo'][i] + 'f');
    const timeoutDelay = i * 150;
    
    setTimeout(() => {
      switch (answerStatusArray[i]) {
        case 1:
          box.style.backgroundColor = 'yellow';
          break;
        case 2:
          box.style.backgroundColor = 'lightgreen';
          break;
        default:
          box.style.backgroundColor = 'lightgray';
          break;
      }
    }, timeoutDelay);
  }
  
  const isCorrect = answer === joinedUserAnswer;
  
  // Lock current row and unlock next
  const inputs = document.querySelectorAll('.' + currentField.className);
  inputs.forEach(input => {
    if (input.id.startsWith(groupPrefix)) {
      input.disabled = true;
    }
  });
  
  if (isCorrect) {
    setTimeout(() => showVictory(), 800);
  } else {
    const ordIndex = order.indexOf(groupPrefix) + 1;
    if (ordIndex < order.length) {
      // Enable next row
      setTimeout(() => {
        inputs.forEach(input => {
          if (input.id.startsWith(order[ordIndex])) {
            input.disabled = false;
            if (input.id.includes('fif')) {
              input.focus();
            }
          }
        });
      }, 600);
    } else {
      // Game over
      setTimeout(() => showGameOver(), 800);
    }
  }
  
  currentRow++;
}

// Get correction state array
function getCorrectionStateArray(answerList, guessList) {
  let res = new Array(answerList.length).fill(0);
  let tempAns = [...answerList];
  
  // First pass: mark correct positions
  for (let i = 0; i < answerList.length; i++) {
    if (guessList[i] === answerList[i]) {
      tempAns[i] = null;
      res[i] = 2;
    }
  }
  
  // Second pass: mark wrong positions
  for (let i = 0; i < res.length; i++) {
    if (res[i] !== 2) {
      for (let j = 0; j < tempAns.length; j++) {
        if (tempAns[j] && guessList[i] === tempAns[j]) {
          tempAns[j] = null;
          res[i] = 1;
          break;
        }
      }
    }
  }
  
  return res;
}

// Create on-screen keyboard with proper Japanese 50-sound table layout
async function createKeyboard() {
  const keyboardSection = document.getElementById('jp_preview_keyboard');
  
  // Proper Japanese 50-sound table layout (gojūon-zu)
  // Each column represents a consonant group (a, ka, sa, ta, na, ha, ma, ya, ra, wa)
  // Each row represents a vowel sound (a, i, u, e, o)
  const keyboardLayout = [
    // a-row (あ段)
    ['あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら', 'わ', 'ん'],
    // i-row (い段)
    ['い', 'き', 'し', 'ち', 'に', 'ひ', 'み', '', 'り', '', 'を'],
    // u-row (う段)
    ['う', 'く', 'す', 'つ', 'ぬ', 'ふ', 'む', 'ゆ', 'る', '', ''],
    // e-row (え段)
    ['え', 'け', 'せ', 'て', 'ね', 'へ', 'め', '', 'れ', '', ''],
    // o-row (お段)
    ['お', 'こ', 'そ', 'と', 'の', 'ほ', 'も', 'よ', 'ろ', '', '']
  ];
  
  // Additional characters (dakuten, handakuten) - TRANSPOSED
  // Now organized as columns: が行, ざ行, だ行, ば行, ぱ行
  // Each row represents a vowel sound (a, i, u, e, o)
  const additionalKeys = [
    // a-row
    ['が', 'ざ', 'だ', 'ば', 'ぱ'],
    // i-row
    ['ぎ', 'じ', 'ぢ', 'び', 'ぴ'],
    // u-row
    ['ぐ', 'ず', 'づ', 'ぶ', 'ぷ'],
    // e-row
    ['げ', 'ぜ', 'で', 'べ', 'ぺ'],
    // o-row
    ['ご', 'ぞ', 'ど', 'ぼ', 'ぽ']
  ];
  
  // Special keys row
  const specialKeys = ['ゃ', 'ゅ', 'ょ', 'っ', 'ー', '゛', '゜', '⌫', 'Enter'];
  
  keyboardSection.innerHTML = '';
  const container = document.createElement('div');
  container.className = 'keyboard-container';
  
  // Add main keyboard layout
  const mainKeyboard = document.createElement('div');
  mainKeyboard.className = 'main-keyboard';
  
  keyboardLayout.forEach((row, rowIndex) => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'keyboard-row';
    
    row.forEach((key, colIndex) => {
      const button = document.createElement('button');
      button.className = 'keyboard-key';
      
      if (key) {
        button.textContent = key;
        button.onclick = () => handleKeyboardInput(key);
        
        // Special styling for ん and を (without bold)
        if (key === 'ん' || key === 'を') {
          button.classList.add('special-kana');
        }
      } else {
        // Empty space - make it invisible but maintain layout
        button.style.visibility = 'hidden';
        button.disabled = true;
      }
      
      rowDiv.appendChild(button);
    });
    
    mainKeyboard.appendChild(rowDiv);
  });
  
  container.appendChild(mainKeyboard);
  
  // Add separator
  const separator = document.createElement('div');
  separator.style.height = '10px';
  container.appendChild(separator);
  
  // Add additional characters section with toggle
  const additionalSection = document.createElement('div');
  additionalSection.className = 'additional-keyboard';
  
  // Toggle button for dakuten/handakuten characters
  const toggleButton = document.createElement('button');
  toggleButton.className = 'keyboard-toggle';
  toggleButton.textContent = '濁点・半濁点を表示 (Show dakuten/handakuten)';
  toggleButton.onclick = () => {
    const dakutenSection = document.getElementById('dakuten-section');
    if (dakutenSection.style.display === 'none') {
      dakutenSection.style.display = 'block';
      toggleButton.textContent = '濁点・半濁点を隠す (Hide dakuten/handakuten)';
    } else {
      dakutenSection.style.display = 'none';
      toggleButton.textContent = '濁点・半濁点を表示 (Show dakuten/handakuten)';
    }
  };
  additionalSection.appendChild(toggleButton);
  
  // Dakuten/Handakuten section (hidden by default)
  const dakutenSection = document.createElement('div');
  dakutenSection.id = 'dakuten-section';
  dakutenSection.style.display = 'none';
  
  additionalKeys.forEach((row) => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'keyboard-row dakuten-row';
    
    row.forEach((key) => {
      const button = document.createElement('button');
      button.className = 'keyboard-key small-key';
      button.textContent = key;
      button.onclick = () => handleKeyboardInput(key);
      
      rowDiv.appendChild(button);
    });
    
    dakutenSection.appendChild(rowDiv);
  });
  
  additionalSection.appendChild(dakutenSection);
  container.appendChild(additionalSection);
  
  // Add special keys row at the bottom
  const specialRow = document.createElement('div');
  specialRow.className = 'keyboard-row special-row';
  
  specialKeys.forEach(key => {
    const button = document.createElement('button');
    button.className = 'keyboard-key';
    button.textContent = key === '⌫' ? '削除' : key;
    button.onclick = () => handleKeyboardInput(key);
    
    if (key === '⌫' || key === 'Enter') {
      button.classList.add('action-key');
    } else if (['ゃ', 'ゅ', 'ょ', 'っ'].includes(key)) {
      button.classList.add('small-kana-key');
    } else if (key === '゛' || key === '゜') {
      button.classList.add('dakuten-key');
    }
    
    specialRow.appendChild(button);
  });
  
  container.appendChild(specialRow);
  keyboardSection.appendChild(container);
}

// Handle keyboard input
function handleKeyboardInput(key) {
  // Find the currently active input or first enabled input
  let activeElement = document.activeElement;
  
  if (!activeElement || !activeElement.classList.contains('worrow') || activeElement.disabled) {
    const enabledInputs = Array.from(document.querySelectorAll('.worrow:not(:disabled)'));
    if (enabledInputs.length > 0) {
      activeElement = enabledInputs.find(input => !input.value) || enabledInputs[0];
      activeElement.focus();
    } else {
      return;
    }
  }
  
  if (key === '⌫') {
    // Handle backspace
    if (activeElement.value) {
      activeElement.value = '';
    } else {
      // Move to previous field if current is empty
      const event = new KeyboardEvent('keydown', { key: 'Backspace' });
      activeElement.dispatchEvent(event);
      
      const prevField = getPreviousField(activeElement);
      if (prevField && !prevField.disabled) {
        prevField.focus();
        prevField.value = '';
      }
    }
  } else if (key === 'Enter') {
    // Find the last field in the current row
    const rowPrefix = activeElement.id.substring(0, 2);
    const lastField = document.getElementById(rowPrefix + 'fof');
    if (lastField) {
      processGuess(lastField);
    }
  } else if (key === '゛' || key === '゜') {
    // Apply dakuten/handakuten
    applyDakuten(activeElement, key);
  } else {
    // Regular character input
    activeElement.value = key;
    const nextField = getNextField(activeElement);
    if (nextField && !nextField.disabled) {
      nextField.focus();
    }
  }
}

// Get previous field helper
function getPreviousField(currentField) {
  const order = ['fif', 'sef', 'thf', 'fof'];
  const currentId = currentField.id;
  
  for (let i = order.length - 1; i > 0; i--) {
    if (currentId.includes(order[i])) {
      return document.getElementById(currentId.replace(order[i], order[i - 1]));
    }
  }
  return null;
}

// Apply dakuten/handakuten
function applyDakuten(field, mark) {
  const dakutenMap = {
    'か': 'が', 'き': 'ぎ', 'く': 'ぐ', 'け': 'げ', 'こ': 'ご',
    'さ': 'ざ', 'し': 'じ', 'す': 'ず', 'せ': 'ぜ', 'そ': 'ぞ',
    'た': 'だ', 'ち': 'ぢ', 'つ': 'づ', 'て': 'で', 'と': 'ど',
    'は': 'ば', 'ひ': 'び', 'ふ': 'ぶ', 'へ': 'べ', 'ほ': 'ぼ'
  };
  
  const handakutenMap = {
    'は': 'ぱ', 'ひ': 'ぴ', 'ふ': 'ぷ', 'へ': 'ぺ', 'ほ': 'ぽ'
  };
  
  // Check previous field if current is empty
  let targetField = field;
  if (!field.value) {
    targetField = getPreviousField(field);
    if (!targetField || !targetField.value) return;
  }
  
  const currentChar = targetField.value;
  if (mark === '゛' && dakutenMap[currentChar]) {
    targetField.value = dakutenMap[currentChar];
  } else if (mark === '゜' && handakutenMap[currentChar]) {
    targetField.value = handakutenMap[currentChar];
  }
}

// Show victory popup
function showVictory() {
  const popup = document.getElementById('victorypopup');
  popup.style.display = 'block';
  document.getElementById("victorypopupmsg").innerText = `Correct! The answer was「${answer}(${answerKanji})」!`;
  document.getElementById("background").style.backgroundColor = 'lightgreen';
  showToast('Congratulations! You won!', 'success', 3000);
}

// Show game over popup
function showGameOver() {
  const popup = document.getElementById('gameoverpop');
  popup.style.display = 'block';
  document.getElementById("gameovermsg").innerText = `Game Over! The answer was「${answer}(${answerKanji})」!`;
  showToast('Game Over! Better luck next time!', 'error', 3000);
}

// Close popups
function closePopUp() {
  document.getElementById("gameoverpop").style.display = 'none';
  document.getElementById("victorypopup").style.display = 'none';
  location.reload(); // Reload for new game
}

// Update the onLoad function to include the new listeners
async function onLoad() {
  showToast('Loading word database...', 'info');
  
  answer = await getNewAnswer();
  
  if (!answer) {
    showToast('Failed to initialize game', 'error');
    return;
  }
  
  showToast('Ready to play!', 'success', 2000);
  
  // Enable first row only
  const inputs = document.querySelectorAll('.worrow');
  inputs.forEach(input => {
    if (input.id.startsWith('fi')) {
      input.disabled = false;
    } else {
      input.disabled = true;
    }
  });
  
  // Set up input listeners for better romaji handling
  setupInputListeners();
  
  // Focus first input
  document.getElementById('fifif').focus();
  
  // Initialize keyboard
  await createKeyboard();
}


// Add an input event listener for better romaji handling
function setupInputListeners() {
  const inputs = document.querySelectorAll('.worrow');
  
  inputs.forEach(input => {
    // Add input event listener for better character detection
    input.addEventListener('input', function(e) {
      const value = e.target.value.toLowerCase();
      
      // Check if we can convert the current value
      if (value.length >= 2 && value !== 'nn') {
        const japchar = hiraganas.get(value);
        if (japchar !== undefined) {
          e.target.value = japchar;
          const nextField = getNextField(e.target);
          if (nextField && !nextField.disabled) {
            nextField.focus();
          }
        }
      }
    });
    
    // Add blur event to convert standalone 'n' when leaving field
    input.addEventListener('blur', function(e) {
      if (e.target.value === 'n') {
        e.target.value = 'ん';
        if (pendingNConversion && pendingNConversion.field === e.target) {
          clearTimeout(pendingNConversion.timeout);
          pendingNConversion = null;
        }
      }
    });
  });
}
