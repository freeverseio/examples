import {
  Client,
  PrivateKey,
  AccountId,
  ContractId,
  ContractExecuteTransaction,
} from '@hashgraph/sdk';

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import Web3 from 'web3';
import minimist from 'minimist';
import Web3HttpProvider from "web3-providers-http"

const client = Client.forTestnet();
const web3 = new Web3();
dotenv.config({ path: '../.env' });

function encodeFunctionCall(functionName, parameters) {
  const abi = JSON.parse(fs.readFileSync("../contract/build/Greeter.abi"));
  const functionAbi = abi.find(
    (func) => func.name === functionName && func.type === 'function',
  );
  const encodedParametersHex = web3.eth.abi
    .encodeFunctionCall(functionAbi, parameters)
    .slice(2);
  return Buffer.from(encodedParametersHex, 'hex');
}

async function addEvent(msg) {
  client.setOperator(
    AccountId.fromString(process.env.OPERATOR_ID),
    PrivateKey.fromString(process.env.OPERATOR_KEY),
  );

  console.log(`\nCalling set_message with '${msg}' parameter value`);

  // generate function call with function name and parameters
  const functionCallAsUint8Array = encodeFunctionCall('setGreeting', [msg]);

  // execute the transaction calling the set_message contract function
  const transaction = await new ContractExecuteTransaction()
    .setContractId(process.env.CONTRACT_ID)
    .setFunctionParameters(functionCallAsUint8Array)
    .setGas(100000)
    .execute(client);

  // get the receipt for the transaction
  await transaction.getReceipt(client);
}

async function main() {
  const contractAddress = ContractId.fromString(
    process.env.CONTRACT_ID
  ).toSolidityAddress(); 
  console.log(
    `Interacting with contract ${process.env.CONTRACT_ID} <=> ${contractAddress}`
  );


  const args = minimist(process.argv.slice(2));
  if (args.add) {
    await addEvent(args.add);
    return;
  }

  const abi = await JSON.parse(fs.readFileSync("../contract/build/Greeter.abi"));
  const web3 = new Web3(new Web3HttpProvider("http://127.0.0.1:7546"));
  // const web3 = new Web3(new Web3HttpProvider("https://testnet.hashio.io/api"));
  const greeter = new web3.eth.Contract(
    abi,
    contractAddress
  );
  // console.log("greet():", await greeter.methods.greet().call())

  const eventsGreetingSet = await greeter.getPastEvents("GreetingSet");
  console.log("GreetingSet events:", eventsGreetingSet);
  const eventsNUpdates = await greeter.getPastEvents("NUpdates");
  console.log("NUpdates events:", eventsNUpdates);
}
main();
