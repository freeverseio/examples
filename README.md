# Freeverse API Examples
Examples to interact with Living Assets

## NodeJS

### Setup

Navigate to nodejs folder.

```npm install```

### Create a new asset

Open npm_example_create_asset.js and paste your private key in the const ```universe_owner_pvk```. Paste the public address of the user for whom you wish to create an asset in the const ```new_asset_owner_id```.

Run the example with 
```node npm_example_create_asset.js````

A valid GraphQL mutation, signed by your account, will be printed to console.

### Update an new asset

Open npm_example_update_asset.js and paste your private key in the const ```universe_owner_pvk```. Paste the ID of the asset that you wish to edit in the const ```asset_id```.

Run the example with 
```node npm_example_update_asset.js```

A valid GraphQL mutation, signed by your account, will be printed to console.


