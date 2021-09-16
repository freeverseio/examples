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
const argv = require('minimist')(process.argv.slice(2), { string: ['pk', 'password'] });

const { password, pk } = argv;
if (!password || !pk) {
  console.log(`
    ---------------
    Usage Example: 
    node identity_encrypt.js --password 'P@ssw0rd' --pk '0x56450b9e335eb41b0c90454285001f793e7bac2b2c94c353c392b38a2292e7d0'
    ---------------
    `);
} else {
  const encrypted = identity.encryptIdentity(pk, password);
  console.log(`
---------------
Original private key:
${pk}
Password:
${password}
Encrypted ID:
${encrypted}
---------------`);
}
