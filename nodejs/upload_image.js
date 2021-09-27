/* eslint-disable no-console */
const identity = require('freeverse-crypto-js');
const { createReadStream } = require('fs');
const FormData = require('form-data');
const fetch = require('cross-fetch');
const Hash = require('ipfs-only-hash');
const signer = require('freeverse-apisigner-js');

const argv = require('minimist')(process.argv.slice(2), { string: ['pvk', 'path', 'universe', 'endpoint'] });

const {
  pvk, endpoint, universe, path,
} = argv;

const checkArgs = () => {
  const OK = pvk && universe && endpoint && path;
  if (!OK) {
    console.log(`
    ---------------
    Usage Example: 
    node upload_image.js --pvk '0xd2827f4c3778758eb51719a698464aaffd10a5c7cf816c1de83c5e446bfc8e8d' --universe '0' --path 'imgs/image.png' --endpoint 'https://api.blackhole.gorengine.com'

    params:
    * pvk: the privateKey of the universe owner
    * universe: the (uint) index of the universe
    * endpoint: the API endpoint
    * path: the local path to your image
    ---------------
    `);
  }
  return OK;
};

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
    web3account: universeOwnerAccount,
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

const OK = checkArgs();
if (OK) run();
