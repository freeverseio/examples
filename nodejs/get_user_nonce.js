/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */

/*
Returns the user_nonce, to be used for create_asset queries.

INPUTS:
- address: the web3 address of the user
- universe: the id of the universe where create_asset will be executed
- endpoint: the api endpoint
*/

const address = '0xF0429b534E1db4c5D0F700517B676f5EB7345AB2';
const universe = 2;
const endpoint = '<endpoint_provided_by_freeverse>';

const fetch = require('isomorphic-fetch');

async function getUserNonce(web3Address, universeId) {
  const getNonceQuery = `
        query($web3Address: String!, $universe: Int!) {
            usersUniverseByUserIdAndUniverseId(universeId: $universe, userId: $web3Address){
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
        web3Address,
        universe: +universeId,
      },
    }),
  });
  const result = await response.json();
  const data = result.data.usersUniverseByUserIdAndUniverseId;
  return data === null ? 0 : data.nonce;
}

const run = async () => {
  const nonce = await getUserNonce(address, universe);
  console.log('obtained nonce: ', nonce);
};

run();
