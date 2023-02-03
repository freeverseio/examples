import {
    Client,
    PrivateKey,
    ContractCreateFlow,
    ContractFunctionParameters,
    AccountId, ContractExecuteTransaction, Hbar,
} from '@hashgraph/sdk';

import abi from 'web3-eth-abi';
import utils from 'web3-utils';

import * as fs from 'fs';

const net = 'TESTNET';

function setClient(client, netConfig) {
    client.setOperator(
        AccountId.fromString(netConfig.GASPAYER_ID),
        PrivateKey.fromString(netConfig.GASPAYER_Ed25519_PK),
    );
}

function setNetConfig() {
    let netConfig;
    let client;
    if (net === 'TESTNET') {
        console.log('Network: TESTNET');
        netConfig = JSON.parse(fs.readFileSync('.env.testnet.json'));
        client = Client.forTestnet();
    } else if (net === 'PREVIEWNET') {
        console.log('Network: PREVIEWNET');
        netConfig = JSON.parse(fs.readFileSync('.env.preview.json'));
        client = Client.forPreviewnet();
    } else {
        throw new Error('Network choice error');
    }
    return { client, netConfig };
}

const { client, netConfig } = setNetConfig();
setClient(client, netConfig);

const companyEthAddress = netConfig.COMPANY_ETH_ADDRESS;
const txRelayerEthAddress = netConfig.TX_RELAYER_ETH_ADDRESS;
const deployer = AccountId.fromString(netConfig.GASPAYER_ID).toSolidityAddress();
const superUserEthAddress = netConfig.SUPERUSER_ETH_ADDRESS;
const universesRelayerEthAddress = netConfig.UNIVERSES_RELAYER_ETH_ADDRESS;
const trustedPartyEthAddress = netConfig.TRUSTED_PARTY;

const blackholeID = netConfig.BLACKHOLE_ID;

const owners = {
    universesRelayer: universesRelayerEthAddress,
    txRelayer: txRelayerEthAddress,
    company: companyEthAddress,
    superuser: superUserEthAddress,
    trustedParties: [trustedPartyEthAddress]
}

const STAKE_AMOUNT_WEI = 2000000000000000;
const TO_WEI = 10000000000;

/**
 * Deploys the contract to Hedera by first creating a file containing the bytecode, then creating a contract from the resulting
 * FileId, specifying a parameter value for the constructor and returning the resulting ContractId
 */
async function deployContract(name, bytecodePath, constructorParams) {
    console.log(`\nDeploying ${name} contract`);

    const contractByteCode = JSON.parse(fs.readFileSync(bytecodePath)).bytecode;

    // Create the transaction
    const contractCreate = new ContractCreateFlow()
        .setGas(10000000)
        .setBytecode(contractByteCode)
        .setConstructorParameters(constructorParams);

    // Sign the transaction with the client operator key and submit to a Hedera network
    const txResponse = await contractCreate.execute(client);

    // Get the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);
    console.log(`${receipt.status} contract id: ${receipt.contractId} contract address: ${receipt.contractId.toSolidityAddress()}\n`);

    return receipt;
}

/**
 * Calls the specified method of a contract already deployed on the Hedera Network. Method parameters must be passed
 * using the `new ContractFunctionParameters()` function.
 */
async function callContractMethod(contractId, methodName, methodParameters) {
    const contractExecuteTx = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction(methodName, methodParameters)
        .setMaxTransactionFee(new Hbar(1))

    const contractExecuteSubmit = await contractExecuteTx.execute(client);
    const contractExecuteRx = await contractExecuteSubmit.getReceipt(client);
    console.log(`- Contract method call ${methodName} status: ${contractExecuteRx.status} \n`);

    return contractExecuteSubmit.transactionId;
}


