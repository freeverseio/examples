/* eslint-disable no-console */
// MIT License

const identity = require('freeverse-crypto-js');
const argv = require('minimist')(process.argv.slice(2), { string: ['pk', 'password'] });

const { password, pk } = argv;
if (!password || !pk) {
  console.log(`
    ---------------
    Usage Example: 
    node identity_encrypt.js --password 'P@ssw0rd' --pk '0x56450b9e335eb41b0c90454285001f793e7bac2b2c94c353c392b38a2292e7d0'
    ---------------
    `);
} else {
  const encrypted = identity.encryptIdentity(pk, password);
  console.log(`
---------------
Original private key:
${pk}
Password:
${password}
Encrypted ID:
${encrypted}
---------------`);
}
