/* eslint-disable no-console */

/*
Links a web3 address to an email (for minimal KYC)
The request needs to be signed by the owner of the web3 address

INPUTS:
- email: the email to be linked
- alias: an arbitrary string to describe the web3address
- web3Address: the web3 address to be linked
- signature: the signature of web3 address authorizing the process of linking it to the email
- universeName: the name of the application that will appear in the email that the user will receive
- language: the language used in the email (e.g "en" for English)
*/

const email = 'gerard@freeverse.io';
const alias = 'My linked account';
const identity = require('freeverse-crypto-js');
const { digestLinkAddress, sign } = require('freeverse-marketsigner-js');

// In this example, a web3 account is created from scratch, so that
// the user can sign. You can use your own web3 wallet in your app.
const randomPvk = '0x773c7e71d860cc222bd66a096bb41180c0308711b2ad9263358f35fb0f1f6c15';
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


// This mutation needs to be authorized with an http header b2b token