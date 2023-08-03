using UnityEngine;
using System.Collections;
using UnityEngine.Networking;
using System.Runtime.Serialization.Formatters.Binary;
using System.Text;

public class GraphQLClient {
    private string url;

    public GraphQLClient(string url) {
      this.url = url;
    }

    [System.Serializable]
    private class GraphQLQuery {
      public string query;
    }

    public UnityWebRequest Query(string query, string variables, string operationName) {
        var fullQuery = new GraphQLQuery () {
            query = query
        };
        string json = JsonUtility.ToJson (fullQuery);
        byte[] payload = Encoding.UTF8.GetBytes (json);
        UploadHandler data = new UploadHandlerRaw (payload);

        UnityWebRequest request = UnityWebRequest.PostWwwForm(url, UnityWebRequest.kHttpVerbPOST);
        request.uploadHandler = data;
        request.SetRequestHeader ("Content-Type", "application/json");
        return request;
    }
}
