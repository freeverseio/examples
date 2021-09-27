/* eslint-disable no-console */
const identity = require('freeverse-crypto-js');
const fetch = require('cross-fetch');
const signer = require('freeverse-apisigner-js');

const argv = require('minimist')(process.argv.slice(2), { string: ['pvk', 'universe', 'endpoint'] });

const {
  pvk, endpoint, universe,
} = argv;

const checkArgs = () => {
  const OK = pvk && universe && endpoint;
  if (!OK) {
    console.log(`
    ---------------
    Usage Example: 
    node list_images.js --pvk '0xd2827f4c3778758eb51719a698464aaffd10a5c7cf816c1de83c5e446bfc8e8d' --universe '0' --endpoint 'https://api.blackhole.gorengine.com'

    params:
    * pvk: the privateKey of the universe owner
    * universe: the (uint) index of the universe
    * endpoint: the API endpoint
    ---------------
    `);
  }
  return OK;
};

const listImages = async ({ universeIdx, signature }) => {
  try {
    const body = {
      universeIdx: +universeIdx,
      signature: signature.signature.substr(2, signature.signature.length),
    };
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
  const universeOwnerAccount = identity.accountFromPrivateKey(pvk);
  const signature = signer.signListImages({
    web3account: universeOwnerAccount,
    universeIdx: universe,
  });
  try {
    const imgList = await listImages({ universeIdx: universe, signature });
    console.log('Current Uploaded Images: ', imgList);
  } catch (e) {
    console.error(e);
  }
};

const OK = checkArgs();
if (OK) run();
