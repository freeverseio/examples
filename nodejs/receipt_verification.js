/* eslint-disable no-console */
/* eslint-disable camelcase */

/*
RETRIEVES THE SIGNER OF THE RECEIPT RECEIVED WHEN CREATING/UPDATING ASSETS

INPUTS:
* receipt: the received receipt, which must have this form:
receipt = {
     results: []string    an array with the unique Ids of the assets created
     ops: []string        an array with the operations applied
     universe: uint32     the universe Id where the ops are applied
     signature: string    the signature provided by the universe owner as input to the query
     verse: uint32        the verse at which ops will be synchronized with the Layer 1
}
* signature: the signature of the receipt by the relayer
*/

const { receiptDigest } = require('freeverse-apisigner-js');
const { ethers } = require('ethers');

const queryReturn = {
  data: {
    execute: {
      ops: [
        '{"type":"create_asset","msg":{"nonce":222,"owner_id":"0x0A0b39de3E704e8fB1C8E2A8C92c25A1A5f01930","props":"{\\"name\\":\\"Supercool Dragon\\",\\"description\\":\\"Legendary creature that loves ice.\\",\\"image\\":\\"ipfs://QmPCHHeL1i6ZCUnQ1RdvQ5G3qccsjgQF8GkJrWAm54kdtB\\",\\"animation_url\\":\\"ipfs://QmefzYXCtUXudCy9LYjU4biapHJiP26EGYS8hQjpei472j\\",\\"attributes\\":[{\\"trait_type\\":\\"Rarity\\",\\"value\\":\\"Common\\"},{\\"trait_type\\":\\"Level\\",\\"value\\":10},{\\"trait_type\\":\\"Weight\\",\\"value\\":223.5}]}","metadata":"{\\"private_data\\":\\"that has been updated\\"}"}}',
        '{"type":"set_asset_props","msg":{"nonce":46,"id":"9996728539600307361578482960568941467813912446507312","props":"{\\"name\\":\\"Supercool Dragon\\",\\"description\\":\\"Legendary creature that loves ice.\\",\\"image\\":\\"ipfs://QmPCHHeL1i6ZCUnQ1RdvQ5G3qccsjgQF8GkJrWAm54kdtB\\",\\"animation_url\\":\\"ipfs://QmefzYXCtUXudCy9LYjU4biapHJiP26EGYS8hQjpei472j\\",\\"attributes\\":[{\\"trait_type\\":\\"Rarity\\",\\"value\\":\\"Common\\"},{\\"trait_type\\":\\"Level\\",\\"value\\":10},{\\"trait_type\\":\\"Weight\\",\\"value\\":223.5}]}","metadata":"{\\"private_data\\":\\"that has been updated\\"}"}}',
      ],
      signature: '9829c7f3780e6654c8d4ab5c232dd311f8430eb5c96eca31ae608bd56bf6f96b6380ee197d660e1fc540a7b11217dcd9634ab96c6fa764d83f15c908593cfcb11c',
      universe: 0,
      verse: 56,
      results: [
        '{"id":"116094439901637204708574983391607507279736335403850032"}',
        '{"result":"success"}',
      ],
      receiptSignature: '817a3ebaa986e41dd7c8b43286cfef2f9a1757f342cf6f7e3846da3c5eaed0943d53644d85c8a5a9e2e4125739978fcf419bc794e58e3efa4099e138c6673c8801',
    },
  },
};

const receipt = queryReturn.data.execute;
const digest = receiptDigest({ receipt });
const recoveredAddress = ethers.utils.verifyMessage(
  ethers.utils.arrayify(digest),
  `0x${receipt.receiptSignature}`,
);
console.log('Recovered signer of receipt: ', recoveredAddress);
