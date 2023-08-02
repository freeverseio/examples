// freeverse.js
const identity = require('freeverse-crypto-js');
const { createAssetOp, updateAssetOp, AtomicAssetOps } = require('freeverse-apisigner-js');

const UNIVERSE_ID = '0'; // PASTE YOUR UNIVERSE ID HERE
const PVK = '<paste_private_key_here>'; // PASTE YOUR PVK HERE

const universeOwnerAccount = identity.accountFromPrivateKey(PVK);

exports.createAsset = (owner, ownerNonce, assetProps, assetMetadata) => {
  const assetOps = new AtomicAssetOps({ universeId: UNIVERSE_ID });
  const operation = createAssetOp({
    nonce: ownerNonce,
    ownerId: owner,
    props: assetProps,
    metadata: assetMetadata,
  });
  assetOps.push({ op: operation });

  const sig = assetOps.sign({ web3Account: universeOwnerAccount });
  const mutation = assetOps.mutation({ signature: sig });
  return mutation;
};

exports.evolveAsset = (asset, assetNonce, assetProps, assetMetadata) => {
  const assetOps = new AtomicAssetOps({ universeId: UNIVERSE_ID });
  const operation = updateAssetOp({
    nonce: assetNonce,
    assetId: asset,
    props: assetProps,
    metadata: assetMetadata,
  });
  assetOps.push({ op: operation });

  const sig = assetOps.sign({ web3Account: universeOwnerAccount });
  const mutation = assetOps.mutation({ signature: sig });
  return mutation;
};
