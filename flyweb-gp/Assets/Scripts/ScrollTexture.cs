using UnityEngine;
using System.Collections;

public class ScrollTexture : MonoBehaviour {

  public int materialIndex = 0;
  public Vector2 uvAnimationRate = new Vector2(0.1f, 0.1f);
  public string textureName = "_MainTex";

  private Vector2 uvOffset = Vector2.zero;

	public void LateUpdate() {
  	uvOffset += (uvAnimationRate * Time.deltaTime);

    if (GetComponent<Renderer>().enabled) {
      GetComponent<Renderer>().materials[materialIndex].SetTextureOffset(textureName, uvOffset);
    }
  }

}
