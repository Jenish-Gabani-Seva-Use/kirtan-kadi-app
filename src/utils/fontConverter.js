// Unicode to Sulekh and Sulekh to Unicode conversion utilities

export const convertUnicodeToSulekh = (text) => {
  if (!text) return text;
  
  let modifiedText = text;
  
  // Pre-processing
  modifiedText = modifiedText.replace(/;/g, "ñ");
  modifiedText = modifiedText.replace(/ત્ર્/g, "X");
  modifiedText = modifiedText.replace(/ક્ષ્/g, "x");
  modifiedText = modifiedText.replace(/શ્ર્ન/g, "—");
  modifiedText = modifiedText.replace(/શ્ર્/g, "W");
  modifiedText = modifiedText.replace(/ર્/g, "ô");
  modifiedText = modifiedText.replace(/X/g, "ત્ર્");
  modifiedText = modifiedText.replace(/x/g, "ક્ષ્");
  
  // Adjust position of i maatraas
  modifiedText = modifiedText.replace(/િં/g, "i");
  modifiedText = modifiedText.replace(/િ/g, "ã");
  
  // Reph positioning
  modifiedText = modifiedText.replace(/ô([કખગઘઙચછજઝઞટઠડઢણતથદધનપફબભમયરલવશષસહળ])([્])/g, "$1$2ô");
  modifiedText = modifiedText.replace(/ô([કખગઘઙચછજઝઞટ��ડઢણતથદધનપફબભમયરલવશષસહળ])([્])/g, "$1$2ô");
  modifiedText = modifiedText.replace(/ô([કખગઘઙચછજઝઞટઠડઢણતથદધનપફબભમયરલવશષસહળ])([ાીુૂૃેૈોૌંઁૅૉ઼]*)/g, "$1$2ô");
  
  modifiedText = modifiedText.replace(/ીô/g, "þ");
  modifiedText = modifiedText.replace(/ંô/g, "õ");
  modifiedText = modifiedText.replace(/ôã/g, "ãô");
  modifiedText = modifiedText.replace(/ôi/g, "ãõ");
  
  // Adjust i maatraa position
  modifiedText = modifiedText.replace(/([કખગઘઙચછજઝઞટઠડઢણતથદધનપફબભમયરલવશષસહળ])([iã])/g, "$2$1");
  modifiedText = modifiedText.replace(/([કખગઘઙચછજઝઞટઠડઢણતથદધનપફબભમયરલવશષસહળ])(્)([*iã])/g, "$3$1$2");
  modifiedText = modifiedText.replace(/([કખગઘઙચછજઝઞટઠડઢણતથદધનપફબભમયરલવશષ���હળ])(્)([iã])/g, "$3$1$2");
  
  // Halanta handling
  modifiedText = modifiedText.replace(/[્]([ \,\;\.।\n\-\:])/g, "z$1");
  
  // Main conversion mapping
  const conversionMap = [
    ["ૐ", "A"],
    ["ઈં", "š"],
    ["ઇં", "™"],
    ["ઉં", "ø"],
    ["ઊં", "ù"],
    ["અ", "á"],
    ["આ", "áâ"],
    ["ઇ", "å"],
    ["ઈ", "æ"],
    ["ઉ", "é"],
    ["ઊ", "ê"],
    ["ઋ", "°"],
    ["એ", "áë"],
    ["ઐ", "áì"],
    ["ઓ", "áí"],
    ["ઔ", "áî"],
    ["ઍ", "á&"],
    ["ઑ", "áâ&"],
    ["ક", "»"],
    ["ખ", "¼"],
    ["ગ", "½"],
    ["ઘ", "¾"],
    ["ઙ", "a"],
    ["ચ", "¿"],
    ["છ", "À"],
    ["જ", "Á"],
    ["ઝ", "Â"],
    ["ઞ", ":â"],
    ["ટ", "Ã"],
    ["ઠ", "Ä"],
    ["ડ", "Å"],
    ["ઢ", "Æ"],
    ["ણ", "Ç"],
    ["ત", "È"],
    ["થ", "É"],
    ["દ", "Ê"],
    ["ધ", "Ë"],
    ["ન", "Ì"],
    ["પ", "Í"],
    ["ફ", "Î"],
    ["બ", "Ï"],
    ["ભ", "Ð"],
    ["મ", "Ñ"],
    ["ય", "Ò"],
    ["ર", "Ó"],
    ["લ", "Ô"],
    ["વ", "Õ"],
    ["શ", "��"],
    ["ષ", "Ø"],
    ["સ", "Ö"],
    ["હ", "Ú"],
    ["ળ", "Û"],
    ["ક્ષ", "Ü"],
    ["જ્ઞ", "Þ"],
    ["ા", "â"],
    ["િ", "ã"],
    ["ી", "ä"],
    ["ુ", "ç"],
    ["ૂ", "è"],
    ["ૃ", "ö"],
    ["ે", "ë"],
    ["ૈ", "ì"],
    ["ો", "í"],
    ["ૌ", "î"],
    ["ં", "ï"],
    ["ઃ", "ð"],
    ["્", "z"],
    ["।", "ó"],
    ["૦", "0"],
    ["૧", "1"],
    ["૨", "2"],
    ["૩", "3"],
    ["૪", "4"],
    ["૫", "5"],
    ["૬", "6"],
    ["૭", "7"],
    ["૮", "8"],
    ["૯", "9"]
  ];
  
  // Apply conversion mapping
  for (let i = 0; i < conversionMap.length; i++) {
    const [unicode, sulekh] = conversionMap[i];
    modifiedText = modifiedText.split(unicode).join(sulekh);
  }
  
  return modifiedText;
};