async function deployAll() {

    console.log("...storage deploy");
    const sto = await deployContract(
        'Storage',
        '../truffle-core/build/contracts/Storage.json',
        new ContractFunctionParameters()
            .addAddress(deployer)
            .addAddress(deployer),
    );
    console.log(sto.contractId.toSolidityAddress())

    console.log("...setChallengeWindowNextVerses");
    const challengeWindow = 100;
    await callContractMethod(
        sto.contractId,
        "setChallengeWindowNextVerses",
        new ContractFunctionParameters()
            .addUint256(challengeWindow),
        );

    console.log("...setLevelsPerChallengeNextVerses");
    await callContractMethod(
        sto.contractId,
        "setLevelsPerChallengeNextVerses",
        new ContractFunctionParameters()
            .addUint8(100),
        );

    console.log("...challenge libs: ChallengeLibFreeze");
    const chalib1 = await deployContract(
        'ChallengeLibFreeze',
        '../truffle-core/build/contracts/ChallengeLibFreeze.json',
        new ContractFunctionParameters()
    );

    console.log("...challenge libs: ChallengeLibComplete");
    const chalib2 = await deployContract(
        'ChallengeLibComplete',
        '../truffle-core/build/contracts/ChallengeLibComplete.json',
        new ContractFunctionParameters()
    );

    console.log("...challenge libs: ChallengeLibBuyNow");
    const chalib3 = await deployContract(
        'ChallengeLibBuyNow',
        '../truffle-core/build/contracts/ChallengeLibBuyNow.json',
        new ContractFunctionParameters()
    );

    console.log("...stakers deploy");
    const stakers = await deployContract(
        'Stakers',
        '../truffle-core/build/contracts/Stakers.json',
        new ContractFunctionParameters()
            .addAddress(sto.contractId.toSolidityAddress())
            .addUint256(STAKE_AMOUNT_WEI)
            .addUint256(TO_WEI)
    );

    console.log("...setStakers");
    await callContractMethod(
        sto.contractId,
        "setStakers",
        new ContractFunctionParameters()
            .addAddress(stakers.contractId.toSolidityAddress()),
        );

    console.log("...requiredStake");
    await callContractMethod(
        stakers.contractId,
        "requiredStake",
        new ContractFunctionParameters()
        );

    console.log("...writer deploy (needs to be after stakers, because it configures with stakers.address from storage)");
    const writer = await deployContract(
        'Writer',
        '../truffle-core/build/contracts/Writer.json',
        new ContractFunctionParameters()
            .addAddress(sto.contractId.toSolidityAddress())
    );

    console.log("...set writer address in storage");
    await callContractMethod(
        sto.contractId,
        "setWriter",
        new ContractFunctionParameters()
            .addAddress(writer.contractId.toSolidityAddress())
    );

    console.log("...addClaim for blackholeId");
    await callContractMethod(
        sto.contractId,
        "addClaim",
        new ContractFunctionParameters()
    );

    console.log("...set blackholeId");
    await callContractMethod(
        writer.contractId,
        "setClaim",
        new ContractFunctionParameters()
        .addUint256(0)
        .addUint256(0)
        .addUint256(blackholeID)
        .addString('blackholeID')
    );

    console.log("...info)");
    const info = await deployContract(
        'Info',
        '../truffle-core/build/contracts/Info.json',
        new ContractFunctionParameters()
            .addAddress(sto.contractId.toSolidityAddress())
    );

    console.log("...certifier)");
    const certifier = await deployContract(
        'Certifier',
        '../truffle-core/build/contracts/Certifier.json',
        new ContractFunctionParameters()
            .addAddress(info.contractId.toSolidityAddress())
            .addAddress(sto.contractId.toSolidityAddress())
    );


    console.log("...blackholeId)");
    const blackholeId = await deployContract(
        'BlackholeId',
        '../truffle-core/build/contracts/BlackholeId.json',
        new ContractFunctionParameters()
            .addAddress(sto.contractId.toSolidityAddress())
    );

    console.log("...updates)");
    const updates = await deployContract(
        'Updates',
        '../truffle-core/build/contracts/Updates.json',
        new ContractFunctionParameters()
            .addAddress(sto.contractId.toSolidityAddress())
            .addAddress(writer.contractId.toSolidityAddress())
            .addAddress(info.contractId.toSolidityAddress())
            .addAddress(blackholeId.contractId.toSolidityAddress())
    );

    console.log("...challenges)");
    const challenges = await deployContract(
        'Challenges',
        '../truffle-core/build/contracts/Challenges.json',
        new ContractFunctionParameters()
            .addAddress(sto.contractId.toSolidityAddress())
            .addAddress(chalib1.contractId.toSolidityAddress())
            .addAddress(chalib2.contractId.toSolidityAddress())
            .addAddress(chalib3.contractId.toSolidityAddress())
            .addAddress(info.contractId.toSolidityAddress())
            .addAddress(writer.contractId.toSolidityAddress())
            .addAddress(blackholeId.contractId.toSolidityAddress())
    );

    console.log("...setUpdatesAndChallenges");
    await callContractMethod(
        writer.contractId,
        "setUpdatesAndChallenges",
        new ContractFunctionParameters()
            .addAddress(updates.contractId.toSolidityAddress())
            .addAddress(challenges.contractId.toSolidityAddress())
    );

    console.log("...assetExport and ERC721");
    const erc721 = await deployContract(
        'ERC721FV',
        '../truffle-core/build/contracts/ERC721FV.json',
        new ContractFunctionParameters()
            .addString("Freeverse")
            .addString("FV")
    );

    console.log("...setExternalNFTContract");
    await callContractMethod(
        sto.contractId,
        "setExternalNFTContract",
        new ContractFunctionParameters()
            .addAddress(erc721.contractId.toSolidityAddress())
    );


    console.log("...assetExport deploy");
    const assetExport = await deployContract(
        'AssetExport',
        '../truffle-core/build/contracts/AssetExport.json',
        new ContractFunctionParameters()
            .addAddress(sto.contractId.toSolidityAddress())
            .addAddress(info.contractId.toSolidityAddress())
    );


    console.log("...transferOwnership");
    await callContractMethod(
        erc721.contractId,
        "transferOwnership",
        new ContractFunctionParameters()
            .addAddress(assetExport.contractId.toSolidityAddress())
    );


    console.log("Storage contract deployed at: " + sto.contractId.toSolidityAddress());
    console.log("Writing to Directory...");
    const namesAndAddresses = buildNameAndAddresses(sto, writer, updates, stakers, challenges, chalib1, chalib2, chalib3, info, assetExport, erc721, certifier, blackholeId);
    const {0: names, 1: namesBytes32, 2: addresses} = splitNamesAndAdresses(namesAndAddresses);
    const directory = await deployContract(
        'Directory',
        '../truffle-core/build/contracts/Directory.json',
        new ContractFunctionParameters()
            .addBytes32Array(namesBytes32)
            .addAddressArray(addresses)
    );

    console.log("...FINAL ATOMIC STEP: UPGRADE STORAGE..");
    const tx = await callContractMethod(
        sto.contractId,
        "upgrade",
        new ContractFunctionParameters()
            .addAddress(writer.contractId.toSolidityAddress())
            .addAddress(assetExport.contractId.toSolidityAddress())
            .addAddress(directory.contractId.toSolidityAddress())
    );
    console.log(`STORAGE CONTRACT UPGRADE TX:  ${tx} \n`);

    console.log("Adding stakers");
    for (let trustedParty of owners.trustedParties) {
        await callContractMethod(
            stakers.contractId,
            "addTrustedParty",
            new ContractFunctionParameters()
                .addAddress(trustedParty)
        );
    }

    console.log("Setting final ownerships, up to acceptance by company...");
    console.log("...setUniversesRelayer");
    await callContractMethod(
        sto.contractId,
        "setUniversesRelayer",
        new ContractFunctionParameters()
            .addAddress(owners.universesRelayer)
    );

    console.log("...setTxRelayer");
    await callContractMethod(
        sto.contractId,
        "setTxRelayer",
        new ContractFunctionParameters()
            .addAddress(owners.txRelayer)
    );

    console.log("...proposeCompany");
    await callContractMethod(
        sto.contractId,
        "proposeCompany",
        new ContractFunctionParameters()
            .addAddress(owners.company)
    );

    console.log("...setSuperUser");
    await callContractMethod(
        sto.contractId,
        "setSuperUser",
        new ContractFunctionParameters()
            .addAddress(owners.superuser)
    );

    // Print Summary to Console
    console.log("");
    console.log("----------- Main STORAGE address: " + sto.contractId.toSolidityAddress());
    console.log("----------- Other addressess: -----------");
    console.log(namesAndAddresses);
    console.log("-----------------------------------------");

    return [sto, writer, updates, challenges, chalib1, chalib2, chalib3, stakers, directory, info, erc721, assetExport, certifier, blackholeId];

}

