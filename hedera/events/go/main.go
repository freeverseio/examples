package main

import (
	"context"
	"fmt"
	"hedera-events-fetcher/contract"
	"log"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/hashgraph/hedera-sdk-go/v2"
)

const (
	contractIDStr = "0.0.48290151"
)

func main() {
	// ethcli, err := ethclient.Dial("https://testnet.hashio.io/api")
	ethcli, err := ethclient.Dial("http://127.0.0.1:7546")
	if err != nil {
		log.Fatal(err)
	}

	contractID, err := hedera.ContractIDFromString(contractIDStr)
	if err != nil {
		log.Fatal(err)
	}
	contractAddr := common.HexToAddress(contractID.ToSolidityAddress())
	_, err = ethcli.ChainID(context.Background())
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("Interacting with contract %s <=> %s\n", contractIDStr, contractAddr)
	c, err := contract.NewContract(contractAddr, ethcli)
	if err != nil {
		log.Fatal(err)
	}

	// just testing I can call the contract
	// currentGreet, err := c.Greet(&bind.CallOpts{From: common.HexToAddress("0x1")}) // From  field is needed, otherwise 0x address is put by default and failed
	// if err != nil {
	// 	log.Fatal(err)
	// }
	// fmt.Println(currentGreet)

	start := uint64(25068755)
	lastBlock, err := ethcli.BlockNumber(context.TODO())
	if err != nil {
		log.Fatal(err)
	}
	result1 := []contract.ContractGreetingSet{}
	result2 := []contract.ContractNUpdates{}
	fmt.Println("Searching for events...")
	for i := start; i < lastBlock; i = i + 500 {
		end := i + 500
		if end > lastBlock {
			end = lastBlock
		}
		fmt.Printf("  from %d to %d\n", i, end)

		iter1, err := c.FilterGreetingSet(&bind.FilterOpts{
			Start: i,
			End:   &end,
		})
		if err != nil {
			log.Fatal(err)
		}
		for iter1.Next() {
			result1 = append(result1, *iter1.Event)
		}

		iter2, err := c.FilterNUpdates(&bind.FilterOpts{
			Start: i,
			End:   &end,
		})
		if err != nil {
			log.Fatal(err)
		}

		for iter2.Next() {
			result2 = append(result2, *iter2.Event)
		}
	}
	fmt.Println("")
	fmt.Println("> GreetingSet events:", len(result1))
	for _, e := range result1 {
		fmt.Println(e.Greeting)
	}

	fmt.Println("")
	fmt.Println("> NUpdates events:", len(result2))
	for _, e := range result2 {
		fmt.Println(e.N)
	}
}
