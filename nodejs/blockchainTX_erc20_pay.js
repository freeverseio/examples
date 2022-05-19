/* eslint-disable no-console */

const Eth = require('web3-eth');

const identity = require('freeverse-crypto-js');
const { ERC20Payments } = require('freeverse-marketsigner-js');
const argv = require('minimist')(process.argv.slice(2), {
  string: [
    'paymentsAddr',
    'confirmationBlocks',
    'pvk',
    'operatorSig',
    'paymentId',
    'price',
    'feeBPS',
    'universeId',
    'deadline',
    'seller',
    'rpcUrl',
    'erc20Addr',
  ],
});
const { testingProvider } = require('./utils/testingProvider');

const {
  paymentsAddr,
  confirmationBlocks,
  pvk,
  operatorSig,
  paymentId,
  price,
  feeBPS,
  universeId,
  deadline,
  seller,
  rpcUrl,
  chainId,
  erc20Addr,
} = argv;

const checkArgs = () => {
  const OK = (
    paymentsAddr && confirmationBlocks && pvk && operatorSig && paymentId
    && price && feeBPS && universeId && deadline && seller && rpcUrl && chainId && erc20Addr
  );
  if (!OK) {
    console.log(`
      ---------------
      Function: calls ERC20Payments blockchain smart contract method 'pay'
      Usage Example: 
      node blockchainTX_erc20_pay.js --pvk 'd2827f4c3778758eb51719a698464aaffd10a5c7cf816c1de83c5e446bfc8e8d' --deadline '1651048702' --feeBPS '50' --paymentId '0x67e536c83928dec5ae68b1cb7bd55c4d22e7252a92d588944839aba7675d40f7'  --operatorSig '0xddbfc28a5d8b4e67af13099a1f5c7d0e2c11b0d1350ade51bb5b8abe2254cb5932a582521a6127e5aaad0eff9fab4bb04a3ac226ecb5605b669edb9a01a5fdc11b' --price '10' --seller '0x65bf60D431AB6aBd96F4a4Ef32C106d6B5761C27' --universeId '0' --paymentsAddr '0xe1bfcc5fA429c84f73C684728549A15105C74970' --confirmationBlocks 8 --erc20Addr '0x83Bf599aA9C55Be2B665d8d782dc9c2188077dd5' --rpcUrl 'https://matic-mumbai.chainstacklabs.com' --chainId 80001
    ---------------
    
    params:
    * pvk: the private key of the buyer

    params related to the blockchain where the escrow contract is deployed:
    * rpcUrl: the url of a (public) node of that blockchain
    * chainId: the chainId of the blockchain
    * paymentsAddr: the address of the smart contract that acts as escrow
    * erc20Addr: the address of the ERC20 smart contract from which the escrow accepts payments
    * confirmationBlocks: number of blocks that the provider waits after tx hash has been mined to call the onConfirmed method
  
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

const onConfirmationHandler = (confirmationNumber) => {
  if (confirmationNumber >= confirmationBlocks) {
    console.log('Tx confirmed on ', confirmationBlocks);
  }
};

const onReceiptHandler = (receipt) => {
  console.log('Receipt received:', JSON.stringify(receipt));
  process.exit(1);
};

/*
Note 1: this example allows a payment in crypto directly to the Layer 1 escrow contract.
The input params to this TX are obtained from the return of the mutation createBuynowPayment.
For more info, see create_buy_now_payment.js
Note 2: Before starting to execute payments, must have allowed this escrow contract to operate
with its ERC20 tokens via the ERC20 approve method. For ease of use, this can also be done
via the approve & approveInfinite methods provided by the ERC20Payments class instantiated below.
*/

const run = async () => {
  // For this example, we need to set up our own provider.
  // In general, use your standard web3 provider.
  const eth = new Eth(testingProvider(pvk, rpcUrl, chainId));

  // This is the class allows interaction with the blockchain contract
  const paymentsInstance = new ERC20Payments({
    paymentsAddr, eth, confirmationBlocks, erc20Addr,
  });

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
};

const OK = checkArgs();
if (OK) run();
