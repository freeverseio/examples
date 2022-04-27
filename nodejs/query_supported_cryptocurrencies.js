/* eslint-disable no-console */
// MIT License

// Copyright (c) 2021 freeverse.io

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

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
