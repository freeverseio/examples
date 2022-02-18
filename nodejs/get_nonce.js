/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */

const program = require('commander');
const fetch = require('isomorphic-fetch');

// Returns the nonce to be used in user nonce, to be used for create_asset queries.
// Usage:
// node get_nonce.js -a 0xF0429b534E1db4c5D0F700517B676f5EB7345AB2 -u 2 -e 'https://api.blackhole.gorengine.com'
program
  .requiredOption('-a, --address <hex>')
  .requiredOption('-u, --universe <int>')
  .requiredOption('-e, --endpoint <url>')
  .parse(process.argv);

const opts = program.opts();
Object.keys(opts).forEach((key) => console.log(`${key}: ${opts[key]}`));

const {
  address, universe, endpoint,
} = program.opts();

async function getUserNonce(freeverseId, universeId) {
  const getNonceQuery = `
        query($freeverseId: String!, $universe: Int!) {
            usersUniverseByUserIdAndUniverseId(universeId: $universe, userId: $freeverseId){
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
        freeverseId,
        universe: +universeId,
      },
    }),
  });
  const result = await response.json();
  const data = result.data.usersUniverseByUserIdAndUniverseId;
  return data === null ? 0 : data.nonce;
}

(async () => {
  const nonce = await getUserNonce(address, universe);
  console.log('obtained noce: ', nonce);
}
)();
