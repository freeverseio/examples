/* eslint-disable no-console */
const Accounts = require('web3-eth-accounts');
const Utils = require('web3-utils');
const EthCrypto = require('eth-crypto');

// encrypts a string so that it can only be decrypted
// by the owner of the privKey that corresponds to the publicKey
const encryptWithPublicKey = async (textToEncrypt, publicKey) => {
  // obtaining an object with the encrypted data
  const encryptedObject = await EthCrypto.encryptWithPublicKey(
    publicKey,
    textToEncrypt,
  );
  // converting the encrypted object into a encrypted String
  const encryptedString = EthCrypto.cipher.stringify(encryptedObject);
  return encryptedString;
};

// decrypts a string that was encrypted for a given publicKey
const decryptWithPrivateKey = async (encryptedString, privateKey) => {
  // converting the encypted String into an encrypted object
  const encryptedObject = EthCrypto.cipher.parse(encryptedString);
  // decrypt the encrypted object with the private key
  const decrypted = await EthCrypto.decryptWithPrivateKey(
    privateKey,
    encryptedObject,
  );
  return decrypted;
};

/*
Encrypts a message that can only be decrpypted by the owner of a public key
*/

const run = async () => {
  // Alice wants to send data to Bob, encrypted so that only Bob can decrypt.
  // Bob publishes his publicKey. Alice encrypts using it.

  // First, Bob creates his publicKey.
  // If Bob already had a private/public key pair, he'd skip the first line
  const bobId = new Accounts().create(); // creates a pair
  const bobPrivateKey = bobId.privateKey;
  const bobPublicKey = EthCrypto.publicKeyByPrivateKey(bobPrivateKey);

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

  const encryptedString = await encryptWithPublicKey(
    JSON.stringify(jsonObject),
    bobPublicKey,
  );
  console.log('Alice actually sends this string: ', encryptedString);
  const decryptedString = await decryptWithPrivateKey(encryptedString, bobPrivateKey);
  const decryptedJson = JSON.parse(decryptedString);
  console.log('Bob recovers the original json: ', decryptedJson);
};

run();
