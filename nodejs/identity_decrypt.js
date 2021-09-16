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
const argv = require('minimist')(process.argv.slice(2), { string: ['encrypted', 'password'] });

const { password, encrypted } = argv;
if (!password || !encrypted) {
  console.log(`
    ---------------
    Usage Example: 
    node identity_decrypt.js --password 'P@ssw0rd' --encrypted 'c33dcc598252fbbb4a94ff2d0f70dbe7d77360d8ca4a036ad1dd80bc4c7bb0b818517bdd5fdd0cf0562080e33559bfab637d3ed3ccd6ddfdbd58b8d8874047bf'
    ---------------
    `);
} else {
// this is the user's private key
  const pvk = identity.decryptIdentity(encrypted, password);

  // this is the freeverseID (public address) of the user
  const freeverseID = identity.freeverseIdFromPrivateKey(pvk);

  console.log(`
---------------
Original encrypted ID:
${encrypted}
Password:
${password}
Private Key:
${pvk}
FreeverseID (public address):
${freeverseID}
---------------`);
}
