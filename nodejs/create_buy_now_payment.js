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
const { digestBuyNowFromBuyNowId, sign } = require('freeverse-marketsigner-js');
const argv = require('minimist')(process.argv.slice(2), {
  string: [
    'pvk',
    'buyNowId',
  ],
});

const {
  pvk,
  buyNowId,
} = argv;

const checkArgs = () => {
  const OK = (
    pvk && buyNowId
  );
  if (!OK) {
    console.log(`
    ---------------
    Function: creates query to pay for an asset that was put for sale in BuyNow mode
    Usage Example: 
    node create_buy_now_payment.js --pvk '0xd2827f4c3778758eb51719a698464aaffd10a5c7cf816c1de83c5e446bfc8e8d' --buyNowId '0x81d6b8596f19fbf11f9484642cfb18e4763149ed1eabe5d514007e3d16b89399'
    ---------------

    params:
    * pvk: the private key of the buyer
    * buyNowId: the id of the buynow sale that this payment refers to
    `);
  }
  return OK;
};

const run = () => {
  const digest = digestBuyNowFromBuyNowId({ buyNowId });

  // create web3 account from your private key
  // (other forms of creating web3 account could be subsituted)
  const buyerAccount = identity.accountFromPrivateKey(pvk);
  const signature = sign({ digest, web3account: buyerAccount });
  const signatureToSend = signature.substring(2, signature.length);

  // inject results into final mutation to send to graphQL endpoint
  const assetMutation = `
mutation { 
  createBuyNowPayment(
    input: { 
      signature:"${signatureToSend}",
      buyNowId:"${buyNowId}",
      buyerId: "${buyerAccount.address}",
    }
  )
}`;

  console.log(assetMutation);
};

const OK = checkArgs();
if (OK) run();
