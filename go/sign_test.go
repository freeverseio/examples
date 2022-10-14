package sig_test

import (
	"crypto/ecdsa"
	"encoding/hex"
	"fmt"
	"testing"

	"github.com/ethereum/go-ethereum/accounts"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	log "github.com/sirupsen/logrus"
	"golang.org/x/crypto/sha3"
	"gotest.tools/assert"
)

func SignerAddress(hash common.Hash, signature string, wasHashPrefixed bool) (common.Address, error) {
	log.Debugf("getting signer address, signature: %s, hash %s", signature, hash.String())

	sign, err := hex.DecodeString(signature)
	if err != nil {
		return common.Address{}, err
	}
	return AddressFromHashAndSignature(hash, sign, wasHashPrefixed)
}

// Rationale: eip-155.md defines the relationship between the recovery value
// and the last 2 bytes of the signature (the "V" parameter)
// - Before spurious dragon: V = {0,1} + 27
// - After spurious dragon:  V = {0,1} + CHAIN_ID * 2 + 35
// In both cases:
// - 0 becomes an odd value,
// - 1 becomes an even value
// So, above 27, this function converts an odd value back to 0, and an even value back to 1
// This function leaves values below 27 unaffected; such values are obtained,
// as checked empirically, by some HDWallets.
func AddressFromHashAndSignature(hash common.Hash, sign []byte, wasHashPrefixed bool) (common.Address, error) {
	if len(sign) != 65 {
		return common.Address{}, fmt.Errorf("signature must be 65 bytes long")
	}
	if sign[64] >= 27 {
		if sign[64]%2 == 0 {
			sign[64] = 1
		} else {
			sign[64] = 0
		}
	}
	sg := make([]byte, len(sign))
	copy(sg, sign)

	if !wasHashPrefixed {
		hash = common.BytesToHash(accounts.TextHash(hash.Bytes()))
	}
	return addressFromHashAndSignatureFromStandardV(hash.Bytes(), sg)
}

func addressFromHashAndSignatureFromStandardV(hash, signature []byte) (common.Address, error) {
	sigPublicKey, err := crypto.Ecrecover(hash, signature)
	if err != nil {
		return common.Address{}, err
	}
	return publicKeyBytesToAddress(sigPublicKey), nil
}

func publicKeyBytesToAddress(publicKey []byte) common.Address {
	var buf []byte

	hash := sha3.NewLegacyKeccak256()
	hash.Write(publicKey[1:]) // remove EC prefix 04
	buf = hash.Sum(nil)
	address := buf[12:]

	return common.HexToAddress(hex.EncodeToString(address))
}

func RSV(signature string) (r [32]byte, s [32]byte, v uint8, err error) {
	if len(signature) != 132 && len(signature) != 130 {
		return r, s, v, fmt.Errorf("wrong signature length %v", len(signature))
	}
	if len(signature) == 132 {
		signature = signature[2:] // remove 0x
	}
	vect, err := hex.DecodeString(signature[0:64])
	if err != nil {
		return r, s, v, err
	}
	copy(r[:], vect)
	vect, err = hex.DecodeString(signature[64:128])
	if err != nil {
		return r, s, v, err
	}
	copy(s[:], vect)
	vect, err = hex.DecodeString(signature[128:130])
	v = vect[0]
	return r, s, v, err
}

// it receives a digest (a certain hash of the params to be signed), adds the Eth prefix, and signs
func Sign(digest common.Hash, pvr *ecdsa.PrivateKey) ([]byte, error) {
	sig, err := crypto.Sign(accounts.TextHash(digest.Bytes()), pvr)
	if len(sig) != 65 {
		return []byte{}, fmt.Errorf("signature must be 65 bytes long")
	}
	if sig[64] != 0 && sig[64] != 1 {
		return []byte{}, fmt.Errorf("invalid Ethereum signature (V is not 0 or 1)")
	}
	sig[64] += 27
	return sig, err
}

