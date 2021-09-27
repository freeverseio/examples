const Web3 = require('web3');
const fetch = require('cross-fetch');
const signer = require('freeverse-apisigner-js');

const web3 = new Web3();
const argv = require('minimist')(process.argv.slice(2), { string: ['pvk', 'uni', 'api'] });

const {
  pvk, api, uni,
} = argv;

if (!pvk || !api || !uni) {
  throw new Error('Please check required parameters.');
}
const universeOwnerAccount = web3.eth.accounts.privateKeyToAccount(pvk);
const endpoint = api;
const universeIdx = uni;

const listImages = async ({ universeIdx }) => {
  try {
    const signature = signer.signListImages({ web3account: universeOwnerAccount, universeIdx });
    const body = {
      universeIdx: +universeIdx,
      signature: signature.signature.substr(2, signature.signature.length),
    };
    console.log('🚀 ~ file: list_images.js ~ line 22 ~ listImages ~ body', body);

    const response = await fetch(`${endpoint}/images/list`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.startsWith('application/json')) {
      return response.json();
    }
    return response.text();
  } catch (e) {
    throw new Error(e.message);
  }
};

const run = async () => {
  try {
    const currentUploadedImages = await listImages({ universeIdx });
    console.log('Current Uploaded Images: ', currentUploadedImages);
  } catch (e) {
    console.error(e);
  }
};

run();
