/* eslint-disable no-console */

/*
Links a web3 address to an email (for minimal KYC)
The request needs to be signed by the owner of the web3 address

INPUTS:
- email: the email to be linked
- alias: an arbitrary string to describe the web3address
*/

const email = 'john@ama.com';
const alias = 'my first account';
const identity = require('freeverse-crypto-js');
const { digestLinkAddress, sign } = require('freeverse-marketsigner-js');

// In this example, a web3 account is created from scratch, so that
// the user can sign. You can use your own web3 wallet in your app.
const randomPvk = '0x56450b9e335eb41b0c90454285001f793e7bac2b2c94c353c392b38a2292e7d0';
const userAccount = identity.accountFromPrivateKey(randomPvk);
const userWeb3Address = userAccount.address;

// Compute the digest to be signed:
const digest = digestLinkAddress({
  email,
  web3Address: userWeb3Address,
});
const signature = sign({ digest, web3account: userAccount });
const signatureWithout0x = signature.substring(2, signature.length);

// inject results into final mutation to send to graphQL endpoint
const linkMutation = `
mutation {
  linkWeb3AddressToEmail(
    input: {
      email: "${email}",
      alias: "${alias}",
      web3Address: "${userWeb3Address}",
      signature: "${signatureWithout0x}",
      universeName: "My Amazing App",
      language: "en",
    }
  )
}`;

console.log(linkMutation);
