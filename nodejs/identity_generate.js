/* eslint-disable no-console */

/*
Generates a brand new identity and encrypts it with a provided user password
Use at your own risk. The generated privKey will be output in console.

INPUTS:
- password: the password that will be used to encrypt
*/

const password = 'P@ssw0rd';

// Generating:
const identity = require('freeverse-crypto-js');

const newId = identity.createNewAccount();
const encrypted = identity.encryptIdentity(newId.privateKey, password);

console.log(
  `
Generated ID:
- privateKey   : ${newId.privateKey}
- web3 address : ${newId.address}
- encryptedId  : ${encrypted}
- userPassword : ${password}
`,
);
