/* eslint-disable no-console */
// MIT License

// Returns all crypto currencies available. The data returned contains:
// Main entry point:
// - paymentsContractAddress: the address where the escrow payments contract is deployed
//
// Params that describe the currency accepted by escrow contract:
// - currencyId:  is the identifier, to be used in the createBuyNow mutation.
// - symbol: the short symbol used by the coin.
// - isErc20: (bool) if true, the accepted currency is an ERC20 token, otherwise,
//    it's the native currency of the underlying blockchain
// - erc20ContractAddress: if isErc20 == true, the query returns the address
//    where the ERC20 token contract is deployed in the underlying blockchain

// Params that describe the underlying blockchain where the escrow contract is deployed
// - networkName: the short name of the blockchain, e.g. XDAI
// - chainID: the underlying blockchain chainId, e.g. 100
// - bluecoinSymbol: the symbol of the cryptocurrency native to the underlying blockchain
//    note: if isErc20 == false, then symbol == bluecoinSymbol
// - nodeUrl: the address of a public node of the underlying blockchain to which TXs can be sent
// - confirmationBlocks: the recommended number of mined blocks to wait after before a transaction
//    can be considered as final in the underlying blockchain
const querySupportedCryptocurrencies = () => {
  const getAllSupportedCryptocurrencies = `
    query getAllSupportedCryptocurrencies {
      allSupportedCryptocurrencies{
        nodes {
          currencyId
          symbol 
          isErc20
          erc20ContractAddress
          paymentsContractAddress
          networkName
          chainId
          nodeUrl
          confirmationBlocks
          bluecoinSymbol
        }
      }
    }`;

  console.log(getAllSupportedCryptocurrencies);
  // Imagine we get:
  return [
    {
      currencyId: 1,
      symbol: 'XDAI',
      paymentsContractAddress: '0x0C3302912BA42f34fdD32cAF0ddcEF9cb6F977aA',
      erc20ContractAddress: '',
      confirmationBlocks: 8,
      nodeUrl: 'https://rpc.xdaichain.com/',
    },
    {
      currencyId: 2,
      symbol: 'FVXDAI',
      paymentsContractAddress: '0xbEd0d3083F8cbd64226BE421202011d5B82800E2',
      erc20ContractAddress: '0x83Bf599aA9C55Be2B665d8d782dc9c2188077dd2',
      confirmationBlocks: 10,
      nodeUrl: 'https://rpc.xdaichain.com/',
    }];
};

querySupportedCryptocurrencies()

module.exports = {
  querySupportedCryptocurrencies,
};
