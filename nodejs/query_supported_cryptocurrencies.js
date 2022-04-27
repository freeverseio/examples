/* eslint-disable no-console */
// MIT License

const querySupportedCryptocurrencies = () => {
  // Returns crypto currencies available
  // CurrencyId is the identifier to be forwared to createBuyNow mutation.
  // Symbol of the coin.
  // ERC20ContractAddress address where the ERC20 token contract is deployed if it's an ERC20 Token
  // PaymentsContractAddress address where the payments contract that acts as an escrow is deployed
  // ConfirmationBlocks Number of blocks to wait after any transaction has been mined to consider it as final
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
      "currencyId": 1,
      "symbol": "XDAI",
      "paymentsContractAddress": "0x0C3302912BA42f34fdD32cAF0ddcEF9cb6F977aA",
      "erc20ContractAddress": "",
      "confirmationBlocks": 8,
      "nodeUrl": "https://rpc.xdaichain.com/"
    },
    {
      "currencyId": 2,
      "symbol": "FVXDAI",
      "paymentsContractAddress": "0xbEd0d3083F8cbd64226BE421202011d5B82800E2",
      "erc20ContractAddress": "0x83Bf599aA9C55Be2B665d8d782dc9c2188077dd2",
      "confirmationBlocks": 10,
      "nodeUrl": "https://rpc.xdaichain.com/"
    }];
};

module.exports = {
  querySupportedCryptocurrencies,
};
