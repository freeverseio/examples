/* eslint-disable no-console */
const identity = require('freeverse-crypto-js');
const Utils = require('web3-utils');

// Alice wants to send data to Bob, encrypted so that only Bob can decrypt.
// Bob publishes his publicKey. Alice encrypts using it.

// First, Bob creates his publicKey. 
// If Bob already had a private/public key pair, he'd skip the first line
const bobId = identity.createNewAccount(); // creates a pair
const bobPrivateKey = bobId.privateKey;
const bobPublicKey = identity.publicKeyFromPrivateKey(bobPrivateKey);

// Bob communicates his public key to Alice. The public key can be published without fear.
console.log('Bob Private key (never show to anyone)', bobPrivateKey);
console.log('Bob Public key (can be made public)', bobPublicKey);

// Alice wants to send a json object containing sensitive data to Bob.
// The message contains a 'userId' (which is an eth address)
const userId = '0x72030BA2b04e9665Fd0BAFb5F3DC097774dc5925';
// as well as the user's email, which Alice sends hashed with salt.
const salt = 'livingassets';
const email = 'user@server.com';
const hashedEmail = Utils.keccak256(salt + email);
// This is json object that Alice wants to send:
const jsonObject = { email: hashedEmail, id: userId };
console.log('Object that Alice wants to send to Bob: ', jsonObject);

(async () => {
  const encryptedString = await identity.encryptWithPublicKey(
    JSON.stringify(jsonObject),
    bobPublicKey,
  );
  console.log('Alice actually sends this string: ', encryptedString);
  const decryptedString = await identity.decryptWithPrivateKey(encryptedString, bobPrivateKey);
  const decryptedJson = JSON.parse(decryptedString);
  console.log('Bob recovers the original json: ', decryptedJson);
}
)();
