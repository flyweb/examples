using UnityEngine;
using System.Collections;

public class PlayerController : MonoBehaviour {

  public Camera playerCamera;

  public int playerID = 1;
  public int laps = 0;
  public int maxSequence = 12;

  public KeyCode throttleKey    = KeyCode.UpArrow;
  public KeyCode reverseKey     = KeyCode.DownArrow;
  public KeyCode steerLeftKey   = KeyCode.LeftArrow;
  public KeyCode steerRightKey  = KeyCode.RightArrow;

  public bool isJoined = false;

  private CarController car;
  
  private AudioSource audioSource;

  private Texture2D disabledTexture;
  private Texture2D lapsTexture;

  private GUIStyle lapsStyle;
  private GUIStyle textStyle;
  private GUIStyle subtextStyle;

  private int currentSequence = 0;

  private float overrideThrottle = 0.0f;
  private float overrideSteering = 0.0f;

  public void OnCheckpoint(int sequence) {
    if (sequence == this.currentSequence + 1) {
      this.currentSequence = sequence;

      Debug.Log(this.name + " Triggered Checkpoint: " + this.currentSequence);
    }

    else if (sequence == 1 && this.currentSequence == this.maxSequence) {
      this.currentSequence = 1;
      this.laps += 1;

      Debug.Log(this.name + " Completed: " + this.laps + " Laps");
    }
  }

  public void SetThrottle(float throttle) {
    this.overrideThrottle = throttle;
  }

  public void SetSteering(float steering) {
    this.overrideSteering = steering;
  }

  public void Join() {
    this.isJoined = true;
  }

  public void Leave() {
    this.isJoined = false;
  }

  // Use this for initialization
  public void Start() {
    this.car = GetComponentInChildren<CarController>();
    this.audioSource = GetComponentInChildren<AudioSource>();

    this.disabledTexture = new Texture2D(1, 1);
    this.disabledTexture.SetPixel(0, 0, new Color(0.0f, 0.0f, 0.0f, 0.75f));
    this.disabledTexture.Apply();

    this.lapsTexture = new Texture2D(1, 1);
    this.lapsTexture.SetPixel(0, 0, new Color(0.0f, 0.0f, 0.0f, 0.25f));
    this.lapsTexture.Apply();

    this.lapsStyle = new GUIStyle();
    this.lapsStyle.normal.background = this.lapsTexture;
    this.lapsStyle.normal.textColor = Color.white;
    this.lapsStyle.fontSize = 18;

    this.textStyle = new GUIStyle();
    this.textStyle.alignment = TextAnchor.MiddleCenter;
    this.textStyle.normal.textColor = Color.white;
    this.textStyle.fontSize = 24;

    this.subtextStyle = new GUIStyle();
    this.subtextStyle.alignment = TextAnchor.LowerCenter;
    this.subtextStyle.normal.textColor = Color.white;
    this.subtextStyle.fontSize = 18;
    this.subtextStyle.padding = new RectOffset(10, 10, 10, 10);
  }
  
  // Update is called once per frame
  public void Update() {
    if (Input.GetKey(this.throttleKey)) {
      this.car.Throttle = 1.0f;

      this.overrideThrottle = 0.0f;
    }

    else if (Input.GetKey(this.reverseKey)) {
      this.car.Throttle = -1.0f;

      this.overrideThrottle = 0.0f;
    }

    else if (this.overrideThrottle != 0.0f) {
      this.car.Throttle = this.overrideThrottle;
    }

    else {
      this.car.Throttle = 0.0f;
    }

    if (Input.GetKey(this.steerLeftKey)) {
      this.car.Steering = -1.0f;

      this.overrideSteering = 0.0f;
    }

    else if (Input.GetKey(this.steerRightKey)) {
      this.car.Steering = 1.0f;

      this.overrideSteering = 0.0f;
    }

    else if (this.overrideSteering != 0.0f) {
      this.car.Steering = this.overrideSteering;
    }

    else {
      this.car.Steering = 0.0f;
    }

    this.audioSource.volume = this.isJoined ? Mathf.Abs(this.car.SpeedPercent / 2.0f) + 0.2f : 0.1f;
    this.audioSource.pitch = Mathf.Abs(0.6f + (this.car.SpeedPercent));
  }

  public void OnGUI() {
    Rect cameraRect = this.playerCamera.rect;
    Rect guiRect = new Rect(cameraRect.x * Screen.width,
                            (0.5f - cameraRect.y) * Screen.height,
                            cameraRect.width  * Screen.width,
                            cameraRect.height * Screen.height);

    if (this.isJoined) {
      GUI.Box(new Rect(guiRect.x, guiRect.y, 64.0f, 24.0f), "Laps: " + this.laps, this.lapsStyle);
      return;
    }

    GUI.DrawTexture(guiRect, this.disabledTexture);

    GUI.Label(guiRect, "Player " + this.playerID + " - Join via FlyWeb!", this.textStyle);
  }

}
