/* eslint-disable no-console */
/* eslint-disable camelcase */
/* eslint-disable no-await-in-loop */

/*
GET ALL ASSETS
See asset_create for more info

INPUTS:
* pvk: the private key of the owner of the universe
* uni: the universe id
*/

const universe = '0';
const endpoint = 'https://api.blackhole.gorengine.com/';
const limit = 1000;

const { request, gql } = require('graphql-request');

async function getAllAssetsInUniverse() {
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

const run = async () => {
  const assets = await getAllAssetsInUniverse();
  console.log('assets got: ', assets.length);
};

run();
