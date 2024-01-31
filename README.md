# Living Assets Layer-2 Examples
This repository provides examples of how to use the public libraries developed within the context of the Living Assets
Layer-2. Checkout the [main developer's site](https://dev.livingassets.io/) for general context and API documentation.

Checkout the [LAOS Layer-1](https://laosnetwork.io/) project for the evolution of the Layer-2 into something significantly more powerful. 

## Setup

```
cd nodejs && npm ci
```

## Usage

All examples are short, self-explanatory scripts, with extensive in-code documentation about their usage.

The output of each script is usually a GraphQL mutation ready to be submitted to our API endpoint.

Please read the comments in each script before using, and update the relevant variables.

### Example

For example, to learn about how to create an asset:
* view the code in ```nodejs/asset_create.js```
* update the const variables at the beginning of the script with your data (private key, new asset owner, properties etc.)
* navigate to the nodejs directory and run ```node asset_create.js ```

The output should be a GraphQL mutation pasted to the console:
```
mutation {
    execute(
      input: {
        ops: ["{\"type\":\"create_asset\",\"msg\":{\"nonce\":0,\"owner_id\":\"0x983c1A8FCf74CAF648fD51fd7A6d322a502ae789\",\"props\":\"{\\\"name\\\":\\\"Supercool Dragon\\\",\\\"description\\\":\\\"Legendary creature that loves fire.\\\",\\\"image\\\":\\\"ipfs://QmPCHHeL1i6ZCUnQ1RdvQ5G3qccsjgQF8GkJrWAm54kdtB\\\",\\\"animation_url\\\":\\\"ipfs://QmefzYXCtUXudCy9LYjU4biapHJiP26EGYS8hQjpei472j\\\",\\\"attributes\\\":[{\\\"trait_type\\\":\\\"Rarity\\\",\\\"value\\\":\\\"Scarce\\\"},{\\\"trait_type\\\":\\\"Level\\\",\\\"value\\\":5},{\\\"trait_type\\\":\\\"Weight\\\",\\\"value\\\":123.5}]}\",\"metadata\":\"{\\\"private_data\\\":\\\"that only I will see\\\"}\"}}"],
        signature: "93024b05dcc822776fa84f3dc4070d5e16b9f032b11f4699bf6dbf017fac7fa8587ee9af9c41223c4a7f7fe66d873be1cd6141f0f9efccc13aac402c7e327b2d1b",
        universe: 0,
      }
    )
    {
      results
    }
  }
```
You can send this directly to our API endpoint, or use an application like [GraphQL Playground](https://github.com/graphql/graphql-playground) for testing purposes.
