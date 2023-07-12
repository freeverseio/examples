/* eslint-disable no-console */

/*
Decrypts a private key that has been encrypted with a user password
Uses an AES-Standard KDF (Key Derivation Function) to generate (IV, key) from (password, salt)

INPUTS:
- password: the password that was used to encrypt
- encrypted: the encrypted private key
*/

const password = 'P@ssw0rd';
const encrypted = 'c33dcc598252fbbb4a94ff2d0f70dbe7d77360d8ca4a036ad1dd80bc4c7bb0b818517bdd5fdd0cf0562080e33559bfab637d3ed3ccd6ddfdbd58b8d8874047bf';

// Decrypting:
const identity = require('freeverse-crypto-js');

const pvk = identity.decryptIdentity(encrypted, password);
const web3Address = identity.web3AddressFromPrivateKey(pvk);

console.log(`
---------------
Original encrypted ID:
${encrypted}
Password: ${password}
Private Key: ${pvk}
Web3 address: ${web3Address}
---------------`);
