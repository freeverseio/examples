/* eslint-disable no-console */

/*
Generates a token that is valid for 5 minutes around the passed 'time' value.
Several API calls require this token to be in the query headers.
It basically consists on signing a digest that is derived from the 'time' value,
converting it to base64, and passing it as a string, concatenated after 'time',

INPUTS:
- pvk: the private key of the entity generating the token
*/

const pvk = '0xc6d398e89bf7cbda7663ca881bd992eb80ad170e4ca0bd65a8b1c719ee02bc67';

// Generating the token

const Accounts = require('web3-eth-accounts');
const { getTokenDigest, composeToken } = require('freeverse-marketsigner-js');

const now = new Date().getTime() / 1000;
const tokenDigest = getTokenDigest({ time: now });
const signature = new Accounts().sign(tokenDigest, pvk);
const token = composeToken({ time: now, sig: signature.signature });

console.log(`
---------------
Generated token: ${token}
Include it in http header as: 
  headers: { Authorization: Freeverse ${token} }
---------------`);
