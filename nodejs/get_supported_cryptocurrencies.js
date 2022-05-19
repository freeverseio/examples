/* eslint-disable no-console */

// Returns all crypto currencies available.
// The return data contains:
//
// * Main entry point:
//  - paymentsContractAddress: the address where the escrow payments contract is deployed
//
// * Params that describe the currency accepted by escrow contract:
//  - currencyId:  is the identifier, to be used in the createBuyNow mutation.
//  - symbol: the short symbol used by the coin.
//  - isErc20: (bool) if true, the accepted currency is an ERC20 token, otherwise,
//    it's the native currency of the underlying blockchain
//  - erc20ContractAddress: if isErc20 == true, the query returns the address
//    where the ERC20 token contract is deployed in the underlying blockchain

// * Params that describe the underlying blockchain where the escrow contract is deployed
//  - networkName: the short name of the blockchain, e.g. XDAI
//  - chainID: the underlying blockchain chainId, e.g. 100
//  - bluecoinSymbol: the symbol of the cryptocurrency native to the underlying blockchain
//    note: if isErc20 == false, then symbol == bluecoinSymbol
//  - nodeUrl: the address of a public node of the underlying blockchain to which TXs can be sent
//  - confirmationBlocks: the recommended number of mined blocks to wait after before a transaction
//    can be considered as final in the underlying blockchain

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

// eslint-disable-next-line no-unused-vars
const exampleResult = {
  data: {
    allSupportedCryptocurrencies: {
      nodes: [
        {
          currencyId: 7,
          symbol: 'XDAI',
          isErc20: false,
          erc20ContractAddress: '',
          paymentsContractAddress: '0x0C3302912BA42f34fdD32cAF0ddcEF9cb6F977aF',
          networkName: 'XDAI',
          nodeUrl: 'https://rpc.xdaichain.com/',
          chainId: 100,
          confirmationBlocks: 8,
          bluecoinSymbol: 'XDAI',
        },
        {
          currencyId: 3,
          symbol: 'FVXDAI',
          isErc20: true,
          erc20ContractAddress: '0x83Bf599aA9C55Be2B665d8d782dc9c2188077dd5',
          paymentsContractAddress: '0xbEd0d3083F8cbd64226BE421202011d5B82800E6',
          networkName: 'XDAI',
          nodeUrl: 'https://rpc.xdaichain.com/',
          chainId: 100,
          confirmationBlocks: 8,
          bluecoinSymbol: 'XDAI',
        },
        {
          currencyId: 6,
          symbol: 'MATIC',
          isErc20: false,
          erc20ContractAddress: '',
          paymentsContractAddress: '0xf48916eF6F504dec536C7dEe900CA490cC4912aa',
          networkName: 'Polygon',
          nodeUrl: 'https://rpc-mainnet.maticvigil.com',
          chainId: 137,
          confirmationBlocks: 20,
          bluecoinSymbol: 'MATIC',
        },
        {
          currencyId: 4,
          symbol: 'MAG',
          isErc20: true,
          erc20ContractAddress: '0xad4c08981C5054356F3550CEa050edeEB1B10221',
          paymentsContractAddress: '0x1781d40dc104302476456A442738f378D1830465',
          networkName: 'Moonbase Alpha',
          nodeUrl: 'https://rpc.api.moonbase.moonbeam.network',
          chainId: 1287,
          confirmationBlocks: 10,
          bluecoinSymbol: 'DEV',
        },
        {
          currencyId: 5,
          symbol: 'MATICMumbai',
          isErc20: false,
          erc20ContractAddress: '',
          paymentsContractAddress: '0xe1bfcc5fA429c84f73C684728549A15105C74970',
          networkName: 'Polygon Mumbai',
          nodeUrl: 'https://matic-mumbai.chainstacklabs.com',
          chainId: 80001,
          confirmationBlocks: 20,
          bluecoinSymbol: 'MATIC',
        },
        {
          currencyId: 2,
          symbol: 'FVT',
          isErc20: true,
          erc20ContractAddress: '0x548643c82de0BeA0dEe3A0e995311d848CFF269d',
          paymentsContractAddress: '0x689302d802653f38eE20a000db645D21FC56cB6B',
          networkName: 'Polygon Mumbai',
          nodeUrl: 'https://rpc-mumbai.maticvigil.com/',
          chainId: 80001,
          confirmationBlocks: 20,
          bluecoinSymbol: 'MATIC',
        },
      ],
    },
  },
};
