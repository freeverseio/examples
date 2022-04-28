// MIT License

// Returns an example provider that can be used in the examples of this repository
// It receives a private key so that it can sign when
// the corresponding eth address sends a transaction
const { Web3ProviderEngine, PrivateKeyWalletSubprovider, RPCSubprovider } = require('@0x/subproviders');
const { providerUtils } = require('@0x/utils');

// examples of rpcUrl/ChainId pairs:
// const mumbai = { rpcUrl: 'https://matic-mumbai.chainstacklabs.com', chainId: 80001 };
// const xdai = { rpcUrl: 'https://rpc.xdaichain.com/', chainId: 100 };

const testingProvider = (pvk, rpcUrl, chainId) => {
  const provider = new Web3ProviderEngine();
  provider.addProvider(new PrivateKeyWalletSubprovider(pvk, chainId));
  provider.addProvider(new RPCSubprovider(rpcUrl));
  provider.start();
  providerUtils.startProviderEngine(provider);
  return provider;
};

module.exports = {
  testingProvider,
};
