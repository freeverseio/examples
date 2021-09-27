/* eslint-disable no-console */
/* eslint-disable max-len */
/* eslint-disable camelcase */
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

const identity = require('freeverse-crypto-js');
const { digestOffer } = require('freeverse-marketsigner-js');
const argv = require('minimist')(process.argv.slice(2), { string: ['owner_pvk', 'currency_id', 'offer_price', 'seller_rnd', 'asset_id', 'offer_valid_until', 'time_to_pay', 'auction_valid_until'] });

const {
  owner_pvk,
  currency_id,
  offer_price,
  seller_rnd,
  asset_id,
  offer_valid_until,
  auction_valid_until,
  time_to_pay,
} = argv;

if (!owner_pvk) {
  console.log(`
    ---------------
    Usage Example: 
    npm run accept-offer -- --owner_pvk '0xd2827f4c3778758eb51719a698464aaffd10a5c7cf816c1de83c5e446bfc8e8d' --currency_id 1 --offer_price 345 --seller_rnd 12343322 --asset_id '36771977682424071759165601888702044610709221343463' --offer_valid_until 1632395810 --time_to_pay 172800 --auction_valid_until 1632395810
    ---------------
    `);
} else {
  const currencyId = currency_id; // curreny 0: EUR
  const price = offer_price; // in units of cents of EUR, so 3.45 EUR
  const sellerRnd = seller_rnd; // a random number, to be generated in front end for each different query
  const assetId = asset_id;
  const validUntil = auction_valid_until; // when will the auction generated from accepting the offer will end (Monday, 27 September 2021 11:21:46)
  const offerValidUntil = offer_valid_until; // when will the offer end (Thursday, 23 September 2021 11:16:50)
  const timeToPay = time_to_pay; // the amount of seconds avaiable to max bidder to pay (2 days)

  const digest = digestOffer(currencyId, price, sellerRnd, assetId, validUntil, timeToPay);

  // create web3 account from your private key
  // (other forms of creating web3 account could be subsituted)
  const assetOwnerAccount = identity.accountFromPrivateKey(owner_pvk);
  const { signature } = assetOwnerAccount.sign(digest);

  // inject results into final mutation to send to graphQL endpoint
  const assetMutation = `
mutation { 
  acceptOffer(
    input: { 
      signature:"${signature}",
        assetId: "${assetId}",
        currencyId: ${currencyId},
        price: ${price},
        validUntil: "${validUntil}",
        offerValidUntil: "${offerValidUntil}",
        timeToPay: "${timeToPay}",
        rnd: ${sellerRnd},
        buyerId: "${assetOwnerAccount.address}"
    }
  )
}`;

  console.log(assetMutation);
}