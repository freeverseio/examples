/* eslint-disable no-console */
/* eslint-disable camelcase */

/*
UPDATES AN ASSET
See asset_create for more info

INPUTS:
* pvk: the private key of the owner of the universe
* asset: the id of the asset to be updated
* uni: the universe id
* nonce: the Number used ONly onCE, see the get_user_nonce.js example
* updated_asset_props: the new attributes of the asset
* updated_asset_metadata: the new attr. of the asset that will not be certified by the blockchain
*/

const pvk = '0xd2827f4c3778758eb51719a698464aaffd10a5c7cf816c1de83c5e446bfc8e8d';
const asset = '1858476204501659870681251187806966130514471238263';
const uni = '0';
const nonce = '0';
const updated_asset_props = {
  name: 'Supercool Dragon',
  description: 'Legendary creature that loves ice.',
  image: 'ipfs://QmPCHHeL1i6ZCUnQ1RdvQ5G3qccsjgQF8GkJrWAm54kdtB',
  animation_url: 'ipfs://QmefzYXCtUXudCy9LYjU4biapHJiP26EGYS8hQjpei472j',
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
const updated_asset_metadata = {
  private_data: 'that has been updated',
};

// UPDATING THE ASSET:

const identity = require('freeverse-crypto-js');
const { updateAssetOp, AtomicAssetOps } = require('freeverse-apisigner-js');

// create web3 account from your private key
// (other forms of creating web3 account could be subsituted)
const universe_owner_account = identity.accountFromPrivateKey(pvk);

// instantiate the class to create the required mutation:
const assetOps = new AtomicAssetOps({ universeId: uni });
const op = updateAssetOp({
  nonce,
  assetId: asset,
  props: updated_asset_props,
  metadata: updated_asset_metadata,
});
assetOps.push({ op });
const sig = assetOps.sign({ web3Account: universe_owner_account });
const mutation = assetOps.mutation({ signature: sig });

console.log(`
---------------
Mutation to be sent to GraphQL endpoint:
${mutation}
`);