export const convertSulekhToUnicode = (text) => {
  if (!text) return text;
  
  let modifiedText = text;
  
  // First, handle special character combinations that might be corrupted
  modifiedText = modifiedText.replace(/ã��/g, "શિ");
  modifiedText = modifiedText.replace(/��/g, "શ");
  modifiedText = modifiedText.replace(/Ø/g, "ષ્ટ");
  modifiedText = modifiedText.replace(/z:/g, "્ઞ");
  modifiedText = modifiedText.replace(/Ð/g, "ભ");
  modifiedText = modifiedText.replace(/½/g, "ગ");
  modifiedText = modifiedText.replace(/Õ/g, "વ");
  modifiedText = modifiedText.replace(/È/g, "ત");
  modifiedText = modifiedText.replace(/Ì/g, "ન");
  modifiedText = modifiedText.replace(/Ç/g, "ણ");
  modifiedText = modifiedText.replace(/Ñ/g, "મ");
  modifiedText = modifiedText.replace(/Ó/g, "ર");
  modifiedText = modifiedText.replace(/Ú/g, "હ");
  modifiedText = modifiedText.replace(/Á/g, "જ");
  modifiedText = modifiedText.replace(/É/g, "થ");
  modifiedText = modifiedText.replace(/Ë/g, "ધ");
  modifiedText = modifiedText.replace(/Í/g, "પ");
  modifiedText = modifiedText.replace(/Ò/g, "ય");
  modifiedText = modifiedText.replace(/Ô/g, "લ");
  modifiedText = modifiedText.replace(/Ö/g, "સ");
  modifiedText = modifiedText.replace(/×/g, "શ");
  modifiedText = modifiedText.replace(/Ã/g, "ટ");
  modifiedText = modifiedText.replace(/Ä/g, "ઠ");
  modifiedText = modifiedText.replace(/Å/g, "ડ");
  modifiedText = modifiedText.replace(/Æ/g, "ઢ");
  modifiedText = modifiedText.replace(/Ê/g, "દ");
  modifiedText = modifiedText.replace(/Î/g, "ફ");
  modifiedText = modifiedText.replace(/Ï/g, "બ");
  modifiedText = modifiedText.replace(/¿/g, "ચ");
  modifiedText = modifiedText.replace(/À/g, "છ");
  modifiedText = modifiedText.replace(/»/g, "ક");
  modifiedText = modifiedText.replace(/¼/g, "ખ");
  modifiedText = modifiedText.replace(/¾/g, "ઘ");
  
  // Conversion mapping for remaining characters
  const conversionMap = [
    ["A", "ૐ"],
    ["áí", "ઓ"],
    ["áî", "ઔ"],
    ["áë", "એ"],
    ["á&", "ઍ"],
    ["áì", "ઐ"],
    ["áâ&", "ઑ"],
    ["áâ", "આ"],
    ["á", "અ"],
    ["å", "ઇ"],
    ["æ", "ઈ"],
    ["é", "ઉ"],
    ["ê", "ઊ"],
    ["°", "ઋ"],
    ["š", "ઈં"],
    ["™", "ઇં"],
    ["ø", "ઉં"],
    ["ù", "ઊં"],
    ["Ü", "ક્ષ"],
    ["Ý", "ત્ર"],
    ["Þ", "જ્ઞ"],
    ["Q", "ઠ્ઠ"],
    ["»", "ક"],
    ["¼", "ખ"],
    ["½", "ગ"],
    ["¾", "ઘ"],
    ["a", "ઙ"],
    ["¿", "ચ"],
    ["À", "છ"],
    ["Á", "જ"],
    ["Â", "ઝ"],
    ["Ã", "ટ"],
    ["Ä", "ઠ"],
    ["Å", "ડ"],
    ["Æ", "ઢ"],
    ["Ç", "ણ"],
    ["È", "ત"],
    ["É", "થ"],
    ["Ê", "દ"],
    ["Ë", "ધ"],
    ["Ì", "ન"],
    ["Í", "પ"],
    ["Î", "ફ"],
    ["Ï", "બ"],
    ["Ð", "ભ"],
    ["Ñ", "મ"],
    ["Ò", "ય"],
    ["Ó", "ર"],
    ["Ô", "લ"],
    ["Õ", "વ"],
    ["×", "શ"],
    ["Ø", "ષ"],
    ["Ö", "સ"],
    ["Ú", "હ"],
    ["Û", "ળ"],
    ["â", "ા"],
    ["ä", "ી"],
    ["ç", "ુ"],
    ["è", "ૂ"],
    ["ö", "ૃ"],
    ["ë", "ે"],
    ["ì", "ૈ"],
    ["í", "ો"],
    ["î", "ૌ"],
    ["ï", "ં"],
    ["ð", "ઃ"],
    ["z", "્"],
    ["ó", "।"],
    ["0", "૦"],
    ["1", "૧"],
    ["2", "૨"],
    ["3", "૩"],
    ["4", "૪"],
    ["5", "૫"],
    ["6", "૬"],
    ["7", "૭"],
    ["8", "૮"],
    ["9", "૯"]
  ];
  
  // Apply conversion mapping
  for (let i = 0; i < conversionMap.length; i++) {
    const [sulekh, unicode] = conversionMap[i];
    modifiedText = modifiedText.split(sulekh).join(unicode);
  }
  
  // Post-processing for proper positioning
  modifiedText = modifiedText.replace(/ý/g, "્ર");
  modifiedText = modifiedText.replace(/([ãi*])([કખગઘઙચછજઝઞટઠડઢણતથદધનપફબભમયરલવશષસહળ])/g, "$2$1");
  modifiedText = modifiedText.replace(/([ãi*])(્)([કખગઘઙચછજઝઞટઠડઢણતથદધનપફબભમયરલવશષસહળ])/g, "$2$3$1");
  modifiedText = modifiedText.replace(/([ãi*])(્)([કખગઘઙચછજઝઞટઠડઢણતથદધનપફબભમયરલવશષસહળ])/g, "$2$3$1");
  modifiedText = modifiedText.replace(/ã/g, "િ");
  modifiedText = modifiedText.replace(/i/g, "િં");
  
  // Reph positioning
  modifiedText = modifiedText.replace(/þ/g, "ôી");
  modifiedText = modifiedText.replace(/õ/g, "ંô");
  modifiedText = modifiedText.replace(/([કખગઘઙચછજઝઞટઠડઢણતથદધનપફબભમયરલવશષસહળ])([ાિીુૂૃેૈોૌંઁૅૉ઼]*)([ô])/g, "$3$1$2");
  modifiedText = modifiedText.replace(/([કખગઘઙચછજઝઞટઠડઢણતથદધનપફબભમયરલવશષસહળ])([્])([ô])/g, "$3$1$2");
  modifiedText = modifiedText.replace(/([કખગઘઙચછજઝઞટઠડઢણતથદધનપફબભમયરલવશષસહળ])([્])([ô])/g, "$3$1$2");
  modifiedText = modifiedText.replace(/ô/g, "ર્");
  
  // Clean up maatras
  modifiedText = modifiedText.replace(/([ંઁ॰])([ાિીુૂૃેૈોૌૅૉ])/g, "$2$1");
  modifiedText = modifiedText.replace(/([ાિીુૂૃેૈોૌૅૉઁ])([ાિીુૂૃેૈોૌૅૉ])/g, "$1");
  
  return modifiedText;
};

// Auto-detect if text is Unicode Gujarati
export const isUnicodeGujarati = (text) => {
  // Check for common Gujarati Unicode characters
  const gujaratiPattern = /[અ-ઔક-હા-ૅે-ૌં-ઃ્]/;
  return gujaratiPattern.test(text);
};

// Auto-detect if text is Sulekh
export const isSulekhText = (text) => {
  // Check for common Sulekh characters
  const sulekhPattern = /[áâåæéêÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕ×ØÖÚÛäçèöëìíîïðz]/;
  return sulekhPattern.test(text);
};