/* eslint-disable no-console */
// MIT License

const identity = require('freeverse-crypto-js');
const { digestPutForSaleAuction, sign, getExpiryData } = require('freeverse-marketsigner-js');
const argv = require('minimist')(process.argv.slice(2), { string: ['pvk', 'currencyId', 'price', 'rnd', 'timeValidUntil', 'timeToPay', 'assetId'] });
const { queryReferences } = require('./query_references');

const {
  pvk,
  currencyId,
  price,
  rnd,
  timeValidUntil,
  timeToPay,
  assetId,
} = argv;

const checkArgs = () => {
  const OK = (assetId && pvk && currencyId && price && rnd && timeValidUntil && timeToPay);
  console.log(assetId, pvk, currencyId, price, rnd, timeValidUntil, timeToPay);
  if (!OK) {
    console.log(`
    ---------------
    Usage Example: 
    node create_auction.js --pvk '0xd2827f4c3778758eb51719a698464aaffd10a5c7cf816c1de83c5e446bfc8e8d' --currencyId 0 --price 345 --rnd 12342234 --timeValidUntil '1632395810' --timeToPay '172800' --assetId '36771977682424071759165601888702044610709221343463' 
    ---------------

    params:
    * pvk: the private key of the owner of the asset
    * assetId
    * currencyId: currency 0: EUR
    * price: in units of cents of EUR, so 3.45 EUR
    * rnd: a random number, to be generated in front end for each different query
    * timeValidUntil: when will the auction end (Thursday, 23 September 2021 11:16:50)
    * timeToPay: the amount of seconds avaiable to max bidder to pay (2 days)
    `);
  }
  return OK;
};

const run = () => {
  // Note: before doing anything related to asset trading
  // the user's ID needs to be registered.
  // This registration needs to be done only once
  // for a given user's ID.
  // See the link_id_to_email.js examples

  // First convert all time quantities from secs to verse:
  const references = queryReferences();

  // Convert timeValidUntil from secs to verse:
  const expirationData = getExpiryData({
    time: timeValidUntil,
    referenceVerse: references.referenceVerse,
    referenceTime: references.referenceTime,
    verseInterval: references.verseInterval,
  });
  const validUntil = expirationData.lastValidVerse;

  // Convert timeToPay from secs to verse:
  const versesToPay = Math.ceil(timeToPay / references.verseInterval);

  // The digest can finally be built:
  const digest = digestPutForSaleAuction({
    currencyId, price, rnd, validUntil, versesToPay, assetId,
  });

  // create web3 account from your private key
  // (other forms of creating web3 account could be subsituted)
  const assetOwnerAccount = identity.accountFromPrivateKey(pvk);
  const signature = sign({ digest, web3account: assetOwnerAccount });
  const signatureToSend = signature.substring(2, signature.length);

  // inject results into final mutation to send to graphQL endpoint
  const assetMutation = `
mutation { 
  createAuctionFromPutForSale(
    input: { 
      assetId: "${assetId}", 
      currencyId: ${currencyId}, 
      price: ${price}, 
      rnd: ${rnd}, 
      validUntil: "${validUntil}", 
      versesToPay: "${versesToPay}", 
      signature: "${signatureToSend}",
    }
  )
}`;

  console.log(assetMutation);
};

const OK = checkArgs();
if (OK) run();
