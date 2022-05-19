/* eslint-disable no-console */

const identity = require('freeverse-crypto-js');
const argv = require('minimist')(process.argv.slice(2), { string: ['encrypted', 'password'] });

const { password, encrypted } = argv;
if (!password || !encrypted) {
  console.log(`
    ---------------
    Usage Example: 
    node identity_decrypt.js --password 'P@ssw0rd' --encrypted 'c33dcc598252fbbb4a94ff2d0f70dbe7d77360d8ca4a036ad1dd80bc4c7bb0b818517bdd5fdd0cf0562080e33559bfab637d3ed3ccd6ddfdbd58b8d8874047bf'
    ---------------
    `);
} else {
// this is the user's private key
  const pvk = identity.decryptIdentity(encrypted, password);

  // this is the freeverseID (public address) of the user
  const freeverseID = identity.freeverseIdFromPrivateKey(pvk);

  console.log(`
---------------
Original encrypted ID:
${encrypted}
Password:
${password}
Private Key:
${pvk}
FreeverseID (public address):
${freeverseID}
---------------`);
}
