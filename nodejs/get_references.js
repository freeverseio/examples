/* eslint-disable no-unused-vars */
/* eslint-disable no-console */

/*
* Returns params required to convert from time (in sec) to units of verse.
* Verse is the Layer-2 equivalent of 'block' for a layer-1.
* Each verse, which take place at 15 min intervals, the layer-2 is synced with layer-1.
* To do the conversion, we need to first query 3 params:
* - referenceVerse, referenceTime, verseInterval
* These do not change, so you can query just once per session.
*/

const getReferences = () => {
  const getVerseReference = `
query getVerseReference {
  allMultiverses {
    nodes {
      referenceVerse
      referenceTime
      verseInterval
    }
  }
}
`;
  const getSafetyMargin = `
{
  allSupportedCryptocurrencies(condition:{currencyId:4}){
    nodes{
      safetyDeadlineMargin
    }
  }
}
`;
  // we should return the obtained:
  // - referenceVerse, referenceTime, verseInterval, safetyDeadlineMargin
  // For the purpose of these tests, we will mock the answer:
  return {
    verseInterval: 900, // 15 min
    referenceTime: 1631531810, // Monday, 13 September 2021 11:16:50
    referenceVerse: 1,
    safetyDeadlineMargin: 300, // 5 min
  };
};

module.exports = {
  getReferences,
};
