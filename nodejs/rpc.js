/* eslint-disable no-console */
const Web3 = require('web3-eth');
const BN = require('bn.js');
const fs = require('fs');
const artifact = require('./utils/IERC721Metadata.json');

// Write the node rpc url in the file .node_rpc_url:
const nodeRpcURL = JSON.parse(fs.readFileSync('.node_rpc_url'));
const web3 = new Web3(nodeRpcURL['rpc-url']);

const main = async () => {
  const chainId = await web3.getChainId();
  console.log('chain id:', chainId);

  const blockNumber = await web3.getBlockNumber();
  console.log('blockNumber:', blockNumber);

  const address = '0x844cd985aef87f58bc3ec8e88a07ffb1a54bef46';
  const balance = await web3.getBalance(address);
  console.log(`balance(${address}):`, balance);

  const contract = new web3.Contract(artifact.abi, '0x92698ed3E383c8D808FAe159a3848Aa88cCC4FB1');

  const id = new BN('3546072660871964413345957628868962292360549838997');
  console.log(`\n${id}`);
  const owner = await contract.methods.ownerOf(id).call();
  console.log('=> ownerOf:', owner);
  const tokenURI = await contract.methods.tokenURI(id).call();
  console.log('=> tokenURI:', tokenURI);
};
main();
