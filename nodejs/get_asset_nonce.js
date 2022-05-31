/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */

/*
Returns the asset_nonce, to be used for set_asset_props queries.

INPUTS:
- assetId: the id of asset
- endpoint: the api endpoint
*/

const assetId = '26959946667150639795636137824065133404064571175676525320894378525171';
const endpoint = 'https://api.blackhole.gorengine.com';

const fetch = require('isomorphic-fetch');

async function getAssetNonce(id) {
  const getNonceQuery = `
        query($id: String!) {
          assetById(id: $id){
              nonce
            }
          }
        `;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: getNonceQuery,
      variables: {
        id,
      },
    }),
  });
  const result = await response.json();
  const data = result.data.assetById;
  return data === null ? 0 : data.nonce;
}

const run = async () => {
  const nonce = await getAssetNonce(assetId);
  console.log('obtained nonce: ', nonce);
};

run();
