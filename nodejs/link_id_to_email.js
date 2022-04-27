/* eslint-disable no-console */
// MIT License

const identity = require('freeverse-crypto-js');
const { digestLinkId, sign } = require('freeverse-marketsigner-js');
const argv = require('minimist')(process.argv.slice(2), {
  string: [
    'email',
    'alias',
  ],
});

const {
  email,
  alias,
} = argv;

const checkArgs = () => {
  const OK = (email && alias);
  if (!OK) {
    console.log(`
    ---------------
    Usage Example: 
    node link_id_to_email.js --email 'john@ama.com' --alias 'my first account'
    ---------------

    params:
    * email: the email of the user to whom the ID will be associated
    * alias: an alias for this user's account (e.g. "My first account")
    `);
  }
  return OK;
};

const run = () => {
  // Note: before doing anything related to asset trading
  // the user's ID needs to be registered.
  // This registration needs to be done only once
  // for a given user's ID.

  const randomPvk = '0x56450b9e335eb41b0c90454285001f793e7bac2b2c94c353c392b38a2292e7d0';
  const userAccount = identity.accountFromPrivateKey(randomPvk);
  const userId = userAccount.address;

  const digest = digestLinkId({
    email,
    freeverseId: userId,
  });

  // create web3 account from your private key
  // (other forms of creating web3 account could be subsituted)
  const signature = sign({ digest, web3account: userAccount });
  const signatureToSend = signature.substring(2, signature.length);
  const encryptedId = ''; // this param will be removed soon

  // inject results into final mutation to send to graphQL endpoint
  const assetMutation = `
mutation {
  linkFreeverseId(
    input: {
      email: "${email}",
      name: "${alias}",
      freeverseId: "${userId}",
      signature: "${signatureToSend}",
      encryptedId: "${encryptedId}",
    }
  )
}`;

  console.log(assetMutation);
};

const OK = checkArgs();
if (OK) run();
