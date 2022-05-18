const EthCrypto = require('eth-crypto');

// encrypt function
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

// decrypt function
const decryptWithPrivateKey = async (encryptedString, privateKey) => {
  // converting the encypted String into an encrypted object
  const encryptedObject = EthCrypto.cipher.parse(encryptedString);
  // decrypt the en encrypted object with the private key
  const decrypted = await EthCrypto.decryptWithPrivateKey(
    privateKey,
    encryptedObject,
  );
  return decrypted;
};

// creating  a new ethereum-identity with privateKey, publicKey
const identity = EthCrypto.createIdentity();
// displaying private key
console.log('Private key', identity.privateKey);
// displaying public key
console.log('Public key', identity.publicKey);

// First encrypt/decrypt example with an Hello World String
(async () => {
  const encryptedString = await encryptWithPublicKey('Hello World', identity.publicKey);
  console.log(encryptedString);
  const decryptedString = await decryptWithPrivateKey(encryptedString, identity.privateKey);
  console.log(decryptedString);
}
)();

// First encrypt/decrypt example with an Hello World String
(async () => {
  const dataObject = { email: 'test@freeverse.io', id: '0x4EB5DDc866e57029e5aDa56130083cfF1e388a33' };
  const encryptedString = await encryptWithPublicKey(
    JSON.stringify(dataObject),
    identity.publicKey,
  );

  const decryptedString = await decryptWithPrivateKey(encryptedString, identity.privateKey);
  // parsing string into a data object
  const decryptedObject = JSON.parse(decryptedString);
  // obtaining the id
  console.log(decryptedObject.id);
}
)();
