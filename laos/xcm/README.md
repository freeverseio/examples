# Example for XCM transfer across chains with different account-type support

This example executes a transfer of DOT from Polkadot's relay chain to xcDOT on Moonbeam, using Moonbeam's SDK.

The origin address is an sr25519 Polkadot account (must have some DOT for this example to work).

The target address is an ECDSA Ethereum account on Moonbeam.

Transfers just require the correct signature from the corresponding actors (typically, the sender), which is verified in the corresponding chain where that actor's account lives; by definition, that chain knows how to deal with such signatures.

The example code produces a signer object capable of signing on the Relay chain (for the sender sr25519 DOT account), and another for signing on Moonbeam; the latter is only needed for swaps.


## Running the example

```
$ npm ci
$ node transfer
```

Before running, make sure to set private keys for source/target accounts in a local file named `.env`, in json format: 
```
{
  "Polkadot_privateKey": "0x6ae...1dce",
  "Moonbeam_privateKey": "9257...b8692"
}
```


## References

* Moonbeam SDK: https://docs.moonbeam.network/builders/interoperability/xcm/xcm-sdk/v1/xcm-sdk/

* Living Document for v3 to v2 differences and things to take into account: https://hackmd.io/@alemart/HyjxRZY2s

* Review about XCM: https://docs.moonbeam.network/builders/interoperability/xcm/overview/

* Execution via XCM: https://docs.moonbeam.network/builders/interoperability/xcm/send-execute-xcm/

* Moonbeam product requests: https://request.moonbeam.network/tabs/3-launched

* List of tokens on Moonbeam: https://blockscout.moonbeam.network/tokens

  * xcDOT on Moonbeam address: `0xffffffff1fcacbd218edc0eba20fc2308c778080`
  * xcACA on Moonbeam address: `0xffffffffa922fef94566104a6e5a35a4fcddaa9f`
  * xcsUDF - Moonbeam address: `0xfFfFFFFF52C56A9257bB97f4B2b6F7B2D624ecda`
