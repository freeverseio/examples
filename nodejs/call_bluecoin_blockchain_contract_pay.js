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

const Eth = require('web3-eth');

const { Web3ProviderEngine, PrivateKeyWalletSubprovider, RPCSubprovider } = require('@0x/subproviders');
const { providerUtils } = require('@0x/utils');
const identity = require('freeverse-crypto-js');
const { NativeCryptoPayments } = require('freeverse-marketsigner-js');
const argv = require('minimist')(process.argv.slice(2), {
  string: [
    'paymentsAddr',
    'confirmationBlock',
    'pvk',
    'operatorSig',
    'paymentId',
    'price',
    'feeBPS',
    'universeId',
    'deadline',
    'seller',
    'rpcUrl',
  ],
});

const {
  paymentsAddr,
  confirmationBlock,
  pvk,
  operatorSig,
  paymentId,
  price,
  feeBPS,
  universeId,
  deadline,
  seller,
  rpcUrl,
} = argv;

const checkArgs = () => {
  const OK = (
    paymentsAddr && confirmationBlock && pvk && operatorSig && paymentId
    && price && feeBPS && universeId && deadline && seller && rpcUrl
  );
  if (!OK) {
    console.log(`
      ---------------
      Function: Sends a payment TX to the escrow Smart Contract 
      Usage Example: 
      node call_bluecoin_blockchain_contract_pay.js --pvk 'd2827f4c3778758eb51719a698464aaffd10a5c7cf816c1de83c5e446bfc8e8d' --deadline '1651048702' --feeBPS '50' --paymentId '0x67e536c83928dec5ae68b1cb7bd55c4d22e7252a92d588944839aba7675d40f7'  --operatorSig '0xddbfc28a5d8b4e67af13099a1f5c7d0e2c11b0d1350ade51bb5b8abe2254cb5932a582521a6127e5aaad0eff9fab4bb04a3ac226ecb5605b669edb9a01a5fdc11b' --price '10' --seller '0x65bf60D431AB6aBd96F4a4Ef32C106d6B5761C27' --universeId '0' --paymentsAddr '0xe1bfcc5fA429c84f73C684728549A15105C74970' --confirmationBlock 8 --rpcUrl 'https://matic-net.chainstacklabs.com' --chainId 80001
      ---------------
      
      params:
      * pvk: the private key of the buyer

      params related to the blockchain where the escrow contract is deployed:
      * rpcUrl: the url of a (public) node of that blockchain
      * chainId: the chainId of the blockchain
      * paymentsAddr: the address of the smart contract that acts as escrow
      * confirmationBlock: number of blocks that the provider waits after tx hash has been mined to call the onConfirmed method
    
      params related to the payment transaction, all of them returned when calling the create_buynow_payment mutation
      * paymentId: id that identifies the payment in the escrow contract
      * price: price of the buynow, in lowest possible units of the cryptocurrency accepted by the escrow contract
      * feeBPS: the fee charged to the seller, in basis points (e.g. 250 would correspond to 2.5%)
      * universeId: universeId where this asset belongs
      * deadline: the time in UTC seconds after which the payment will not be accepted by the escrow contract
      * seller: the seller of the asset
      * operatorSig: the signature that FV issues, which certifies all of the params above.
      `);
  }
  return OK;
};
let isConfirmed = false;

const onConfirmationHandler = (confirmationNumber) => {
  if (confirmationNumber >= confirmationBlock && !isConfirmed) {
    console.log('Tx confirmed on ', confirmationBlock);
    isConfirmed = true;
  }
};

const onReceiptHandler = (receipt) => {
  console.log('Receipt received:', JSON.stringify(receipt));
  process.exit(1);
};

const setProvider = () => {
  const mumbai = { rpcUrl: 'https://matic-mumbai.chainstacklabs.com', chainId: 80001 };
  const xdai = { rpcUrl: 'https://rpc.xdaichain.com/', chainId: 100 };
  const net = mumbai;
  const provider = new Web3ProviderEngine();
  provider.addProvider(new PrivateKeyWalletSubprovider(pvk, net.chainId));
  provider.addProvider(new RPCSubprovider(net.rpcUrl, 10000));
  provider.start();
  providerUtils.startProviderEngine(provider);
  return provider;
}

const run = async () => {
  // Note: before doing anything related to asset trading
  // the user's ID needs to be registered.
  // This registration needs to be done only once
  // for a given user's ID.
  // See the link_id_to_email.js examples

  const provider = setProvider();
  const eth = new Eth(provider);

  const paymentsInstance = new NativeCryptoPayments({ paymentsAddr, eth, confirmationBlock });

  const buyerAccount = identity.accountFromPrivateKey(pvk);
  const paymentData = {
    paymentId,
    amount: price.toString(),
    feeBPS: feeBPS.toString(),
    universeId: universeId.toString(),
    deadline: deadline.toString(),
    buyer: buyerAccount.address,
    seller,
  };

  paymentsInstance.pay({ paymentData, signature: operatorSig, from: buyerAccount.address })
    .once('receipt', onReceiptHandler)
    .on('confirmation', onConfirmationHandler)
    .on('error', (err) => {
      console.error(err);
      process.exit(1);
    });
};

const OK = checkArgs();
if (OK) run();

// node call_bluecoin_blockchain_contract_pay.js --pvk 'e2029f020e155378c8e2a82c31c4136a1e9cb46cec367b16004a36e8021ae39c' --deadline '1651048702' --feeBPS '50' --paymentId '0x67e536c83928dec5ae68b1cb7bd55c4d22e7252a92d588944839aba7675d40f7'  --operatorSig '0xddbfc28a5d8b4e67af13099a1f5c7d0e2c11b0d1350ade51bb5b8abe2254cb5932a582521a6127e5aaad0eff9fab4bb04a3ac226ecb5605b669edb9a01a5fdc11b' --price '10' --seller '0x65bf60D431AB6aBd96F4a4Ef32C106d6B5761C27' --universeId '0' --paymentsAddr '0xe1bfcc5fA429c84f73C684728549A15105C74970' --confirmationBlock 8 --rpcUrl 'https://matic-net.chainstacklabs.com'
