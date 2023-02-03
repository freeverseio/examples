## Smart contract deployment

To deploy the smart contracts to the Hedera network follow the following steps:

1. Set the network name in which the contracts have to be deployed by modifying `const net` in `deploy_contracts.js (L-7)`(current options are `TESTNET` or `PREVIEWNET`)
2. Modify the `.env` file values for the network chosen in step 1 (e.g. `.env.testnet.json` if `TESTNET` is the desired network)
3. Run `npm ci`
4. Run `node deploy_contracts.js` to deploy the contracts.

