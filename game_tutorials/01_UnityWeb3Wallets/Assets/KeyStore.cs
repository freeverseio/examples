using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Nethereum.Signer;
using Nethereum.Hex.HexConvertors.Extensions;
using System.IO;
using Newtonsoft.Json;

// this class is used to store data for JSON serialization
public class KeyPair {
    public string EncryptedPvk;
    public string PublicKey;
    public string Address;

    public KeyPair(string encrypted, string publicKey, string address) {
        EncryptedPvk = encrypted;
        PublicKey = publicKey;
        Address = address;
    }
}

public class KeyStore : MonoBehaviour
{
    void Start()
    {
        if (File.Exists(Application.persistentDataPath + "/data.json"))
        {
            LoadKeysFromStore();
        } 
        else 
        {
            CreateAndStoreKeys();
        }
    }

    void CreateAndStoreKeys() 
    {
        // create new wallet, and encrypt the private key
        EthECKey ecKey = EthECKey.GenerateKey();
        string pvk = ecKey.GetPrivateKey();
        string encrypted = AESEncryption.AESEncrypt(pvk, "testPassword");

        // create object with the data we wish to store in JSON format
        KeyPair keyPair = new KeyPair(
            encrypted,
            ecKey.GetPubKey().ToHex(),
            ecKey.GetPublicAddress()
        );

        // serialize to JSON, and write to file
        var json = JsonConvert.SerializeObject(keyPair);        
        string jsonFile = Application.persistentDataPath + "/data.json";
        File.WriteAllText(jsonFile, json);

        print("Key created and stored");
    }

    void LoadKeysFromStore()
    {
        //read stored file
        string jsonFile = Application.persistentDataPath + "/data.json";
        string json = File.ReadAllText(jsonFile);

        // deserialize JSON and decrypt to obtain private key
        KeyPair keyPair = JsonConvert.DeserializeObject<KeyPair>(json);
        string decrypted = AESEncryption.AESDecrypt(keyPair.EncryptedPvk, "testPassword");
        
        // print result to console
        print("Original encrypted " + keyPair.EncryptedPvk);
        print("Public Key " + keyPair.PublicKey);
        print("Address " + keyPair.Address);
        print("Private Key " + decrypted);

        print("Key successfully read and decrypted");
    }
}
