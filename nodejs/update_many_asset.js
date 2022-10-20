/* eslint-disable no-console */
/* eslint-disable camelcase */

const fetch = require('isomorphic-fetch');
const fs = require('fs');
const identity = require('freeverse-crypto-js');
const { updateAssetOp, AtomicAssetOps } = require('freeverse-apisigner-js');
const { request, gql } = require('graphql-request');

class FreeverseAPI {
  constructor(env) {
    this.pvk = env.pvk;
    this.universe = parseInt(env.universeId, 10);
    this.endpoint = env.endpoint;
  }

  async getAssetNonce(id) {
    const { endpoint } = this;
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

  async getAllAssetsInUniverse() {
    const limit = 1000;
    const { endpoint, universe } = this;
    const totalCountQuery = gql`
      query ($universe: Int!) {
        allAssets(condition: { universeId: $universe }) {
          totalCount
        }
      }
    `;
    const totalCountResult = await request(endpoint, totalCountQuery, {
      universe,
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
    console.log(`fetching assets...`);
    for (
      let index = 0;
      index < Math.ceil(totalCountResult.allAssets.totalCount / limit);
      index++
    ) {
      const result = await request(endpoint, query, {
        universe,
        afterCursor,
        limit,
      });
      if (!result || !result.allAssets) return [];
      afterCursor = result.allAssets.pageInfo.endCursor;
      assets = [...assets, ...result.allAssets.nodes];
      console.log(`${assets.length}`);
    }

    return assets;
  }

  async getAsset(id) {
    const { endpoint } = this;
    const query = gql`
      query ($id: String!) {
        assetById(id: $id) {
          props
          metadata
        }
      }
    `;

    const result = await request(endpoint, query, {
      id,
    });
    const { props, metadata } = result?.assetById || {};
    return {
      props: props && JSON.parse(props),
      metadata: metadata && JSON.parse(metadata),
    };
  }

  async pushAsset(asset, assetOps) {
    const nonce = await this.getAssetNonce(asset.id);
    console.log(` Got asset nonce = ${nonce}`);
    const updatedAsset = {
      nonce: JSON.parse(nonce),
      assetId: asset.id,
      props: JSON.parse(asset.props),
      metadata: { ZoranTest: `ZoranTest-${Math.floor(Math.random() * 1000)}` },
    };
    const op = updateAssetOp(updatedAsset);
    assetOps.push({ op });
  }

  async updateAllAssets() {
    const { endpoint, universe, pvk } = this;
    const allAssets = await this.getAllAssetsInUniverse();
    console.log(`found ${allAssets.length} assets`);

    const assetOps = new AtomicAssetOps({ universeId: universe });
    for (let i = 0; i < 50; i++) {
      console.log(` - Pushing asset to mutation ${i}`);
      await this.pushAsset(allAssets[i], assetOps);
    }

    console.log(`found ${assetOps.length} assetOps`);

    const web3Account = identity.accountFromPrivateKey(pvk);
    const signature = assetOps.sign({ web3Account });
    const mutation = assetOps.mutation({ signature });
    console.log(mutation);

    console.log('Sending Mutation... :', mutation);

    return request(endpoint, mutation).then((response) => {
      console.log("#### Update Response:", response);
      const resultTemp = response.execute.results.map((resultTemp) => JSON.parse(resultTemp));
      return resultTemp[0];
    });
  }
}

env = JSON.parse(fs.readFileSync('.env'));
const api = new FreeverseAPI(env);

api.updateAllAssets();
