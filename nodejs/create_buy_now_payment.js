/* eslint-disable no-console */

/*
CREATES THE QUERY TO PAY FOR AN ASSET THAT WAS PUT FOR SALE IN BUYNOW MODEs
Note: before trading, the user's web3 address needs to be registered.
  This registration needs to be done only once. See the link_id_to_email.js

INPUTS:
* pvk: the private key of the buyer
* buyNowId: the id of the buynow sale that this payment refers to
*/

const pvk = 'd2827f4c3778758eb51719a698464aaffd10a5c7cf816c1de83c5e446bfc8e8d';
const buyNowId = '0x81d6b8596f19fbf11f9484642cfb18e4763149ed1eabe5d514007e3d16b89399';

// Creating the query:

const identity = require('freeverse-crypto-js');
const { digestBuyNowFromBuyNowId, sign } = require('freeverse-marketsigner-js');

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
