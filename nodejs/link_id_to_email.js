/* eslint-disable no-console */
// MIT License

// Copyright (c) 2021 freeverse.io

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

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
