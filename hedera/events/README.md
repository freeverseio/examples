Examples scripts for adding and getting events from Hedera

### Deploy contract to Hedera

First you need to deploy the contract wich emits events

```sh
# Compile contract
cd contract && docker run --rm -v $(pwd):/root ethereum/solc:0.8.0 --bin --abi /root/Greeter.sol -o /root/build

# Deploy contract
cd contract && node deploy
```
### JS

Hedera SDK: is used for interacting to the contract => set a new greet

Useful commands:
```sh
cd js && npm ci
cd js && node greet.js # print greet() and try to get events
cd js && node greet.js --add=some-awesome-greet # set a new greet and emit event
```

### Go

It is used for reading events.

```sh
cd go && go run main.go # read events from contract
```

### Curl request to RPC public node for getting events
```sh
curl https://testnet.hashio.io/api -X POST --header 'Content-Type: application/json' --data '{"jsonrpc":"2.0","method":"eth_getLogs","params":[{"address":"0000000000000000000000000000000002e0d967"}],"id":0}' | jq
```