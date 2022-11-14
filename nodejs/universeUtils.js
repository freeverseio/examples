const BN = require('bn.js');

/*
Derives universeId from a provided assetId
*/

const universeIdFromAssetId = (assetId) => {
  const assetIdBN = new BN(assetId, 10);
  return assetIdBN.ishrn(224).toNumber();
};

module.exports = {
  universeIdFromAssetId,
};
