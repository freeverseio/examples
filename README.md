# Freeverse API Examples
This repository provides examples of how to use the public Freeverse packages created for NodeJS.

## Setup

```
cd nodejs && npm ci
```

## Usage

All examples are short, self-explanatory scripts, with extensive in-code documentation about their usage.

The output of each script is usually a GraphQL mutation ready to be submitted to our API endpoint.

Please read the comments in each script before using, and update the relevant variables.

For example, to learn about how to create an asset:
* view the code in ```nodejs/asset_create.js```
* update the const variables at the beginning of the script with your data (private key, new asset owner, properties etc.)
* navigate to the nodejs directory and run ```node asset_create.js ```
