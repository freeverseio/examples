/* eslint-disable no-console */

/*
Unlinks a previously linked web3address from an email.
The unlinked web3address can later be assigned to a different email.
NOTE: This mutation needs to include an authorization b2b token in the http header.

INPUTS:
- email: the email to be unlinked
- web3Address: the web3 address to be unlinked
- signature: the signature by the web3 address authorizing the process of unlinking it from an email
*/
const identity = require('freeverse-crypto-js');
const { digestUnlinkAddress, sign } = require('freeverse-marketsigner-js');

const email = 'john@ama.com';

// In this example, a web3 account is created from scratch, so that
// the user can sign. You can use your own web3 wallet in your app.
const randomPvk = '0x56450b9e335eb41b0c90454285001f793e7bac2b2c94c353c392b38a2292e7d0';
const userAccount = identity.accountFromPrivateKey(randomPvk);
const userWeb3Address = userAccount.address;

// Compute the digest to be signed:
const digest = digestUnlinkAddress({
  email,
  web3Address: userWeb3Address,
});
const signature = sign({ digest, web3account: userAccount });
const signatureWithout0x = signature.substring(2, signature.length);

// inject results into final mutation to send to graphQL endpoint
const unlinkWeb3AddressMutation = `
mutation{
    unlinkWeb3Address(input: {
      email: "${email}",
      signature: "${signatureWithout0x}"
      web3Address: "${userWeb3Address}"
    })
  }
`;
console.log(unlinkWeb3AddressMutation);
