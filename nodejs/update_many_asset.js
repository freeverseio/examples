/* eslint-disable no-console */
/* eslint-disable camelcase */
/* eslint-disable no-await-in-loop */

/*
UPDATES AN ASSET
See asset_create for more info

INPUTS:
* pvk: the private key of the owner of the universe
* uni: the universe id
*/

const pvk = '0x3B878F7892FBBFA30C8AED1DF317C19B853685E707C2CF0EE1927DC516060A54';
const universe = '0';
const endpoint = 'https://api.blackhole.gorengine.com/';

const identity = require('freeverse-crypto-js');
const { updateAssetOp, AtomicAssetOps } = require('freeverse-apisigner-js');
const { request, gql } = require('graphql-request');

// create web3 account from your private key
// (other forms of creating web3 account could be subsituted)
const universeOwnerAccount = identity.accountFromPrivateKey(pvk);

async function getAssetNonce(id) {
  const query = gql`
    query ($id: String!) {
      assetById(id: $id) {
        nonce
      }
    }
  `;

  const result = await request(endpoint, query, {
    id,
  });
  const { nonce = 0 } = result?.assetById || {};
  return parseInt(nonce, 10);
}

async function getAllAssetsInUniverse() {
  const limit = 1000;
  const totalCountQuery = gql`
    query ($universe: Int!) {
      allAssets(condition: { universeId: $universe }) {
        totalCount
      }
    }
  `;
  const totalCountResult = await request(endpoint, totalCountQuery, {
    universe: parseInt(universe, 10),
  });
  if (!totalCountResult || !totalCountResult.allAssets) return [];

  const query = gql`
    query ($universe: Int!, $afterCursor: Cursor, $limit: Int) {
      allAssets(
        condition: { universeId: $universe }
        first: $limit
        after: $afterCursor
      ) {
        nodes {
          id
          props
          metadata
        }
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;
  let assets = [];
  let afterCursor;
  console.log('fetching assets...');
  for (
    let i = 0;
    i < Math.ceil(totalCountResult.allAssets.totalCount / limit);
    i += 1
  ) {
    const result = await request(endpoint, query, {
      universe: parseInt(universe, 10),
      afterCursor,
      limit,
    });
    if (!result || !result.allAssets) return [];
    afterCursor = result.allAssets.pageInfo.endCursor;
    assets = [...assets, ...result.allAssets.nodes];
    console.log(`${assets.length}/${totalCountResult.allAssets.totalCount}`);
  }

  return assets;
}

async function buildOps(asset, assetOps) {
  const nonce = await getAssetNonce(asset.id);
  const updatedAsset = {
    nonce: JSON.parse(nonce),
    assetId: asset.id,
    props: JSON.parse(asset.props),
    metadata: { test: `test-${Math.floor(Math.random() * 1000)}` },
  };
  const op = updateAssetOp(updatedAsset);
  assetOps.push({ op });
}

const run = async () => {
  const allAssets = await getAllAssetsInUniverse();

  const n = 100;
  console.log(`building mutation for update ${n} assets...`);
  const assetOps = new AtomicAssetOps({ universeId: universe });
  for (let i = 0; i < n; i += 1) {
    console.log(`${i}/${n}`);
    await buildOps(allAssets[i], assetOps);
  }

  const signature = assetOps.sign({ web3Account: universeOwnerAccount });
  const mutation = assetOps.mutation({ signature });

  console.log('Sending Mutation...');

  return request(endpoint, mutation).then((response) => {
    console.log('Update Response:', response);
    const resultTemp = response.execute.results.map((res) => JSON.parse(res));
    return resultTemp[0];
  });
};

run();
