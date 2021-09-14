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
const assert = require('assert');

// PASTE REQUIRED VARIABLES FOR MUTATION HERE
const universe_owner_pvk = ''; // universe account owner private key
const asset_id = ''; // ID of asset to update
const asset_nonce_value = 0; // see https://docs.livingassets.io/quickstart/developer_quickstart_2/#example-querying-a-user-nonce-value
const universe_id = 0; // your universe id (provided by us)
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

assert(universe_owner_pvk !== '', 'Please enter a private key to run this example!');
assert(asset_id !== '', 'Please enter an asset ID to run this example!');

// create web3 account from your private key
// (other forms of creating web3 account could be subsituted)
const universe_owner_account = identity.createNewAccount(universe_owner_pvk);

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
        }){
          results 
        }}
  `;

console.log(assetMutation);