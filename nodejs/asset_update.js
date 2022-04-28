/* eslint-disable no-console */
/* eslint-disable camelcase */
// MIT License

const identity = require('freeverse-crypto-js');
const { updateAssetOp, AtomicAssetOps } = require('freeverse-apisigner-js');
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
    params:
    * pvk: the private key of the owner of the universe
    * asset: the id of the asset to be updated
    * uni: the universe id
    * nonce: the Number used ONly onCE, see the get_asset_nonce example
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
  // Properties for asset following standard https://docs.livingassets.io/api/props_standard/
  const updated_asset_props = { // properties for asset following standard https://docs.livingassets.io/api/props_standard/
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
  const updated_asset_metadata = { // any metadata you want
    private_data: 'that has been updated',
  };

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
Private key of universe owner: ${pvk}
ID of asset to edit: ${asset}:
Universe: ${uni}
Asset nonce value: ${nonce}
Mutation to be sent to GraphQL endpoint:
${mutation}
    `);
}
