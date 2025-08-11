// Safe conversion utilities with error handling and performance optimization

const sulekhToUnicodeMap = {
  // Special combinations first
  'áí': 'ઓ', 'áî': 'ઔ', 'áë': 'એ', 'áì': 'ઐ', 'áâ': 'આ',
  
  // Single characters
  'á': 'અ', 'å': 'ઇ', 'æ': 'ઈ', 'é': 'ઉ', 'ê': 'ઊ',
  '»': 'ક', '¼': 'ખ', '½': 'ગ', '¾': 'ઘ',
  '¿': 'ચ', 'À': 'છ', 'Á': 'જ', 'Â': 'ઝ',
  'Ã': 'ટ', 'Ä': 'ઠ', 'Å': 'ડ', 'Æ': 'ઢ', 'Ç': 'ણ',
  'È': 'ત', 'É': 'થ', 'Ê': 'દ', 'Ë': 'ધ', 'Ì': 'ન',
  'Í': 'પ', 'Î': 'ફ', 'Ï': 'બ', 'Ð': 'ભ', 'Ñ': 'મ',
  'Ò': 'ય', 'Ó': 'ર', 'Ô': 'લ', 'Õ': 'વ',
  '×': 'શ', 'Ø': 'ષ', 'Ö': 'સ', 'Ú': 'હ', 'Û': 'ળ',
  
  // Matras
  'â': 'ા', 'ã': 'િ', 'ä': 'ી', 'ç': 'ુ', 'è': 'ૂ',
  'ë': 'ે', 'ì': 'ૈ', 'í': 'ો', 'î': 'ૌ',
  'ï': 'ં', 'ð': 'ઃ', 'z': '્',
  
  // Special
  'ó': '।', 'ô': 'ર્',
  
  // Numbers
  '0': '૦', '1': '૧', '2': '૨', '3': '૩', '4': '૪',
  '5': '૫', '6': '૬', '7': '૭', '8': '૮', '9': '૯'
};

export const safeSulekhToUnicode = (text) => {
  if (!text) return '';
  
  try {
    let result = text;
    
    // Sort by length to handle multi-character mappings first
    const sortedEntries = Object.entries(sulekhToUnicodeMap)
      .sort(([a], [b]) => b.length - a.length);
    
    // Process each mapping
    for (const [sulekh, unicode] of sortedEntries) {
      // Use split-join for safe replacement
      if (result.includes(sulekh)) {
        result = result.split(sulekh).join(unicode);
      }
    }
    
    return result;
  } catch (error) {
    console.error('Safe conversion error:', error);
    return text;
  }
};

export const safeSulekhToEnglish = (text) => {
  if (!text) return '';
  
  const sulekhToEnglishMap = {
    // Vowels
    'á': 'a', 'áâ': 'aa', 'å': 'i', 'æ': 'ee', 'é': 'u', 'ê': 'oo',
    'áë': 'e', 'áì': 'ai', 'áí': 'o', 'áî': 'au',
    
    // Consonants
    '»': 'ka', '¼': 'kha', '½': 'ga', '¾': 'gha',
    '¿': 'cha', 'À': 'chha', 'Á': 'ja', 'Â': 'jha',
    'Ã': 'ta', 'Ä': 'tha', 'Å': 'da', 'Æ': 'dha', 'Ç': 'na',
    'È': 'ta', 'É': 'tha', 'Ê': 'da', 'Ë': 'dha', 'Ì': 'na',
    'Í': 'pa', 'Î': 'fa', 'Ï': 'ba', 'Ð': 'bha', 'Ñ': 'ma',
    'Ò': 'ya', 'Ó': 'ra', 'Ô': 'la', 'Õ': 'va',
    '×': 'sha', 'Ø': 'sha', 'Ö': 'sa', 'Ú': 'ha', 'Û': 'la',
    
    // Matras
    'â': 'aa', 'ã': 'i', 'ä': 'ee', 'ç': 'u', 'è': 'oo',
    'ë': 'e', 'ì': 'ai', 'í': 'o', 'î': 'au',
    'ï': 'n', 'ð': 'h', 'z': '',
    
    // Special
    'ó': '.', 'ô': 'r',
    'Ù': 'shri', 'sÕâÑä': 'swami'
  };
  
  try {
    let result = text;
    
    // Sort by length to handle multi-character mappings first
    const sortedEntries = Object.entries(sulekhToEnglishMap)
      .sort(([a], [b]) => b.length - a.length);
    
    // Process each mapping
    for (const [sulekh, english] of sortedEntries) {
      if (result.includes(sulekh)) {
        result = result.split(sulekh).join(english);
      }
    }
    
    // Clean up
    result = result.replace(/aa+/g, 'aa');
    result = result.replace(/([kgjtdnpbmylvsh])a([aeiou])/gi, '$1$2');
    result = result.replace(/\s+/g, ' ').trim();
    
    return result;
  } catch (error) {
    console.error('English conversion error:', error);
    return text;
  }
};