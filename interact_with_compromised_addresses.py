from web3 import Web3
import time

# Connect to Ethereum node
w3 = Web3(Web3.HTTPProvider('https://polygon-mainnet.g.alchemy.com/v2/YG_ugFP9....oI')) #TODO insert private node ideally with right key

# Check connection
if not w3.isConnected():
    print("Failed to connect to Polygon node.")
    exit()

# Set your account details
account_address = '0xA9c0F76cA045163E28afDdFe035ec76a44f5C1F3' #The account that I will want to use
private_key = 'a98c8730df...be41d718d5fc'
nonce = 482 #TODO change it manually
#nonce = w3.eth.getTransactionCount(account_address)

    
# Define the contract address and hex data
#contract_address = '0xA818cEF865c0868CA4cC494f673FcDaAD6a77cEA'
contract_address = Web3.toChecksumAddress('0x317Fc116E3c524316da9e783eB88099f0397ab2E')
#hex_data = '0x' #In case it's a send
hex_data = '0x419c533cac214e05a660966e03d403623a1b617040d681a63d5b324919ba2f83c95a0c5b00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000118fcbd90113e03a028598d75e77b517a30d44853f9a89a156f375b4dc8e21d0ef91e91a197aad72692b14268d0c266675b7728c3dc8a3dad9baa0be82323027d1b1de5951cb4e9fa50a185a0c35c87fe37bacb6aebffad9d8c6db7669612f17a85c4e695ba6d493bb00419b7336ee8e7867e682b71bc5b65b67fc8179674015dbfb84ca46df20f132bdcf3005fac61f3385c59f0a9cd6ab3784b0ff1a356281be69934775d625ac0aca223bf5c24b84e51da4aa625de03fff17034d66f657de2e1088636198976b978b868c46e827dc7a108e99290b0fd619a8bb7ec673bfb5dd5c53218d406362d4ea14450455aaff321f29afd49e91a57fba284e446cb20486de68fb5ec320dfd176ff16e97d81fcedbaba9e3c9a086bfcd797d28abf0483ddc0c092d25b2c0e6e3271b7072eb0b7a46d1bf6f3cd2eb13735f4c6efc047bf2eec19662f95bfbaa4933f68f299909bf66ea9938ea3243aa8f30c37cb6b1f99a1245db7872557658f09de8df8bb1d3afad9f35df01cd2172df3fe360da664a0520fed7a6891a9409d3342380a2ec6aa4a5c003ac26f0d9fd1665e7844af7d11d429db551e340ba6607d64234512d96f757cb1f45ee9fc38776d1cf90b53e3cab3e3983c3688839512775a7f16b6c814292671b0391f38b921eaf10e5937a9f87a50716bab31dc9bdf244dddd701dc33f24099609c6ac110bec6453505f66ffcd652e1d6a90e686852683a5cc39f6b2c2c01b02659ad382bc766f3c4420c1aa317'

# Set the transaction

transaction = {
    'to': contract_address,
    'value': 0,  # Set value as needed #TODO modify to 0 if interacting with a contract or to something if sending currencies
    'data': hex_data,
    'gas': 500000,  # Estimate this value 21000 for send #TODO modify for contract interactions
    'gasPrice': w3.toWei('250', 'gwei'),  # Estimate this value #TODO modify
    'nonce': nonce,
    'chainId': 137  # Polygon Mainnet Chain ID
}

# Send the transaction in a loop
while True:
    try:
        # Sign the transaction
        print("nonce: ", w3.eth.getTransactionCount(account_address))
        signed_txn = w3.eth.account.signTransaction(transaction, private_key)

        # Send the transaction
        txn_hash = w3.eth.sendRawTransaction(signed_txn.rawTransaction)

        # Check transaction receipt
        receipt = w3.eth.waitForTransactionReceipt(txn_hash, timeout=120)
        if receipt.status == 1:
            print(f"Transaction successful with hash: {txn_hash.hex()}")
            break
        else:
            print("Transaction failed, retrying...")
    except Exception as e:
        print(f"Error: {e}")
        time.sleep(1)  # Wait for 1 second before retrying
