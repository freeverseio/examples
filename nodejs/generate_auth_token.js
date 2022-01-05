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

const Accounts = require('web3-eth-accounts');
const { getTokenDigest, composeToken } = require('freeverse-marketsigner-js');

const argv = require('minimist')(process.argv.slice(2), { string: ['pvk'] });

const { pvk } = argv;
if (!pvk) {
  console.log(`
    ---------------
    Usage Example: 
    node generate_auth_token.js --pvk '0xc6d398e89bf7cbda7663ca881bd992eb80ad170e4ca0bd65a8b1c719ee02bc67'
    ---------------
    `);
} else {
  // Generates a token that is valid for 5 minutes around the passed 'time' value.
  // Several API calls require this token to be in the query headers.
  // It basically consists on signing a digest that is derived from the 'time' value,
  // converting it to base64, and passing it as a string, concatenated after 'time',
  const now = new Date().getTime() / 1000;
  const tokenDigest = getTokenDigest({ time: now });
  const signature = new Accounts().sign(tokenDigest, pvk);
  const token = composeToken({ time: now, sig: signature.signature });

  console.log(`
---------------
Generated token: ${token}
---------------`);
}
