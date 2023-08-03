using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;
using Newtonsoft.Json;

public class Data
{
    public GetUserAssets getUserAssets { get; set; }
}

public class GetUserAssets
{
    public int totalCount { get; set; }
    public List<Node> nodes { get; set; }
}

public class Node
{
    public string assetid { get; set; }
}

public class Root
{
    public Data data { get; set; }
}

public class Queries : MonoBehaviour
{
    // change these variables
    private static string UNI_ID = "<paste_universe_id_here>";
    private static string URL = "<paste_api_here>";

    public void LaunchQuery()
    {
        StartCoroutine (GetUserAssetsQuery( (bool success, string result) => {
            // Deserialize the response
            Root deserializedResult = JsonConvert.DeserializeObject<Root>(result);
            
            // Print a summary of the results to the console
            print ("Number of assets owned by user:" + deserializedResult.data.getUserAssets.totalCount);
            foreach (Node node in deserializedResult.data.getUserAssets.nodes)
            {
                print("Asset ID: " + node.assetid);
            }
        }));
    }

    // Function to get all assets of user, accepts a callback function
    public IEnumerator GetUserAssetsQuery(System.Action<bool, string> callback) 
    {        
        // grab the user address from the Keystore
        KeyStore keyStore = GetComponent<KeyStore>();
        string USER_ADDRESS = keyStore.Address;

        // the query we will use to get the assets
        // see https://dev.livingassets.io/living-assets-api/information-queries
        string query = "query {getUserAssets(web3Address:\"" 
                        +USER_ADDRESS+"\", universe:"
                        +UNI_ID+") { totalCount nodes {assetid}}}";

        // create our GraphQL client instance and create and send the UnityWebRequest
        GraphQLClient client = new GraphQLClient (URL);
        using( UnityWebRequest www = client.Query(query, "{}", "")) 
        {
            yield return www.SendWebRequest();
            if (www.result == UnityWebRequest.Result.ConnectionError) 
                callback (false, www.error);
            else 
                callback (true, www.downloadHandler.text);
        }
    }
}
