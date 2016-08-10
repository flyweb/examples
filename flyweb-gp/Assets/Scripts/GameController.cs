using UnityEngine;
using System.Collections;
using System.Runtime.InteropServices;

public class GameController : MonoBehaviour {

  [DllImport("__Internal")]
  private static extern void DispatchEvent(string eventName, string eventData);

	public void Start () {
    try {
  	  DispatchEvent("gameready", "");
    } catch {}
	}

}
