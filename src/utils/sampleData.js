// Sample kirtan data to populate the database
export const sampleKirtans = [
  {
    sulekhTitle: "áâÁ Ö¼ä áâÌïÊÌä ÚëÔä",
    unicodeTitle: "આજ સખી આનંદની હેલી",
    englishTitle: "Aaj sakhi aanand ni heli",
    sulekhContent: `áâÁ Ö¼ä áâÌïÊÌä ÚëÔä, ÚãÓÑç¼ 'ëæÌë Úçï Éæ Àïç Óë ¾ëÔä-1
ÑÚâ Óë ÑçãÌÌâ DÒâÌÑâï ÌâÕë, Èë Óë ×âÑãÛÒí' ÑçÁÌë ÏíÔâÕë-2
Áë Öç¼Ìë ÐÕ Ïý¢â Óë åcÀë, Èë Óë ×âÑãÛÒí' ÑçÁÌë Óë ÍýäÀë-3
Ì ½æ ½ï½â ½íÊâÕÓä »â×ä, ¾ëÓ ÏëÄâ ÑLÒâ áÜÓÕâÖä-4
ÈÍ Óë ÈäÓÉÑâï Úçï »ïæ ÌÕ 'Ççï, ÖÚëÁë ÖÚëÁë Úçï Èí Öç¼Åâï Óë ÑâÇçï-5
ÁëÓâÑ »Úë sÕâÑä ÖÚëÁë Óë ÑãÛÒâ, ÕâÈÌä ÕâÈë ÕâÔí áÆÛ» ÆãÛÒâ-6`,
    unicodeContent: `આજ સખી આનંદની હેલી, હરિમુખ જોઈને હું થઈ છું રે ઘેલી-૧
મહા રે મુનિના ધ્યાનમાં નાવે, તે રે શામળિયો મુજને બોલાવે-૨
જે સુખને ભવ બ્રહ્મા રે ઇચ્છે, તે રે શામળિયો મુજને રે પ્રીછે-૩
ન ગઈ ગંગા ગોદાવરી કાશી, ઘેર બેઠા મળ્યા અક્ષરવાસી-૪
તપ રે તીરથમાં હું કંઈ નવ જાણું, સહેજે સહેજે હું તો સુખડાં રે માણું-૫
જેરામ કહે સ્વામી સહેજે રે મળિયા, વાતની વાતે વાલો અઢળક ઢળિયા-૬`,
    englishContent: `Aaj sakhi aanand ni heli, harimukh joi ne hu thai chu re gheli-1
Maha re muni na dhyan maa nave, te re shamaliyo mujne bolave-2
Je sukh ne bhav brahma re icche, te re shamaliyo mujne re priche-3
Na gai ganga godavari kashi, gher betha malya aksharvaasi-4
Tap re tirath maa hu kai nav jaanu, saheje saheje hu to sukhda re maanu-5
Jeram kahe swami saheje re maliya, vaat ni vaate vaalo adhalak dhaliya-6`
  },
  {
    sulekhTitle: "ÁÒ Ùä sÕâãÑÌâÓâÒÇ",
    unicodeTitle: "જય શ્રી સ્વામિનારાયણ",
    englishTitle: "Jay Shri Swaminarayan",
    sulekhContent: "ÁÒ Ùä sÕâãÑÌâÓâÒÇ",
    unicodeContent: "જય શ્રી સ્વામિનારાયણ",
    englishContent: "Jay Shri Swaminarayan"
  },
  {
    sulekhTitle: "ÑâÓâ ½äÓËÓ ½íÍâÔ",
    unicodeTitle: "મારા ગિરધર ગોપાલ",
    englishTitle: "Mara Girdhar Gopal",
    sulekhContent: `ÑâÓâ ½äÓËÓ ½íÍâÔ, ÊçÖÓí Ì »íæ
ÑâÓâ ½äÓËÓ ½íÍâÔ, ÊçÖÓí Ì »íæ`,
    unicodeContent: `મારા ગિરધર ગોપાલ, દૂસરો ન કોઈ
મારા ગિરધર ગોપાલ, દૂસરો ન કોઈ`,
    englishContent: `Mara Girdhar Gopal, dusro na koi
Mara Girdhar Gopal, dusro na koi`
  }
];

// Function to load sample data into database
export const loadSampleData = async (kirtanDB) => {
  try {
    const existingKirtans = await kirtanDB.getAllKirtans();
    
    // Only load if database is empty
    if (existingKirtans.length === 0) {
      for (const kirtan of sampleKirtans) {
        await kirtanDB.addKirtan(kirtan);
      }
      console.log('Sample data loaded successfully');
      return sampleKirtans.length;
    }
    return 0;
  } catch (error) {
    console.error('Failed to load sample data:', error);
    return 0;
  }
};