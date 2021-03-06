/* eslint-disable no-console */
/* eslint-disable camelcase */

/*
CREATES AN ASSET
Properties for asset shall follow the standard
https://docs.livingassets.io/api/props_standard/

INPUTS:
* pvk: the private key of the owner of the universe
* owner: the id of the owner to whom the asset will be assigned
* uni: the universe id
* nonce: the Number used ONly onCE of the owner to whom the asset will be assigned,
*        (see the get_user_nonce.js example)
* asset_props: the attributes of the asset
* asset_metadata: attributes of the asset that will not be certified by the blockchain
*/

const pvk = '0xd2827f4c3778758eb51719a698464aaffd10a5c7cf816c1de83c5e446bfc8e8d';
const owner = '0x983c1A8FCf74CAF648fD51fd7A6d322a502ae789';
const uni = '0';
const nonce = '0';
const asset_props = {
  name: 'Supercool Dragon',
  description: 'Legendary creature that loves fire.',
  image: 'ipfs://QmPCHHeL1i6ZCUnQ1RdvQ5G3qccsjgQF8GkJrWAm54kdtB',
  animation_url: 'ipfs://QmefzYXCtUXudCy9LYjU4biapHJiP26EGYS8hQjpei472j',
  attributes: [
    {
      trait_type: 'Rarity',
      value: 'Scarce',
    },
    {
      trait_type: 'Level',
      value: 5,
    },
    {
      trait_type: 'Weight',
      value: 123.5,
    },
  ],
};
const asset_metadata = {
  private_data: 'that only I will see',
};

// CREATING THE ASSET:

const identity = require('freeverse-crypto-js');
const { createAssetOp, AtomicAssetOps } = require('freeverse-apisigner-js');

// create web3 account from your private key
// (other forms of creating web3 account could be substituted)
const universe_owner_account = identity.accountFromPrivateKey(pvk);

// instantiate the class to create the required mutation:
const assetOps = new AtomicAssetOps({ universeId: uni });
const op = createAssetOp({
  nonce,
  ownerId: owner,
  props: asset_props,
  metadata: asset_metadata,
});
assetOps.push({ op });
const sig = assetOps.sign({ web3Account: universe_owner_account });
const mutation = assetOps.mutation({ signature: sig });

console.log(`
---------------
Mutation to be sent to GraphQL endpoint:
${mutation}
`);

// FURTHER NOTES
// The image needs to be uploaded first (see upload_image.js example)
// In doing so, the query returns the IPFS CID.
// That CID needs to be used here in the image field, with format:
//    image: 'ipfs://CID'
// Additionally, you can upload to IPFS by your own means too
// (anyone can, after all, including the asset owner, at any point in time)
