/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
// MIT License

const program = require('commander');
const fetch = require('isomorphic-fetch');

// Returns the asset_nonce, to be used for set_asset_props queries.
// Usage:
// node get_asset_nonce.js -a 188719626670054514197768276717903519481837244405720993530482594756955 -e 'https://api.blackhole.gorengine.com'
program
  .requiredOption('-a, --assetId <hex>')
  .requiredOption('-e, --endpoint <url>')
  .parse(process.argv);

const opts = program.opts();
Object.keys(opts).forEach((key) => console.log(`${key}: ${opts[key]}`));

const {
  assetId, endpoint,
} = program.opts();

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

(async () => {
  const nonce = await getAssetNonce(assetId);
  console.log('obtained noce: ', nonce);
}
)();
