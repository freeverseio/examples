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
        "{\"type\":\"create_asset\",\"msg\":{\"nonce\":226,\"owner_id\":\"0x0A0b39de3E704e8fB1C8E2A8C92c25A1A5f01930\",\"props\":\"{\\\"name\\\":\\\"Supercool Dragon\\\",\\\"description\\\":\\\"Legendary creature that loves ice.\\\",\\\"image\\\":\\\"ipfs://QmPCHHeL1i6ZCUnQ1RdvQ5G3qccsjgQF8GkJrWAm54kdtB\\\",\\\"animation_url\\\":\\\"ipfs://QmefzYXCtUXudCy9LYjU4biapHJiP26EGYS8hQjpei472j\\\",\\\"attributes\\\":[{\\\"trait_type\\\":\\\"Rarity\\\",\\\"value\\\":\\\"Common\\\"},{\\\"trait_type\\\":\\\"Level\\\",\\\"value\\\":10},{\\\"trait_type\\\":\\\"Weight\\\",\\\"value\\\":223.5}]}\",\"metadata\":\"{\\\"private_data\\\":\\\"that has been updated\\\"}\"}}",
        "{\"type\":\"set_asset_props\",\"msg\":{\"nonce\":4,\"id\":\"9997220295222263808910038093126797702019127927349276\",\"props\":\"{\\\"name\\\":\\\"My First Living Asset\\\",\\\"description\\\":\\\"Freeverse living asset. The on-chain properties of this NFT can evolve.\\\",\\\"image\\\":\\\"ipfs://QmUn4gzAAY8vDFNnA25MopB1RWtMmwWdQCEMUe67XiPW8x\\\",\\\"animation_url\\\":\\\"ipfs://QmefzYXCtUXudCy9LYjU4biapHJiP26EGYS8hQjpei472j\\\",\\\"attributes\\\":[{\\\"trait_type\\\":\\\"Level\\\",\\\"value\\\":\\\"1\\\"},{\\\"trait_type\\\":\\\"Shape\\\",\\\"value\\\":\\\"Cilinder\\\"},{\\\"trait_type\\\":\\\"Creation date\\\",\\\"value\\\":\\\"2022-07-13 10:50:01\\\"}]}\",\"metadata\":\"{\\\"private_data\\\":\\\"that has been updated\\\"}\"}}"
          ],
      signature: "20f32ad2823836bc5e9fd430753bdfc775976e126c50daec4841d83aeb239cc65d22fd75043bd4e7c518d8094a29c35063c7212867bf943fc0c4dcbaea25e4f51c",
      universe: 0,
      verse: 60,
      results: [
        "{\"id\":\"116100285908186528320247798130938372411814959134021936\"}",
        "{\"result\":\"success\"}"
      ],
      receiptSignature: "6d6a20333f17a84f8e0c2aaf46fa7168669f998c80b4c56a181c7d639d30b8a46e3823a01f1f847888cdd5a216b6a0ef5277612f90bb994fb5c2685fcb6bb40800"
    }
  }
};

const receipt = queryReturn.data.execute;
const digest = receiptDigest({ receipt });
console.log(digest);
const recoveredAddress = ethers.utils.verifyMessage(
  ethers.utils.arrayify(digest),
  `0x${receipt.receiptSignature}`,
);
console.log('Recovered signer of receipt: ', recoveredAddress);
// expected 0xeB41ebaD7Cf9bb9c821a1ce41674706B8147Fd20 

// this is the exact copy paste result deom tha API
`
{
  "data": {
    "execute": {
      "ops": [
        "{\"type\":\"create_asset\",\"msg\":{\"nonce\":226,\"owner_id\":\"0x0A0b39de3E704e8fB1C8E2A8C92c25A1A5f01930\",\"props\":\"{\\\"name\\\":\\\"Supercool Dragon\\\",\\\"description\\\":\\\"Legendary creature that loves ice.\\\",\\\"image\\\":\\\"ipfs://QmPCHHeL1i6ZCUnQ1RdvQ5G3qccsjgQF8GkJrWAm54kdtB\\\",\\\"animation_url\\\":\\\"ipfs://QmefzYXCtUXudCy9LYjU4biapHJiP26EGYS8hQjpei472j\\\",\\\"attributes\\\":[{\\\"trait_type\\\":\\\"Rarity\\\",\\\"value\\\":\\\"Common\\\"},{\\\"trait_type\\\":\\\"Level\\\",\\\"value\\\":10},{\\\"trait_type\\\":\\\"Weight\\\",\\\"value\\\":223.5}]}\",\"metadata\":\"{\\\"private_data\\\":\\\"that has been updated\\\"}\"}}",
        "{\"type\":\"set_asset_props\",\"msg\":{\"nonce\":4,\"id\":\"9997220295222263808910038093126797702019127927349276\",\"props\":\"{\\\"name\\\":\\\"My First Living Asset\\\",\\\"description\\\":\\\"Freeverse living asset. The on-chain properties of this NFT can evolve.\\\",\\\"image\\\":\\\"ipfs://QmUn4gzAAY8vDFNnA25MopB1RWtMmwWdQCEMUe67XiPW8x\\\",\\\"animation_url\\\":\\\"ipfs://QmefzYXCtUXudCy9LYjU4biapHJiP26EGYS8hQjpei472j\\\",\\\"attributes\\\":[{\\\"trait_type\\\":\\\"Level\\\",\\\"value\\\":\\\"1\\\"},{\\\"trait_type\\\":\\\"Shape\\\",\\\"value\\\":\\\"Cilinder\\\"},{\\\"trait_type\\\":\\\"Creation date\\\",\\\"value\\\":\\\"2022-07-13 10:50:01\\\"}]}\",\"metadata\":\"{\\\"private_data\\\":\\\"that has been updated\\\"}\"}}"
      ],
      "signature": "20f32ad2823836bc5e9fd430753bdfc775976e126c50daec4841d83aeb239cc65d22fd75043bd4e7c518d8094a29c35063c7212867bf943fc0c4dcbaea25e4f51c",
      "universe": 0,
      "verse": 60,
      "results": [
        "{\"id\":\"116100285908186528320247798130938372411814959134021936\"}",
        "{\"result\":\"success\"}"
      ],
      "receiptSignature": "6d6a20333f17a84f8e0c2aaf46fa7168669f998c80b4c56a181c7d639d30b8a46e3823a01f1f847888cdd5a216b6a0ef5277612f90bb994fb5c2685fcb6bb40800"
    }
  }
}
`