/* eslint-disable no-console */
/* eslint-disable camelcase */
// MIT License

// Copyright (c) 2021 freeverse.io

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

const identity = require('freeverse-crypto-js');
const signer = require('freeverse-apisigner-js');
const argv = require('minimist')(process.argv.slice(2), { string: ['pvk', 'asset', 'uni', 'nonce'] });

const {
  pvk, asset, uni, nonce,
} = argv;

if (!pvk || !asset || !uni || !nonce) {
  console.log(`
    ---------------
    Usage Example: 
    node asset_update.js --pvk '0xd2827f4c3778758eb51719a698464aaffd10a5c7cf816c1de83c5e446bfc8e8d' --asset '1858476204501659870681251187806966130514471238263' --uni '0' --nonce '0'
    ---------------
    `);
} else {
  // IMPORTANT NOTE ON IMAGES:
  // If you modify the image, then it needs to be uploaded (see upload_image.js example)
  // In doing so, the query returns the IPFS CID.
  // That CID needs to be used here in the image field, with format:
  //    image: 'ipfs://CID'
  //
  // Additionally, you can upload to IPFS by your own means too
  // (anyone can, after all, including the asset owner, at any point in time)

  const universe_owner_pvk = pvk; // universe account owner private key
  const asset_id = asset; // ID of asset to update
  const asset_nonce_value = nonce; // see https://docs.livingassets.io/quickstart/developer_quickstart_2/#example-querying-a-user-nonce-value
  const universe_id = uni; // your universe id (provided by us)
  const updated_asset_props = { // properties for asset following standard https://docs.livingassets.io/api/props_standard/
    name: 'Supercool Dragon',
    description: 'Legendary creature that loves ice.',
    image: 'ipfs://QmPAg1mjxcEQPPtqsLoEcauVedaeMH81WXDPvPx3VC5zUz',
    attributes: [
      {
        trait_type: 'Rarity',
        value: 'Common',
      },
      {
        trait_type: 'Level',
        value: 10,
      },
      {
        trait_type: 'Weight',
        value: 223.5,
      },
    ],
  };
  const updated_asset_metadata = { // any metadata you want
    private_data: 'that has been updated',
  };

  // create web3 account from your private key
  // (other forms of creating web3 account could be subsituted)
  const universe_owner_account = identity.accountFromPrivateKey(universe_owner_pvk);

  // call function to create the operation and sign it with your account
  const result = signer.updateAssetMutationInputs({
    universeOwnerAccount: universe_owner_account,
    assetId: asset_id,
    assetNonce: asset_nonce_value,
    universeIdx: universe_id,
    propsJSON: updated_asset_props,
    metadataJSON: updated_asset_metadata,
  });

  // inject results into final mutation to send to graphQL endpoint
  const assetMutation = `
  mutation { 
      execute(
        input: { 
          ops: ["${result.ops}"], 
          signature: "${result.signature}",
          universe: 0,
        }
      )
    {
      results 
    }
  }
  `;

  console.log(`
---------------
Private key of universe owner:
${universe_owner_pvk}
ID of asset to edit:
${asset_id}:
Universe:
${universe_id}
Asset nonce value:
${asset_nonce_value}
GraphQL mutation:
${assetMutation}
    `);
}
