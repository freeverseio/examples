# Freeverse API Examples
This repository provides examples of how to use the public Freeverse packages created for NodeJS.

### Setup

Navigate to nodejs folder.

```
npm install
```

### Create a new asset

View the code at ```nodejs/asset_create.js```.

Run the example with 
```
npm run create -- --pvk '<your_pvk>' --owner '<address_of_owner>' --uni <universe_id_int> --nonce <asset_nonce_int>
```

A valid GraphQL mutation, signed by your account, will be printed to console. You may now paste this into GraphQL Playground, or send it via CURL or whichever method of your choosing to our API endpoint.

#### Obtaining the nonce for a user

If you wish to obtain the current nonce value needed for the above command, you can do so with the following query:
```
query {
    usersUniverseByUserIdAndUniverseId(universeId: 0, userId: "<address_of_owner>"){
        nonce
    }
}
```

### Update an new asset

View the code at ```nodejs/asset_update.js```. Open a terminal and switch to the ```nodejs/`` directory.

Run the example with 
```
npm run update -- --pvk '<your_pvk>' --asset '<id_of_asset>' --uni <universe_id_int> --nonce <asset_nonce_int>
```

A valid GraphQL mutation, signed by your account, will be printed to console. You may now paste this into GraphQL Playground, or send it via CURL or whichever method of your choosing to our API endpoint.

#### Obtaining the nonce for an asset

If you wish to obtain the current nonce value needed for the above command, you can do so with the following query:
```
query {
	allAssets(condition: {id: "<id_of_asset>"}){
    nodes{
      nonce
    }
  }
}
```

### Encrypt an Identity

Users can export their private key in an encrypted format that enables them to use our marketplace.

View the code at ```nodejs/identity_encrypt.js```. Open a terminal and switch to the ```nodejs/`` directory.

Run the example with
```
npm run encrypt -- --password 'P@ssw0rd' --pk '0x56450b9e335eb41b0c90454285001f793e7bac2b2c94c353c392b38a2292e7d0'
```

### Encrypt an Identity

Your local application can import a user's existing encrypted key if required.

View the code at ```nodejs/identity_decrypt.js```. Open a terminal and switch to the ```nodejs/`` directory.

Run the example with
```
npm run decrypt -- --password 'P@ssw0rd' --encrypted '92598e285fc171980ed645546e254ea4b2fc55f693a3175aed21e69d4773ce9eee1a05968d5b7e1049f1c5b3523719eea727aa6cc8a64b8fe53e858becdf914c'
```

### Upload image

View the code at ```nodejs/upload_image.js```. Open a terminal and switch to the ```nodejs/`` directory.

Run the example with 
```
npm run upload-image -- --pvk <pvk> --uni <universe_id_int> --api <api_url> --path <local_path_to_image>
```
This will create an http multipart form data request and send it to <api_url> endpoint. Which will upload the image and return the name of the uploaded image in our servers.


### List images

View the code at ```nodejs/list_images.js```. Open a terminal and switch to the ```nodejs/`` directory.

Run the example with 
```
npm run list-images -- --pvk <pvk> --uni <universe_id_int> --api <api_url>
```
This will send a get request to the <api_url> which will return all the images currently uploaded in the universe.
