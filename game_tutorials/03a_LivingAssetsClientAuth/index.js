const request = require('request');
const crypto = require('node:crypto');
const { GAME_PUBLIC_KEY } = require('./pbk');

// these variables are used in the demo, but the hash could be
// precomputed and stored instead
const USER_EMAIL = 'user@server.com';
const SALT = 'livingassets';
// this variable should be a specific code that only your server can understand
const ACTION_CODE = 'XYZ500';

// this is where we will be working from now one
const run = async () => {
    // this hash value could be precomputed
    const hashedUser = crypto.createHash('md5').update(USER_EMAIL + SALT).digest("hex");

    // create the message to be encrypted
    const messageJson = { user: hashedUser, action: ACTION_CODE };
    const message = JSON.stringify(messageJson);

    // convert to byte array, encrypt with the public key, and store as a hex string
    const buffer = Buffer.from(message);
    const encrypted = crypto.publicEncrypt({
        key: GAME_PUBLIC_KEY,
        padding: crypto.constants.RSA_PKCS1_PADDING,
    }, buffer);
    const encryptedMessage = encrypted.toString('hex');

    // POST the message to the server
    request.post(
        'http://localhost:3000/evolve/',
        { json: { message: encryptedMessage } },

        function (error, response, body) {
            if (error) {
                console.log(error);
            }
            else {
                console.log(body);
            }
        }
    );
}

run();