func TestAddressFromHashAndSignatureHDWallet(t *testing.T) {
	// This is a hardcoded case obtained with a real HDWallet. The original data is:
	digest := common.HexToHash("0xf756192bfb1716ebab849f620538f22c7c616bb480a5ba8870ead00f7aa5858f")
	hdWalletSigner := "0x87Aa6c5Ed4372075ba8678da60e7f6068abb53b0"
	hdWalletSignature := "d30c54612031f8e3ab7e9cb0edab159ddcc744ca0f10bdcdc0c7c9ae91606aed7c08ecab10f0a509d2fc09e73930d0798db3d511011d501b89afc74d2d05f85b01"

	// The following 3 signatures should be valid, since they all correspond to recovery value = 1 (1c = hex(28), 24 = hex(36)
	hdWalletSignatures := []string{
		hdWalletSignature,
		"d30c54612031f8e3ab7e9cb0edab159ddcc744ca0f10bdcdc0c7c9ae91606aed7c08ecab10f0a509d2fc09e73930d0798db3d511011d501b89afc74d2d05f85b1c",
		"d30c54612031f8e3ab7e9cb0edab159ddcc744ca0f10bdcdc0c7c9ae91606aed7c08ecab10f0a509d2fc09e73930d0798db3d511011d501b89afc74d2d05f85b24",
	}
	for _, sig := range hdWalletSignatures {
		addr, err := AddressFromHashAndSignature(digest, common.Hex2Bytes(sig), false)
		assert.NilError(t, err)
		assert.Equal(t, addr.Hex(), hdWalletSigner)
	}

	// The following 3 signatures should not be valid, since they all correspond to recovery value = 0 (1b = hex(27), 23 = hex(35)
	hdWalletSignatures2 := []string{
		"d30c54612031f8e3ab7e9cb0edab159ddcc744ca0f10bdcdc0c7c9ae91606aed7c08ecab10f0a509d2fc09e73930d0798db3d511011d501b89afc74d2d05f85b00",
		"d30c54612031f8e3ab7e9cb0edab159ddcc744ca0f10bdcdc0c7c9ae91606aed7c08ecab10f0a509d2fc09e73930d0798db3d511011d501b89afc74d2d05f85b1b",
		"d30c54612031f8e3ab7e9cb0edab159ddcc744ca0f10bdcdc0c7c9ae91606aed7c08ecab10f0a509d2fc09e73930d0798db3d511011d501b89afc74d2d05f85b23",
	}
	for _, sig := range hdWalletSignatures2 {
		addr, err := AddressFromHashAndSignature(digest, common.Hex2Bytes(sig), false)
		assert.NilError(t, err)
		assert.Equal(t, addr.Hex() == hdWalletSigner, false)
	}

}
func TestPublicKeyBytesToAddress(t *testing.T) {
	privateKey, err := crypto.HexToECDSA("3B878F7892FBBFA30C8AED1DF317C19B853685E707C2CF0EE1927DC516060A54")
	assert.NilError(t, err)

	publicKey := privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	assert.Equal(t, ok, true)

	s, err := Sign(common.HexToHash("0x1"), privateKey)
	assert.NilError(t, err)

	address, err := AddressFromHashAndSignature(common.HexToHash("0x1"), s, false)
	assert.NilError(t, err)

	assert.Equal(t, address.Hex(), crypto.PubkeyToAddress(*publicKeyECDSA).Hex())
}
func TestSign(t *testing.T) {
	privateKey, err := crypto.HexToECDSA("3B878F7892FBBFA30C8AED1DF317C19B853685E707C2CF0EE1927DC516060A54")
	assert.NilError(t, err)

	s, err := Sign(common.HexToHash("0x1"), privateKey)
	assert.NilError(t, err)
	assert.Equal(t, common.Bytes2Hex(s), "afdc7b5e39bf887ffe14eccfddf6de3ba6d250945b0dfd16c42b415e59c4aafa090dded0c9f5134d28223d2cd0999eb9e5e339ed57b77b0b26ecb9ca09a2237e1c")
}

func TestRSV0(t *testing.T) {
	_, _, _, err := RSV("0x0")
	assert.Error(t, err, "wrong signature length 3")
}

func TestRSV1(t *testing.T) {
	r, s, v, err := RSV("0x405c83733f474f6919032fd41bd2e37b1a3be444bc52380c0e3f4c79ce8245ce229b4b0fe3a9798b5aad5f8df5c6acc07e4810f1a111d7712bf06aee7c7384001b")
	assert.NilError(t, err)
	assert.Equal(t, hex.EncodeToString(r[:]), "405c83733f474f6919032fd41bd2e37b1a3be444bc52380c0e3f4c79ce8245ce")
	assert.Equal(t, hex.EncodeToString(s[:]), "229b4b0fe3a9798b5aad5f8df5c6acc07e4810f1a111d7712bf06aee7c738400")
	assert.Equal(t, v, uint8(0x1b))
}

func TestRSV2(t *testing.T) {
	r, s, v, err := RSV("405c83733f474f6919032fd41bd2e37b1a3be444bc52380c0e3f4c79ce8245ce229b4b0fe3a9798b5aad5f8df5c6acc07e4810f1a111d7712bf06aee7c7384001b")
	assert.NilError(t, err)
	assert.Equal(t, hex.EncodeToString(r[:]), "405c83733f474f6919032fd41bd2e37b1a3be444bc52380c0e3f4c79ce8245ce")
	assert.Equal(t, hex.EncodeToString(s[:]), "229b4b0fe3a9798b5aad5f8df5c6acc07e4810f1a111d7712bf06aee7c738400")
	assert.Equal(t, v, uint8(0x1b))
}
