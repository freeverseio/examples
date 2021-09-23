const Web3 = require('web3');
const { createReadStream } = require('fs');
const FormData = require('form-data');
const fetch = require('cross-fetch');
const Hash = require('ipfs-only-hash');
const signer = require('freeverse-apisigner-js');

const web3 = new Web3();
const argv = require('minimist')(process.argv.slice(2), { string: ['pvk', 'path', 'uni', "api"] });
const {
    pvk, api, uni, path,
  } = argv;

  if (!pvk || !api || !uni || !path) {
      throw new Error("Please check required parameters.")
  }

const universeOwnerAccount = web3.eth.accounts.privateKeyToAccount(pvk);
const endpoint = api;
const universeIdx = uni;
const filePath = path;

const generateImgHash = async ({ file }) => {
  const fileHash = await Hash.of(file);

  return fileHash;
};

const uploadImage = async ({ filePath, universeIdx }) => {
  try {
    const myFileReadStream = createReadStream(filePath);
    const fileHash = await generateImgHash({ file: myFileReadStream })

    const signature = signer.signImageUpload({
      web3account: universeOwnerAccount,
      fileHash,
      universeIdx,
    });

    const form = new FormData();
    const imageSignature = signature.signature.substr(2, signature.signature.length);

    console.log("Image signature: ", imageSignature);
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
    } else {
      return response.text();
    }
  } catch (err) {
    throw err;
  }
}

const run = async () => {
  try {
    const imageUploaded = await uploadImage({ filePath, universeIdx })
    console.log("Image Uploaded: ", imageUploaded)
  } catch (e) {
    console.error(e)
  }
};

run();