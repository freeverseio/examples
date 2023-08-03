const express = require('express');
const { GraphQLClient, gql } = require('graphql-request');
const freeverse = require('./freeverse');
const crypto = require('node:crypto');
const { GAME_PRIVATE_KEY } = require('./pvk');
const { ASSET_JSON } = require('./gameasset');
const app = express();
app.use(express.json());

// constants for use in tutorial
const endpoint = '<paste_endpoint_from_freeverse_here>';

const USER_EMAIL = 'user@server.com';
const SALT = 'livingassets';
const ACTION_CODE = 'XYZ500';

// the GraphQL Client, used to send and receive data
const graphQLClient = new GraphQLClient(endpoint, {
  jsonSerializer: {
    parse: JSON.parse,
    stringify: JSON.stringify,
  },
});

// evolve asset route
app.post('/evolve/', async (request, response) => {
  // get the enrypted message from the body
  const { message } = request.body;

  // convert to a buffer and decrypt
  const buffer = Buffer.from(message, 'hex');
  const decrypted = crypto.privateDecrypt({
    key: GAME_PRIVATE_KEY,
    padding: crypto.constants.RSA_PKCS1_PADDING,
  }, buffer);
  // parse the result into a JSON
  const decryptedJSON = JSON.parse(decrypted.toString('utf8'));

  // check that our user is correct
  const hash = crypto.createHash('md5').update(USER_EMAIL + SALT).digest('hex');
  if (hash !== decryptedJSON.user) {
    response.send('Unauthorised user');
    return;
  }

  // parse the action code and return a message if unknown
  switch (decryptedJSON.action) {
    case ACTION_CODE:
      // this value set according to the game's design mechanics
      ASSET_JSON.props.attributes[2].value = 420.6;
      break;
    default:
      response.send('Unknown action');
      return;
  }

  // get the relevant fields from the GAME_ASSET
  const { asset, props, metadata } = ASSET_JSON;

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