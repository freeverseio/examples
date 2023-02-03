/*-
 *
 * Smart Contracts Libs Labs
 *
 * Copyright (C) 2019 - 2021 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import {
  Client,
  PrivateKey,
  ContractCreateTransaction,
  FileCreateTransaction,
  AccountId,
  Hbar,
} from "@hashgraph/sdk";

import * as dotenv from "dotenv";
import * as fs from "fs";
import Web3 from "web3";

dotenv.config({ path: "../.env" });

let client = Client.forTestnet();
const constructMessage = "Hello Hedera";
const web3 = new Web3();

/**
 * Runs each step of the example one after the other
 */
async function main() {
  client.setOperator(
    AccountId.fromString(process.env.OPERATOR_ID),
    PrivateKey.fromString(process.env.OPERATOR_KEY)
  );

  client.setMaxTransactionFee(new Hbar(5));
  client.setMaxQueryPayment(new Hbar(5));

  // deploy the contract to Hedera from bytecode
  await deployContract();
}

/**
 * Deploys the contract to Hedera by first creating a file containing the bytecode, then creating a contract from the resulting
 * FileId, specifying a parameter value for the constructor and returning the resulting ContractId
 */
async function deployContract() {
  console.log(`\nDeploying the contract...`);

  // Import the compiled contract
  const bytecode = fs.readFileSync("./build/Greeter.bin");

  // Create a file on Hedera which contains the contact bytecode.
  // Note: The contract bytecode **must** be hex encoded, it should not
  // be the actual data the hex represents
  const fileTransactionResponse = await new FileCreateTransaction()
    .setKeys([client.operatorPublicKey])
    .setContents(bytecode)
    .execute(client);

  // Fetch the receipt for transaction that created the file
  const fileReceipt = await fileTransactionResponse.getReceipt(client);

  // The file ID is located on the transaction receipt
  const fileId = fileReceipt.fileId;

  // create constructor parameters from the signature of the constructor + parameter values
  // .slide(2) to remove '0x' from the result
  let constructParameters = web3.eth.abi
    .encodeParameters(["string"], [constructMessage])
    .slice(2);
  // convert to a Uint8Array
  const constructorParametersAsUint8Array = Buffer.from(
    constructParameters,
    "hex"
  );
  // Create the contract
  const contractTransactionResponse = await new ContractCreateTransaction()
    // Set the parameters that should be passed to the contract constructor
    // using the output from the web3.js library
    .setConstructorParameters(constructorParametersAsUint8Array)
    // Set gas to create the contract
    .setGas(100_000)
    // The contract bytecode must be set to the file ID containing the contract bytecode
    .setBytecodeFileId(fileId)
    .execute(client);

  // Fetch the receipt for the transaction that created the contract
  const contractReceipt = await contractTransactionResponse.getReceipt(client);

  // The contract ID is located on the transaction receipt
  const contractId = contractReceipt.contractId;

  console.log(`new contract ID: ${contractId.toString()}`);
  return contractId;
}

void main();
