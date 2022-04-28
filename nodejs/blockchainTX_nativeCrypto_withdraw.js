/* eslint-disable no-console */
// MIT License

const Eth = require('web3-eth');

const identity = require('freeverse-crypto-js');
const { NativeCryptoPayments } = require('freeverse-marketsigner-js');
const argv = require('minimist')(process.argv.slice(2), {
  string: [
    'paymentsAddr',
    'confirmationBlock',
    'pvk',
    'operatorSig',
    'paymentId',
    'rpcUrl',
    'chainId',
    'assetTransferSuccess',
  ],
});
const { testingProvider } = require('./utils/testingProvider');

const {
  paymentsAddr,
  confirmationBlock,
  pvk,
  operatorSig,
  paymentId,
  rpcUrl,
  chainId,
  assetTransferSuccess,
} = argv;

const checkArgs = () => {
  const OK = (
    paymentsAddr && confirmationBlock && pvk && operatorSig
    && paymentId && rpcUrl && assetTransferSuccess
  );
  if (!OK) {
    console.log(`
      ---------------
      Function: calls NativePayments blockchain smart contract method 'finalizeAndWithdraw'
      Usage Example: 
      node blockchainTX_nativeCrypto_withdraw.js --pvk '2b40a5c68e311c2057b7b6a2763a6bdf431f8092d43a9c131609eacbb29739b0' --paymentId '0x67e536c83928dec5ae68b1cb7bd55c4d22e7252a92d588944839aba7675d40f7'  --operatorSig '0xddbfc28a5d8b4e67af13099a1f5c7d0e2c11b0d1350ade51bb5b8abe2254cb5932a582521a6127e5aaad0eff9fab4bb04a3ac226ecb5605b669edb9a01a5fdc11b' --confirmationBlock 8 --paymentsAddr '0xe1bfcc5fA429c84f73C684728549A15105C74970' --rpcUrl 'https://matic-mumbai.chainstacklabs.com' --chainId 80001 --assetTransferSuccess true
      ---------------
      
      params:
      * pvk: the private key of the seller

      params related to the blockchain where the escrow contract is deployed:
      * rpcUrl: the url of a (public) node of that blockchain
      * chainId: the chainId of the blockchain
      * paymentsAddr: the address of the smart contract that acts as escrow
      * confirmationBlock: number of blocks that the provider waits after tx hash has been mined to call the onConfirmed method

      params related to the payment transaction, all of them returned when calling the cashout mutation
      * paymentId: id that identifies the payment in the escrow contract
      * assetTransferSuccess: boolean indicating the success or otherwise of the asset transfer from seller to buyer
      * operatorSig: the signature that FV issues, which certifies all of the params above.
      `);
  }
  return OK;
};

const onConfirmationHandler = (confirmationNumber) => {
  if (confirmationNumber >= confirmationBlock) {
    console.log('Tx confirmed on ', confirmationBlock);
  }
};

const onReceiptHandler = (receipt) => {
  console.log('Receipt received:', JSON.stringify(receipt));
  process.exit(1);
};

/* Note: before running this transaction a call to the mutation cashout must be done
  to collect the results from it, which are needed to generate the input for this transaction.
  Mutation Cashout returns:
    {
      signature: String!
      paymentId: String!
      assetTransferSuccess: Boolean!
    }
  */

const run = async () => {
  // For this example, we need to set up our own provider.
  // In general, use your standard web3 provider.
  const eth = new Eth(testingProvider(pvk, rpcUrl, chainId));

  // This is the class allows interaction with the blockchain contract
  const paymentsInstance = new NativeCryptoPayments({ paymentsAddr, eth, confirmationBlock });

  const assetTransferData = {
    paymentId,
    wasSuccessful: assetTransferSuccess,
  };

  const sellerAddr = identity.freeverseIdFromPrivateKey(pvk);

  // This is the blockchain contract TX sending. Handle events as usual.
  paymentsInstance.finalizeAndWithdraw(
    { assetTransferData, signature: operatorSig, from: sellerAddr },
  )
    .once('receipt', onReceiptHandler)
    .on('confirmation', onConfirmationHandler)
    .on('error', (err) => {
      console.error(err);
      process.exit(1);
    });
};

const OK = checkArgs();
if (OK) run();
