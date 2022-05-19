/* eslint-disable no-console */

/*
Returns the list of images in a given universe

INPUTS:
* pvk: the privateKey of the universe owner
* universe: the (uint) index of the universe
* endpoint: the API endpoint
*/

const pvk = '0xd2827f4c3778758eb51719a698464aaffd10a5c7cf816c1de83c5e446bfc8e8d';
const universe = 0;
const endpoint = 'https://api.blackhole.gorengine.com';

// Preparing the query

const identity = require('freeverse-crypto-js');
const fetch = require('cross-fetch');
const signer = require('freeverse-apisigner-js');

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
  // Prepare the web3 account of the universe owner for signing
  // (any other web3 compatible approach would work)
  const universeOwnerAccount = identity.accountFromPrivateKey(pvk);
  const signature = signer.signListImages({
    web3Account: universeOwnerAccount,
    universeIdx: universe,
  });
  try {
    const imgList = await listImages({ universeIdx: universe, signature });
    console.log('Current Uploaded Images: ', imgList);
  } catch (e) {
    console.error(e);
  }
};

run();
