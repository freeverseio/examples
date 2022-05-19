/* eslint-disable max-len */
/* eslint-disable no-console */

/*
PAYS FOR AN ASSET IN A GIVEN NATIVE CRYPTOCURRENCY
Note 1: this example allows a payment in crypto directly to the Layer 1 escrow contract.
  The input params to this TX are obtained from the return of the mutation createBuynowPayment.
  For more info, see create_buy_now_payment.js
*/

/*
INPUTS:
* pvk: the private key of the buyer

params related to the payment transaction, all of them returned when calling the create_buynow_payment mutation
* paymentId: id that identifies the payment in the escrow contract
* price: price of the buynow, in lowest possible units of the cryptocurrency accepted by the escrow contract
* feeBPS: the fee charged to the seller, in basis points (e.g. 250 would correspond to 2.5%)
* universeId: universeId where this asset belongs
* deadline: the time in UTC seconds after which the payment will not be accepted by the escrow contract
* seller: the seller of the asset
* operatorSig: the signature that FV issues, which certifies all of the params above.

(only required in for this example)
params related to the blockchain where the escrow contract is deployed:
* rpcUrl: the url of a (public) node of that blockchain
* chainId: the chainId of the blockchain
* paymentsAddr: the address of the smart contract that acts as escrow
* confirmationBlocks: number of blocks that the provider waits after tx hash has been mined to call the onConfirmed method
*/

const pvk = 'd2827f4c3778758eb51719a698464aaffd10a5c7cf816c1de83c5e446bfc8e8d';
const deadline = '1651048702';
const feeBPS = '50';
const paymentId = '0x67e536c83928dec5ae68b1cb7bd55c4d22e7252a92d588944839aba7675d40f7';
const operatorSig = '0xddbfc28a5d8b4e67af13099a1f5c7d0e2c11b0d1350ade51bb5b8abe2254cb5932a582521a6127e5aaad0eff9fab4bb04a3ac226ecb5605b669edb9a01a5fdc11b';
const price = '10';
const seller = '0x65bf60D431AB6aBd96F4a4Ef32C106d6B5761C27';
const universeId = '0';
const paymentsAddr = '0xe1bfcc5fA429c84f73C684728549A15105C74970';
const confirmationBlocks = 8;
const rpcUrl = 'https://matic-mumbai.chainstacklabs.com';
const chainId = 80001;

// Preparing libs and handy functions

const Eth = require('web3-eth');
const identity = require('freeverse-crypto-js');
const { NativeCryptoPayments } = require('freeverse-marketsigner-js');
const { testingProvider } = require('./utils/testingProvider');

const onConfirmationHandler = (confirmationNumber) => {
  if (confirmationNumber >= confirmationBlocks) {
    console.log('Tx confirmed on ', confirmationBlocks);
  }
};

const onReceiptHandler = (receipt) => {
  console.log('Receipt received:', JSON.stringify(receipt));
  process.exit(1);
};

async function run() {
  // For this example, we need to set up our own provider.
  // In general, use your standard web3 provider.
  const eth = new Eth(testingProvider(pvk, rpcUrl, chainId));

  // This is the class allows interaction with the blockchain contract
  const paymentsInstance = new NativeCryptoPayments({ paymentsAddr, eth, confirmationBlocks });

  // The call to the .pay function just requires this struct to be built
  // from the params received in the create_buynow_payment mutation
  const buyerAddr = identity.freeverseIdFromPrivateKey(pvk);
  const paymentData = {
    paymentId,
    amount: price.toString(),
    feeBPS: feeBPS.toString(),
    universeId: universeId.toString(),
    deadline: deadline.toString(),
    buyer: buyerAddr,
    seller,
  };

  // This is the blockchain contract TX sending. Handle events as usual.
  paymentsInstance.pay({ paymentData, signature: operatorSig, from: buyerAddr })
    .once('receipt', onReceiptHandler)
    .on('confirmation', onConfirmationHandler)
    .on('error', (err) => {
      console.error(err);
      process.exit(1);
    });
}

run();
