/* eslint-disable no-console */
// MIT License

const Eth = require('web3-eth');
const identity = require('freeverse-crypto-js');
const { ERC20Payments } = require('freeverse-marketsigner-js');
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
  erc20Addr,
  rpcUrl,
} = argv;

const checkArgs = () => {
  const OK = (
    paymentsAddr && confirmationBlock && pvk && operatorSig && paymentId && price && feeBPS && universeId && deadline && seller && erc20Addr && rpcUrl
    );
    if (!OK) {
      console.log(`
      ---------------
      Function: calls ERC20Payments blockchain smart contract method 'pay'
      Usage Example: 
      node blockchainTX_erc20_pay.js --pvk 'd2827f4c3778758eb51719a698464aaffd10a5c7cf816c1de83c5e446bfc8e8d' --deadline '1651048702' --feeBPS '50' --paymentId '0x67e536c83928dec5ae68b1cb7bd55c4d22e7252a92d588944839aba7675d40f7'  --operatorSig '0xddbfc28a5d8b4e67af13099a1f5c7d0e2c11b0d1350ade51bb5b8abe2254cb5932a582521a6127e5aaad0eff9fab4bb04a3ac226ecb5605b669edb9a01a5fdc11b' --price '10' --seller '0x65bf60D431AB6aBd96F4a4Ef32C106d6B5761C27' --universeId '0' --paymentsAddr '0xe1bfcc5fA429c84f73C684728549A15105C74970' --confirmationBlock 8 --erc20Addr '0xe1bfcc5fA429c84f73C68412349A15105C74970' --rpcUrl 'https://matic-mumbai.chainstacklabs.com'
    ---------------
    
    params:
    * pvk: the private key of the buyer
    * paymentsAddr: the address of the smart contract that acts as escrow
    * erc20Addr: the address of the ERC20 Token contract
    * confirmationBlock: number of blocks to wait after tx hash has been mined to consider it as confirmed
    * operatorSig: signature that FV issues that allows the buyer address to call the contract method pay returned by the create_buynow_payment mutation
    * paymentId: id returned by the create_buynow_payment mutation
    * price: price returned by the create_buynow_payment mutation
    * feeBPS: feeBPS returned by the create_buynow_payment mutation
    * universeId: universeId returned by the create_buynow_payment mutation
    * deadline: returned by create_buynow_payment mutation
    * seller: returned by create_buynow_payment mutation
    * rpcUrl: url of the network node to use as web3 eth provider
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

/*
Note: this example allows a payment in crypto directly to the Layer 1 escrow contract.
The input params to this TX are obtained from the return of the mutation createBuynowPayment.
See create_buy_now_payment.js
*/
const run = async () => {
  // Note: before doing anything related to asset trading
  // the user's ID needs to be registered.
  // This registration needs to be done only once
  // for a given user's ID.
  // See the link_id_to_email.js examples
  
  const eth = new Eth(rpcUrl);
  const buyerAccount = identity.accountFromPrivateKey(pvk);
  eth.accounts.wallet.add(pvk) // Only needed because we are not using metamask or another provider that holds the pvk of the sender


  const paymentsInstance = new ERC20Payments({ paymentsAddr, eth, confirmationBlock, erc20Addr })

  const paymentData = {
    paymentId,
    amount: price.toString(),
    feeBPS: feeBPS.toString(),
    universeId: universeId.toString(),
    deadline: deadline.toString(),
    buyer: buyerAccount.address,
    seller: seller,
  };
  
  paymentsInstance.pay({ paymentData, signature: operatorSig, from: buyerAccount.address })
  .once('receipt', _onReceiptHandler)
  .on('confirmation', _onConfirmationHandler)
  .on('error', (err) => {
    console.error(err);
    process.exit(1)
  });
};

const OK = checkArgs();
if (OK) run();
