// ServerManager.cs
using System;
using System.Text;
using System.Collections;
using System.Collections.Generic;
using UnityEngine.Networking;
using UnityEngine;
using System.IO;
using System.Security.Cryptography;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.OpenSsl;
using Org.BouncyCastle.Security;

public class ServerManager : MonoBehaviour
{
    private string SERVER_PUBLIC_KEY = @"-----BEGIN PUBLIC KEY-----
    <pate_server_public_RSA_key_here>
    -----END PUBLIC KEY-----";

    private string USER_EMAIL = "user@server.com";
    private string SALT = "livingassets";
    private string ACTION_CODE = "XYZ500";

    // utility function to convert a byte array to a hex string
    public static string ByteArrayToString(byte[] ba)
    {
        return BitConverter.ToString(ba).Replace("-","");
    }

    // Utility function to convert a hex string to a byte array
    public static byte[] StringToByteArray(String hex)
    {
        int NumberChars = hex.Length;
        byte[] bytes = new byte[NumberChars / 2];
        for (int i = 0; i < NumberChars; i += 2)
            bytes[i / 2] = Convert.ToByte(hex.Substring(i, 2), 16);
        return bytes;
    }

    // private function of ServerManager class
    string EncryptData(string toEncrypt) 
    {
        // Use Bouncy Castle libraries to parse the public key
        PemReader pr = new PemReader(new StringReader(SERVER_PUBLIC_KEY));
        AsymmetricKeyParameter publicKey = (AsymmetricKeyParameter)pr.ReadObject();
        RSAParameters rsaParams = DotNetUtilities.ToRSAParameters((RsaKeyParameters)publicKey);

        // Create new RSA provider and import key parameters
        RSACryptoServiceProvider RSA = new RSACryptoServiceProvider();
        RSA.ImportParameters(rsaParams);

        // package our data and encrypt it
        byte[] dataToEncrypt = new UTF8Encoding().GetBytes(toEncrypt);
        byte[] encryptedData = RSA.Encrypt(dataToEncrypt, false);
        string result = ByteArrayToString(encryptedData);
        return result;
    }

    void Start() {
        // hash the email and salt
        byte[] userBytes = new UTF8Encoding().GetBytes(USER_EMAIL + SALT);
        var hashedUserBytes = new MD5CryptoServiceProvider().ComputeHash(userBytes);
        string hashedUser = ByteArrayToString(hashedUserBytes).ToLower();
        
        // assemble the JSON string to encrypt, in the correct format
        var messageJson = $@"{{""user"":""{hashedUser}"", ""action"":""{ACTION_CODE}""}}";
        // encrypt
        var encryptedMessage = EncryptData(messageJson);
        // assemble the final JSON to send to the server
        var finalJSON = $@"{{""message"":""{encryptedMessage}""}}";
        
        StartCoroutine(Upload(finalJSON));
    }


    IEnumerator Upload(string json)
    {
        using (UnityWebRequest www = UnityWebRequest.Post(
            "http://localhost:3000/evolve/", 
            json, // THIS LINE IS CHANGED TO ACCEPT THE PARAMETER
            "application/json")
        )
        {
            yield return www.SendWebRequest();
            if (www.result != UnityWebRequest.Result.Success)
            {
                print(www.error);
            }
            else
            {
                var data = www.downloadHandler.text;
                print(data);
            }
        }
    }
}