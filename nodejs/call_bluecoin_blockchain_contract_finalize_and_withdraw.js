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
    'assetTransferSuccess'
  ],
});

const {
  paymentsAddr,
  confirmationBlock,
  pvk,
  operatorSig,
  paymentId,
  rpcUrl,
  assetTransferSuccess,
} = argv;

const checkArgs = () => {
  const OK = (
    paymentsAddr && confirmationBlock && pvk && operatorSig && paymentId && rpcUrl && assetTransferSuccess
    );
    if (!OK) {
      console.log(`
      ---------------
      Function: calls NativePayments blockchain smart contract method 'finalizeAndWithdraw'
      Usage Example: 
      node call_bluecoin_blockchain_contract_finalize_and_withdraw.js --pvk 'd2827f4c3778758eb510a5c7cf816c1de83c5e446bfc8e8d' --paymentId '0x67e536c83928dec5ae68b1cb7bd55c4d22e7252a92d588944839aba7675d40f7'  --operatorSig '0xddbfc28a5d8b4e67af13099a1f5c7d0e2c11b0d1350ade51bb5b8abe2254cb5932a582521a6127e5aaad0eff9fab4bb04a3ac226ecb5605b669edb9a01a5fdc11b' --confirmationBlock 8 --paymentsAddr '0xe1bfcc5fA429c84f73C684728549A15105C74970' --rpcUrl 'https://matic-mumbai.chainstacklabs.com' --assetTransferSuccess true
      ---------------
      
      params:
      * pvk: the private key of the seller
      * operatorSig: signature that FV issues that allows the seller address to call the contract method finalizeAndWithdraw returned by the cashout mutation
      * paymentId: id returned by the cashout mutation
      * assetTransferSuccess: boolean returned by cashout mutation
      * paymentsAddr: the address of the smart contract that acts as escrow returned by allSupportedCryptocurrencies query
      * confirmationBlock: number of blocks to wait after tx hash has been mined to consider it as confirmed returned by allSupportedCryptocurrencies query
      `);
    }
    return OK;
  };
  let isConfirmed = false;
  
  const _onConfirmationHandler = (confirmationNumber) => {
    if (confirmationNumber >= confirmationBlock && !isConfirmed) {
      console.log("Tx confirmed on ", confirmationBlock)
      isConfirmed = true;
    }
  };

  const _onReceiptHandler = (receipt) => {
    console.log("Receipt received:", JSON.stringify(receipt))
    process.exit(1)
  };
  
  const run = async () => {
  /* Note: before running this transaction a call to the mutation cashout must be done
  to collect the results from it, which are needed to generate the input for this transaction.
  Mutation Cashout returns:
    {
      signature: String! // Our operatorSig that will allow the seller to withdraw the funds
      paymentId: String! // Our paymentId
      assetTransferSuccess: Boolean! //Our assetTransferSuccess
    }
  */ 
  
  const eth = new Eth(rpcUrl);
  const sellerAccount = identity.accountFromPrivateKey(pvk);
  eth.accounts.wallet.add(pvk) // Only needed because we are not using metamask or another provider that holds the pvk of the sender
  
  const paymentsInstance = new NativeCryptoPayments({ paymentsAddr, eth, confirmationBlock })

  const assetTransferData = {
    paymentId,
    wasSuccessful: assetTransferSuccess,
  };
  
  paymentsInstance.finalizeAndWithdraw({ assetTransferData, signature: operatorSig, from: sellerAccount.address })
  .once('receipt', _onReceiptHandler)
  .on('confirmation', _onConfirmationHandler)
  .on('error', (err) => {
    console.error(err);
    process.exit(1)
  });
};

const OK = checkArgs();
if (OK) run();