const buildNameAndAddresses = (sto, writer, updates, stakers, challenges, chalib1, chalib2, chalib3, info, assetExport, erc721, certifier, blackholeId) => {
    return [
        ["STORAGE", sto.contractId.toSolidityAddress()],
        ["WRITER", writer.contractId.toSolidityAddress()],
        ["UPDATES", updates.contractId.toSolidityAddress()],
        ["STAKERS", stakers.contractId.toSolidityAddress()],
        ["CHALLENGES", challenges.contractId.toSolidityAddress()],
        ["CHALLENGESLIBPART1", chalib1.contractId.toSolidityAddress()],
        ["CHALLENGESLIBPART2", chalib2.contractId.toSolidityAddress()],
        ["CHALLENGESLIBPART3", chalib3.contractId.toSolidityAddress()],
        ["INFO", info.contractId.toSolidityAddress()],
        ["ASSETEXPORT", assetExport.contractId.toSolidityAddress()],
        ["ERC721", erc721.contractId.toSolidityAddress()],
        ["CERTIFIER", certifier.contractId.toSolidityAddress()],
        ["BLACKHOLEID", blackholeId.contractId.toSolidityAddress()],
    ];
}

const splitNamesAndAdresses = (namesAndAddresses) => {
    const names = [];
    const namesBytes32 = [];
    const addresses = [];
    for (let c = 0; c < namesAndAddresses.length; c++) {
        names.push(namesAndAddresses[c][0]);
        const nameHex = utils.utf8ToHex(namesAndAddresses[c][0]);
        const nameBytes32HexStr = abi.encodeParameter("bytes32", nameHex);
        const nameByteArray = Buffer.from(nameBytes32HexStr.slice(2), 'hex');
        namesBytes32.push(nameByteArray);
        addresses.push(namesAndAddresses[c][1]);
    }
    return [names, namesBytes32, addresses];
}

deployAll();
