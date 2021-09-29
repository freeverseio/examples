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

const identity = require('freeverse-crypto-js');
const { digestPutForSaleBuyNow, sign } = require('freeverse-marketsigner-js');
const argv = require('minimist')(process.argv.slice(2), { string: ['pvk', 'currencyId', 'price', 'rnd', 'validUntil', 'assetId'] });

const {
  pvk,
  currencyId,
  price,
  rnd,
  validUntil,
  assetId,
} = argv;

const checkArgs = () => {
  const OK = (assetId && pvk && currencyId && price && rnd && validUntil);
  console.log(assetId, pvk, currencyId, price, rnd, validUntil);
  if (!OK) {
    console.log(`
    ---------------
    Usage Example: 
    node create_buy_now.js --pvk '0xd2827f4c3778758eb51719a698464aaffd10a5c7cf816c1de83c5e446bfc8e8d' --currencyId 0 --price 345 --rnd 12342234 --validUntil '1632395810' --assetId '36771977682424071759165601888702044610709221343463' 
    ---------------

    params:
    * pvk: the private key of the owner of the asset
    * assetId
    * currencyId: currency 0: EUR
    * price: in units of cents of EUR, so 3.45 EUR
    * rnd: a random number, to be generated in front end for each different query
    * validUntil: when will the buynow end (Thursday, 23 September 2021 11:16:50)
    `);
  }
  return OK;
};

const run = () => {
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
};

const OK = checkArgs();
if (OK) run();
