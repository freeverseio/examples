require("dotenv").config();
const {
  AccountId,
  PrivateKey,
  Client,
  ContractFunctionParameters,
  ContractCreateFlow,
} = require("@hashgraph/sdk");

// Configure accounts and client
const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_PVKEY);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

const company = "0xA9c0F76cA045163E28afDdFe035ec76a44f5C1F3";
const superUser = "0xA9c0F76cA045163E28afDdFe035ec76a44f5C1F3";

async function main() {
  const storageAddress = await deployContract(
    require("../truffle-core/build/contracts/Storage.json"),
    new ContractFunctionParameters().addAddress(company).addAddress(superUser),
  );

  await deployContract(require("../truffle-core/build/contracts/ChallengeLibFreeze.json"));
  await deployContract(require("../truffle-core/build/contracts/ChallengeLibComplete.json"));
  await deployContract(require("../truffle-core/build/contracts/ChallengeLibBuyNow.json"));

  await deployContract(
    require("../truffle-core/build/contracts/Stakers.json"),
    new ContractFunctionParameters().addAddress(storageAddress).addInt256(2000000000000000),
  );
}

const deployContract = async (contract, params) => {
  process.stdout.write(`deploy contract ${contract.contractName}... `);
  const tx = new ContractCreateFlow()
    .setGas(600000)
    .setBytecode(contract.bytecode)
    .setConstructorParameters(params);
  const response = await tx.execute(client);
  const receipt = await response.getReceipt(client);
  console.log(`${receipt.status} addr: ${receipt.contractId.toSolidityAddress()}`);
  return receipt.contractId.toSolidityAddress();
}

main();
