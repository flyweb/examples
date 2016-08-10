using UnityEngine;
using System.Collections;

public class Checkpoint : MonoBehaviour {

  public int sequence = 1;

  public void OnTriggerEnter(Collider collider) {
    PlayerController player = collider.gameObject.GetComponentInParent<PlayerController>();
    if (player) {
      player.OnCheckpoint(this.sequence);
    }
  }

}
