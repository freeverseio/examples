/* eslint-disable no-console */
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
const { digestPutForSaleAuction } = require('freeverse-marketsigner-js');
const argv = require('minimist')(process.argv.slice(2), { string: ['owner_pvk'] });

const {
  owner_pvk,
} = argv;

if (!owner_pvk) {
  console.log(`
    ---------------
    Usage Example: 
    node putForSale_auction.js --owner_pvk '0xd2827f4c3778758eb51719a698464aaffd10a5c7cf816c1de83c5e446bfc8e8d'
    ---------------
    `);
} else {
  const assetId = '11114324213423';
  const currencyId = 0; // curreny 0: EUR
  const price = 345; // in units of cents of EUR, so 3.45 EUR
  const rnd = 12342234; // a random number, to be generated in front end for each different query
  const validUntil = 1632395810; // when will the auction end (Thursday, 23 September 2021 11:16:50)
  const timeToPay = 172800; // the amount of seconds avaiable to max bidder to pay (2 days)

  const digest = digestPutForSaleAuction({
    currencyId, price, rnd, validUntil, timeToPay, assetId,
  });

  // create web3 account from your private key
  // (other forms of creating web3 account could be subsituted)
  const asset_owner_account = identity.accountFromPrivateKey(owner_pvk);
  const { signature } = asset_owner_account.sign(digest);

  // inject results into final mutation to send to graphQL endpoint
  const assetMutation = `
mutation { 
    putForSale(
      input: { 
        assetId: ["${assetId}"], 
        currencyId: ["${currencyId}"], 
        price: ["${price}"], 
        rnd: ["${rnd}"], 
        validUntil: ["${validUntil}"], 
        timeToPay: ["${timeToPay}"], 
        signature: "${signature}",
      }
    )
  {
    results 
  }
}
    `;

  console.log(assetMutation);
}
