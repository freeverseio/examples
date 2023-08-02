using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using Nethereum.Hex.HexConvertors.Extensions;

public class AESEncryption
{

    // Encrypts plaintext using user-entered password
    public static string AESEncrypt(string plainText, string password)
    {
        // Generate random salt
        byte[] salt = new byte[16]; 
        using (RNGCryptoServiceProvider rngCsp = new RNGCryptoServiceProvider()) {
            rngCsp.GetBytes(salt);
        }

        // Use an AES-Standard KDF (Key Derivation Function) to generate (IV, key) from (password, salt)
        // This is a standard step that makes brute-force attacks much harder
        var pdb = new Rfc2898DeriveBytes(password, salt);
        var key = pdb.GetBytes(32);
        var IV = pdb.GetBytes(16);

        // Encrypt the input string to an array of bytes.
        byte[] cipherText = AESEncryptStringToBytes(plainText, key, IV);

        // Return the concatenation of salt and cipherText, in Hex format.
        byte[] result = new byte[salt.Length + cipherText.Length];
        System.Buffer.BlockCopy(salt, 0, result, 0, salt.Length);
        System.Buffer.BlockCopy(cipherText, 0, result, salt.Length, cipherText.Length);
        return HexByteConvertorExtensions.ToHex(result).ToLower();
    }

    public static string AESDecrypt(string encryptedString, string password)
    {
        // convert from hex, and split bytes into salt + cipherText
        byte[] encryptedStringBytes = HexByteConvertorExtensions.HexToByteArray(encryptedString);
        byte[] salt = new byte[16]; // just salt
        byte[] cipherText = new byte[encryptedStringBytes.Length - 16]; // just cipherText

        for (int i = 0; i < 16; i++) salt[i] = encryptedStringBytes[i];
        for (int i = 0; i < cipherText.Length; i++) cipherText[i] = encryptedStringBytes[i + 16];

        // Use a an AES-Standard KDF (Key Derivation Function) to generate (IV, key) from (password, salt)
        // This is a standard step that makes brute-force attacks much harder
        Rfc2898DeriveBytes pdb = new Rfc2898DeriveBytes(password, salt);
        byte[] key = pdb.GetBytes(32);
        byte[] IV = pdb.GetBytes(16);

        try
        {
            return AESDecryptStringFromBytes(cipherText, key, IV);
        }
        catch (Exception)
        {
            throw new ArgumentNullException("Invalid key for AES Encryption");
        }
    }

    public static byte[] AESEncryptStringToBytes(string plainText, byte[] Key, byte[] IV)
    {
        // Check arguments.
        if (plainText == null || plainText.Length <= 0)
            throw new ArgumentNullException("plainText");
        if (Key == null || Key.Length <= 0)
            throw new ArgumentNullException("Key");
        if (IV == null || IV.Length <= 0)
            throw new ArgumentNullException("IV");

        // Create byte array to store the encrypted cipherText
        byte[] cipherText;

        // The plainText must be provided in Hex format
        byte[] plainTextBytes = HexStrToByteArray(plainText);
        
        // Create an Aes object with the specified key and IV, and encrypt.
        using (Aes aesAlg = Aes.Create())
        {
            aesAlg.Key = Key;
            aesAlg.IV = IV;
            
            // Create an encryptor to perform the stream transform.
            ICryptoTransform encryptor = aesAlg.CreateEncryptor(aesAlg.Key, aesAlg.IV);

            // Create the streams used for encryption.
            using (MemoryStream msEncrypt = new MemoryStream())
            {
                using (CryptoStream csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                {
                    csEncrypt.Write(plainTextBytes, 0, plainTextBytes.Length);
                    csEncrypt.FlushFinalBlock();
                    cipherText = msEncrypt.ToArray();
                }
            }
            aesAlg.Clear();
        }
        // Return the cipherText bytes from the memory stream.
        return cipherText;
    }

    public static string AESDecryptStringFromBytes(byte[] cipherText, byte[] Key, byte[] IV)
    {
        // Check arguments.
        if (cipherText == null || cipherText.Length <= 0)
            throw new ArgumentNullException("cipherText");
        if (Key == null || Key.Length <= 0)
            throw new ArgumentNullException("Key");
        if (IV == null || IV.Length <= 0)
            throw new ArgumentNullException("IV");

        // Declare the string used to hold the decrypted text.
        byte[] plainText = new byte[cipherText.Length];
        // Declare the amount of bytes that the decryptor will produce
        int nBytes;

        // Create an Aes object with the specified key and IV.
        using (Aes aesAlg = Aes.Create())
        {
            aesAlg.IV = IV;
            aesAlg.Key = Key;
            
            // Create a decryptor to perform the stream transform.
            ICryptoTransform decryptor = aesAlg.CreateDecryptor(aesAlg.Key, aesAlg.IV);
            
            // Create the streams used for decryption.
            using (MemoryStream msDecrypt = new MemoryStream(cipherText))
            {
                using (CryptoStream csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
                {
                    nBytes = csDecrypt.Read(plainText, 0, plainText.Length);
                    
                }
            }
            aesAlg.Clear();
        }
        byte[] result = new byte[nBytes];
        System.Buffer.BlockCopy(plainText, 0, result, 0, nBytes);
        return HexByteConvertorExtensions.ToHex(result, true).ToLower();
    }

    private static byte[] HexStrToByteArray(string hexStr)
    {
        if (hexStr.Substring(0,2).Equals("0x")) {
            return HexByteConvertorExtensions.HexToByteArray(hexStr.Substring(2));
        }
        return HexByteConvertorExtensions.HexToByteArray(hexStr);
    }
}
