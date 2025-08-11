// Gujarati to English transliteration utility

// More comprehensive Sulekh to English mapping
const sulekhToEnglishMap = {
  // Vowels and vowel signs
  'á': 'a', 'áâ': 'aa', 'å': 'i', 'æ': 'ee', 'é': 'u', 'ê': 'oo',
  'áë': 'e', 'áì': 'ai', 'áí': 'o', 'áî': 'au',
  'â': 'aa', 'ã': 'i', 'ä': 'ee', 'ç': 'u', 'è': 'oo',
  'ë': 'e', 'ì': 'ai', 'í': 'o', 'î': 'au',
  'ï': 'n', 'ð': 'h', 'ö': 'ru',
  
  // Consonants
  '»': 'ka', '¼': 'kha', '½': 'ga', '¾': 'gha', 'a': 'nga',
  '¿': 'cha', 'À': 'chha', 'Á': 'ja', 'Â': 'jha', ':': 'nya',
  'Ã': 'ta', 'Ä': 'tha', 'Å': 'da', 'Æ': 'dha', 'Ç': 'na',
  'È': 'ta', 'É': 'tha', 'Ê': 'da', 'Ë': 'dha', 'Ì': 'na',
  'Í': 'pa', 'Î': 'fa', 'Ï': 'ba', 'Ð': 'bha', 'Ñ': 'ma',
  'Ò': 'ya', 'Ó': 'ra', 'Ô': 'la', 'Õ': 'va',
  '×': 'sha', 'Ø': 'sha', 'Ö': 'sa', 'Ú': 'ha', 'Û': 'la',
  'Ü': 'ksha', 'Þ': 'gna',
  
  // Special combinations
  'Ù': 'shri', 'ô': 'r', 'ó': '.', 'õ': 'rn',
  'z': '', // halant
  's': 's', 'Õ': 'v', 'w': 'sh',
  
  // Common words
  'sÕâÑä': 'swami',
  'Ùä': 'shri',
  
  // Numbers
  '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
  '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
  
  // Punctuation
  '-': '-', ',': ',', '.': '.', '!': '!', '?': '?',
  '(': '(', ')': ')', ' ': ' ', '\n': '\n', '\t': '\t'
};

// Unicode Gujarati to English mapping
const gujaratiToEnglishMap = {
  // Vowels
  'અ': 'a', 'આ': 'aa', 'ઇ': 'i', 'ઈ': 'ee', 'ઉ': 'u', 'ઊ': 'oo',
  'ઋ': 'ru', 'એ': 'e', 'ઐ': 'ai', 'ઓ': 'o', 'ઔ': 'au',
  
  // Consonants
  'ક': 'ka', 'ખ': 'kha', 'ગ': 'ga', 'ઘ': 'gha', 'ઙ': 'nga',
  'ચ': 'cha', 'છ': 'chha', 'જ': 'ja', 'ઝ': 'jha', 'ઞ': 'nya',
  'ટ': 'ta', 'ઠ': 'tha', 'ડ': 'da', 'ઢ': 'dha', 'ણ': 'na',
  'ત': 'ta', 'થ': 'tha', 'દ': 'da', 'ધ': 'dha', 'ન': 'na',
  'પ': 'pa', 'ફ': 'fa', 'બ': 'ba', 'ભ': 'bha', 'મ': 'ma',
  'ય': 'ya', 'ર': 'ra', 'લ': 'la', 'વ': 'va',
  'શ': 'sha', 'ષ': 'sha', 'સ': 'sa', 'હ': 'ha', 'ળ': 'la',
  'ક્ષ': 'ksha', 'જ્ઞ': 'gna',
  
  // Matras
  'ા': 'aa', 'િ': 'i', 'ી': 'ee', 'ુ': 'u', 'ૂ': 'oo',
  'ૃ': 'ru', 'ે': 'e', 'ૈ': 'ai', '���': 'o', 'ૌ': 'au',
  
  // Special characters
  'ં': 'n', 'ઃ': 'h', '્': '', 'ઁ': 'n',
  
  // Numbers
  '૦': '0', '૧': '1', '૨': '2', '૩': '3', '૪': '4',
  '૫': '5', '૬': '6', '૭': '7', '૮': '8', '૯': '9',
  
  // Punctuation
  '।': '.', '॥': '..',
};

export const sulekhToEnglish = (text) => {
  if (!text) return '';
  
  let result = text;
  
  // First pass - replace longer sequences
  const longSequences = Object.keys(sulekhToEnglishMap)
    .filter(key => key.length > 1)
    .sort((a, b) => b.length - a.length);
  
  for (const seq of longSequences) {
    const replacement = sulekhToEnglishMap[seq];
    result = result.split(seq).join(replacement);
  }
  
  // Second pass - replace single characters
  for (let i = 0; i < result.length; i++) {
    const char = result[i];
    if (sulekhToEnglishMap[char] && !longSequences.some(seq => seq.includes(char))) {
      result = result.substring(0, i) + sulekhToEnglishMap[char] + result.substring(i + 1);
    }
  }
  
  // Clean up the result
  result = result.replace(/aa+/g, 'aa'); // Remove multiple 'a's
  result = result.replace(/([kgjtdnpbmylvsh])a([aeiou])/gi, '$1$2'); // Remove unnecessary 'a'
  result = result.replace(/([kgjtdnpbmylvsh])a\s/gi, '$1 '); // Remove trailing 'a' before space
  result = result.replace(/([kgjtdnpbmylvsh])a$/gi, '$1'); // Remove trailing 'a' at end
  result = result.replace(/\s+/g, ' ').trim(); // Clean up spaces
  
  return result;
};

export const gujaratiToEnglish = (text) => {
  if (!text) return '';
  
  let result = '';
  let i = 0;
  
  while (i < text.length) {
    // Check for two-character combinations first
    if (i < text.length - 1) {
      const twoChar = text.substr(i, 2);
      if (gujaratiToEnglishMap[twoChar]) {
        result += gujaratiToEnglishMap[twoChar];
        i += 2;
        continue;
      }
    }
    
    // Single character
    const char = text[i];
    if (gujaratiToEnglishMap[char]) {
      result += gujaratiToEnglishMap[char];
    } else if (/[a-zA-Z0-9\s.,!?;:\-]/.test(char)) {
      // Keep English characters and common punctuation as is
      result += char;
    } else {
      // Keep unknown characters as is
      result += char;
    }
    i++;
  }
  
  // Clean up the result
  result = result.replace(/aa+/g, 'aa'); // Remove multiple 'a's
  result = result.replace(/([kgjtdnpbmylvsh])a([aeiou])/gi, '$1$2'); // Remove unnecessary 'a'
  result = result.replace(/([kgjtdnpbmylvsh])a\s/gi, '$1 '); // Remove trailing 'a' before space
  result = result.replace(/([kgjtdnpbmylvsh])a$/gi, '$1'); // Remove trailing 'a' at end
  result = result.replace(/\s+/g, ' ').trim(); // Clean up spaces
  
  return result;
};