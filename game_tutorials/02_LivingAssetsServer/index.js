const express = require('express');
const { GraphQLClient, gql } = require('graphql-request');
const freeverse = require('./freeverse');
const app = express();
app.use(express.json());

// constants for use in tutorial
const endpoint = '<paste_endpoint_provided_by_freeverse>';

// the GraphQL Client, used to send and receive data
const graphQLClient = new GraphQLClient(endpoint, {
  jsonSerializer: {
    parse: JSON.parse,
    stringify: JSON.stringify,
  },
});

// create asset route
app.post('/create/', async (request, response) => {
  // get the user ID from the POST request body
  const { owner, props, metadata } = request.body;

  // request the nonce from the Living Assets API
  const data = await graphQLClient.request(
    // query
    gql`
    query( $userId: String! ) {
      usersUniverseByUserIdAndUniverseId(
        universeId: 0, 
        userId: $userId
      ) {
          nonce
      }
    }`,
    // variables
    {
      userId: owner,
    },
  );

  let ownerNonce = 0;
  if (data.usersUniverseByUserIdAndUniverseId && data.usersUniverseByUserIdAndUniverseId.nonce) {
    ownerNonce = data.usersUniverseByUserIdAndUniverseId.nonce;
  }
  const mutation = freeverse.createAsset(owner, ownerNonce, props, metadata);
  const mutationResponse = await graphQLClient.request(mutation);
  response.send(mutationResponse);
});

// create asset route
app.post('/evolve/', async (request, response) => {
  // get the asset ID from the POST request body
  const { asset, props, metadata } = request.body;
  // request the nonce from the Living Assets API
  const data = await graphQLClient.request(
    // query
    gql`
    query( $assetId: String! ) {
      assetById(
        id: $assetId
      ) {
          nonce
      }
    }`,
    // variables
    {
      assetId: asset,
    },
  );
  let assetNonce = 0;
  if (data.assetById && data.assetById.nonce) {
    assetNonce = data.assetById.nonce;
  } else {
    response.send('ERROR: asset does not exist');
  }
  const mutation = freeverse.evolveAsset(asset, assetNonce, props, metadata);
  const mutationResponse = await graphQLClient.request(mutation);
  response.send(mutationResponse);
});

app.listen(3000);
