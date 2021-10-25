/* eslint-disable no-console */
// MIT License

// Copyright (c) 2021 freeverse.io

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

const queryReferences = () => {
  // Returns params rquired to convert from time (in sec) to units of verse.
  // Verse is the Layer-2 equivalent of 'block' for a layer-1.
  // Each verse, which take place at 15 min intervals, the layer-2 is synced with layer-1.
  // To do the conversion, we need to first query 3 params:
  // - referenceVerse, referenceTime, verseInterval
  // These do not change, so you can query just once per session.
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
  console.log(getVerseReference);
  // Imagine we get:
  return {
    verseInterval: 900, // 15 min
    referenceTime: 1631531810, // Monday, 13 September 2021 11:16:50
    referenceVerse: 1,
  };
};

module.exports = {
  queryReferences,
};
