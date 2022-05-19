/* eslint-disable no-console */

/*
Puts an asset for sale in BuyNow mode (as opposite to auction)

INPUTS:
* pvk: the private key of the owner of the asset
* assetId
* currencyId: e.g. currencyId = 1 for XDAI
* price: always an integer, in units the lowest possible unit of that cryptocurrency
* rnd: a random number, to be generated in front end for each different query
* timeValidUntil: when will the buynow end (Thursday, 23 September 2021 11:16:50)
*/

const pvk = '0xd2827f4c3778758eb51719a698464aaffd10a5c7cf816c1de83c5e446bfc8e8d';
const currencyId = 0;
const price = 345;
const rnd = 12342234;
const timeValidUntil = '1632395810';
const assetId = '36771977682424071759165601888702044610709221343463';

// Preparing the query

const identity = require('freeverse-crypto-js');
const { digestPutForSaleBuyNow, sign, getExpiryData } = require('freeverse-marketsigner-js');
const { getReferences } = require('./get_references');

// First convert all time quantities from secs to verse:
const references = getReferences();

// Convert timeValidUntil from secs to verse:
const expirationData = getExpiryData({
  time: timeValidUntil,
  referenceVerse: references.referenceVerse,
  referenceTime: references.referenceTime,
  verseInterval: references.verseInterval,
  safetyMargin: references.safetyDeadlineMargin,
});

// The user should be explained that the BuyNow expires at:
console.log('The BuyNow expires at time: ', expirationData.expirationTime);

// And use the verse as parameter to sign:
const validUntil = expirationData.lastValidVerse;

// The digest can finally be built:
const digest = digestPutForSaleBuyNow({
  currencyId, price, rnd, validUntil, assetId,
});

// create web3 account from your private key
// (other forms of creating web3 account could be subsituted)
const assetOwnerAccount = identity.accountFromPrivateKey(pvk);
const signature = sign({ digest, web3account: assetOwnerAccount });
const signatureToSend = signature.substring(2, signature.length);

// inject results into final mutation to send to graphQL endpoint
const assetMutation = `
mutation { 
  createBuyNowFromPutForSale(
    input: { 
      assetId: "${assetId}", 
      currencyId: ${currencyId}, 
      price: ${price}, 
      rnd: ${rnd}, 
      validUntil: "${validUntil}", 
      signature: "${signatureToSend}",
    }
  )
}`;

console.log(assetMutation);
