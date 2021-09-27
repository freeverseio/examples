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
const { digestBid } = require('freeverse-marketsigner-js');
const argv = require('minimist')(process.argv.slice(2), { string: ['owner_pvk', 'auction_id', 'currency_id', 'auction_price', 'auction_rnd', 'valid_until', 'time_to_pay', 'asset_id', 'buyer_rnd', 'extra_price'] });

const {
  owner_pvk,
  auction_id,
  currency_id,
  auction_price,
  auction_rnd,
  valid_until,
  time_to_pay,
  asset_id,
  buyer_rnd,
  extra_price,
} = argv;

if (!owner_pvk) {
  console.log(`
    ---------------
    Usage Example: 
    npm run create-bid -- --owner_pvk '0xd2827f4c3778758eb51719a698464aaffd10a5c7cf816c1de83c5e446bfc8e8d' --auction_id 'ccf41591d96605dca8c5ba90418f708fed6ff85de7ab2c5d372ea4a617892727' --currency_id 0 --auction_price 345 --auction_rnd 12342234 --valid_until '1632395810' --time_to_pay '172800' --asset_id '36771977682424071759165601888702044610709221343463' --buyer_rnd 234124 --extra_price 100 
    ---------------
    `);
} else {
  const buyerAccount = identity.accountFromPrivateKey(owner_pvk);

  // Auction data
  const auctionId = auction_id;
  const price = auction_price;
  const sellerRnd = auction_rnd;
  const validUntil = valid_until;
  const timeToPay = time_to_pay;
  const currencyId = currency_id;
  const assetId = asset_id;

  // Bid data
  const extraPrice = extra_price; // in units of cents of EUR, so 3.45 EUR
  const buyerRnd = buyer_rnd; // a random number, to be generated in front end for each different query

  const digest = digestBid({
    currencyId, price, extraPrice, sellerRnd, buyerRnd, validUntil, offerValidUntil: 0, timeToPay, assetId,
  });

  // create web3 account from your private key
  // (other forms of creating web3 account could be subsituted)
  const { signature } = buyerAccount.sign(digest);

  // inject results into final mutation to send to graphQL endpoint
  const assetMutation = `
mutation { 
  createBid(
    input: { 
      signature:"${signature}",
      auctionId: "${auctionId}",
      extraPrice: ${extraPrice},
      buyerId: "${buyerAccount.address}",
      rnd: ${buyerRnd}
    }
  )
}`;

  console.log(assetMutation);
}
