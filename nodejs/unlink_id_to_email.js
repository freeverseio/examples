/* eslint-disable no-console */

/*
Unlinks a previously linked web3address from an email

INPUTS:
- email: the email to be unlinked
- web3Address: the web3 address to be unlinked
- signature: the signature of web3 address authorizing the process of linking it to the email
*/
const identity = require('freeverse-crypto-js');
const { digestUnlinkAddress, sign } = require('freeverse-marketsigner-js');

// In this example, a web3 account is created from scratch, so that
// the user can sign. You can use your own web3 wallet in your app.
const pvk = '0x773c7e71d860cc222bd66a096bb41180c0308711b2ad9';
const email = 'john@ama.com';

const userAccount = identity.accountFromPrivateKey(pvk);
const userWeb3Address = userAccount.address;
// The preveious two lines can be replaced by the following one
// const userWeb3Address = '0xBAa581b041Daa131f404295803eD05182a9c8F1f';

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
`
console.log(unlinkWeb3AddressMutation);

// This mutation needs to be authorized with an http header b2b token
