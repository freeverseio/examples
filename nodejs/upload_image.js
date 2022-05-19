/* eslint-disable no-console */

/*
Uploads an image (to be run by the owner of a universe)

INPUTS:
* pvk: the privateKey of the universe owner
* universe: the (uint) index of the universe
* endpoint: the API endpoint
* path: the local path to your image; currently supports jpeg, png, gif, webp, tiff.
*/

const pvk = '0xd2827f4c3778758eb51719a698464aaffd10a5c7cf816c1de83c5e446bfc8e8d';
const universe = '0';
const path = './images/sword.jpg';
const endpoint = 'https://api.blackhole.gorengine.com';

// Prepare the query

const identity = require('freeverse-crypto-js');
const { createReadStream } = require('fs');
const FormData = require('form-data');
const fetch = require('cross-fetch');
const Hash = require('ipfs-only-hash');
const signer = require('freeverse-apisigner-js');

const generateImgHash = async ({ file }) => {
  const fileHash = await Hash.of(file);
  return fileHash;
};

const uploadImage = async ({ filePath, universeIdx, signature }) => {
  const imageSignature = signature.signature.substr(2, signature.signature.length);

  const form = new FormData();
  form.append('universeIdx', universeIdx);
  form.append('signature', imageSignature);
  form.append('upload', createReadStream(filePath));

  const response = await fetch(`${endpoint}/images/upload`, {
    method: 'POST',
    body: form,
  });
  const contentType = response.headers.get('Content-Type');
  if (contentType && contentType.startsWith('application/json')) {
    return response.json();
  }
  return response.text();
};

const run = async () => {
  // Compute the image IPFS hash, so that it can be uploaded any time (now or future):
  const myFileReadStream = createReadStream(path);
  const fileHash = await generateImgHash({ file: myFileReadStream });

  // The query requires the signature of the universe owner:
  const universeOwnerAccount = identity.accountFromPrivateKey(pvk);
  const signature = signer.signImageUpload({
    web3Account: universeOwnerAccount,
    fileHash,
    universeIdx: universe,
  });

  // Execute the upload query:
  try {
    const response = await uploadImage({ filePath: path, universeIdx: universe, signature });
    console.log('Image Uploaded. Query response: ', response);
  } catch (e) {
    console.error(e);
  }
};

run();
