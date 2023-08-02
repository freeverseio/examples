// This example executes a transfer of DOT from Polkadot to xcDOT on Moonbeam
// The origin address is an sr25519 Polkadot account (must have some DOT to work)
// The target address is an ECDSA Ethereum account on Moonbeam
// Set you private keys for source/target accounts in .env, in json format: 
// {
//   "Polkadot_privateKey": "0x5be...1dce",
//   "Moonbeam_privateKey": "6257...b8692"
// }

const { Sdk } = require('@moonbeam-network/xcm-sdk');
const { Keyring } = require('@polkadot/api');
const { cryptoWaitReady, addressEq } = require('@polkadot/util-crypto');
const { ethers } = require('ethers');

// Read private keys
const fs = require('fs');
const env = JSON.parse(fs.readFileSync('.env'));
const polka_privateKey = env.Polkadot_privateKey;
const moon_privateKey = env.Moonbeam_privateKey;

const fromPolkadot = async() => {
  // Create Polkadot signer with sr25519 account
  await cryptoWaitReady();
  const keyring = new Keyring({
    ss58Format: 0,
    type: 'sr25519',
  });
  const pair = keyring.createFromUri(polka_privateKey);

  // Create Eth signer with ECDSA account
  const provider = new ethers.providers.WebSocketProvider(
    'wss://wss.api.moonbeam.network', 
    {
      chainId: 1284,
      name: 'moonbeam',
    }
  );
  const ethersSigner = new ethers.Wallet(moon_privateKey, provider);
  

  // These are the Polkadot/Ether from/to addresses, respectively:
  const polkaAddr = pair.address;
  const moonAddr = ethersSigner.address;

  // Build the Data object that will allow transfers and swaps
  // Although we pass both signers to it,
  // the Eth signer would only needed in case of swaps,
  // and hence it is not used in this example.
  const data = await Sdk().getTransferData({
    destinationAddress: ethersSigner.address,
    destinationKeyOrChain: 'moonbeam',
    ethersSigner,
    keyOrAsset: 'dot',
    polkadotSigner: pair,
    sourceAddress: polkaAddr,
    sourceKeyOrChain: 'polkadot',
  });

  const amount = data.min.toDecimal() * 1;

  console.log(`
  Look for balance of target address in xcDOT contract:
  https://moonscan.io/address/0xffffffff1fcacbd218edc0eba20fc2308c778080#readContract
  `);

  console.log(`
    Sending from ${data.source.chain.name},
    sourceAddr = ${polkaAddr},
    amount: ${amount},
    to Moonbeam addr: ${moonAddr}
  `);

  // Do the actual transfer. 
  const hash = await data.transfer(amount);
  
  // The appearance of the TX on Polkaholic may take about 1 min:
  console.log(`${data.source.chain.name} tx hash: ${hash}`);
  console.log(`https://polkadot.polkaholic.io/tx/${hash}`);
}

fromPolkadot();