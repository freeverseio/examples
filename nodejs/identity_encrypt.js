/* eslint-disable no-console */

/*
Encrypts a private key with a user password
Uses an AES-Standard KDF (Key Derivation Function) to generate (IV, key) from (password, salt)

INPUTS:
- password: the password that was used to encrypt
- pk: the private key
*/

const password = 'P@ssw0rd';
const pk = '0x56450b9e335eb41b0c90454285001f793e7bac2b2c94c353c392b38a2292e7d0';

// Encrypting:
const identity = require('freeverse-crypto-js');

const encrypted = identity.encryptIdentity(pk, password);

console.log(`
---------------
Original private key: ${pk}
Password: ${password}
Encrypted ID:
${encrypted}
---------------`);
