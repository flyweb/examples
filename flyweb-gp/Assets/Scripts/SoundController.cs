using UnityEngine;
using System.Collections;
using System.Collections.Generic;

[RequireComponent(typeof(CarController))]
public class SoundController : MonoBehaviour {
  
  public AudioClip D = null;
  public float DVolume = 1.0f;
  public AudioClip E = null;
  public float EVolume = 1.0f;
  public AudioClip F = null;
  public float FVolume = 1.0f;
  public AudioClip K = null;
  public float KVolume = 1.0f;
  public AudioClip L = null;
  public float LVolume = 1.0f;

  public AudioClip wind = null;
  public float windVolume = 1.0f;
  public AudioClip tunnelSound = null;
  public float tunnelVolume = 1.0f;

  public AudioClip crashLowSpeedSound = null;
  public float crashLowVolume = 1.0f;
  public AudioClip crashHighSpeedSound = null;
  public float crashHighVolume = 1.0f;
  public AudioClip skidSound = null;

  public AudioClip BackgroundMusic = null;
  public float BackgroundMusicVolume = 0.6f;

  private AudioSource DAudio = null;
  private AudioSource EAudio = null;
  private AudioSource FAudio = null;
  private AudioSource KAudio = null;
  private AudioSource LAudio = null;

  private AudioSource tunnelAudio = null;
  private AudioSource windAudio = null;
  private AudioSource skidAudio = null;
  private AudioSource carAudio = null;

  private AudioSource backgroundMusic = null;

  private float gearShiftTime = 0.1f;
  private bool shiftingGear = false;
  private int gearShiftsStarted = 0;
  private int crashesStarted = 0;
  private float crashTime = 0.2f;
  private int oneShotLimit = 8;

  private int gear = 0;
  private int topGear = 6;

  private float idlePitch = 0.7f;
  private float startPitch = 0.85f;
  private float lowPitch = 1.17f;
  private float medPitch = 1.25f;
  private float highPitchFirst = 1.65f;
  private float highPitchSecond = 1.76f;
  private float highPitchThird = 1.80f;
  private float highPitchFourth = 1.86f;
  private float shiftPitch = 1.44f;
  private float prevPitchFactor = 0.0f;

  private CarController carController;

  // Create the needed AudioSources
  public void Awake() {
    DVolume *= 0.4f;
    EVolume *= 0.4f;
    FVolume *= 0.4f;
    KVolume *= 0.7f;
    LVolume *= 0.4f;
    windVolume *= 0.4f;
    
    DAudio = gameObject.AddComponent<AudioSource>();
    DAudio.loop = true;
    DAudio.clip = D;
    DAudio.volume = DVolume;
    DAudio.Play();

    EAudio = gameObject.AddComponent<AudioSource>();
    EAudio.loop = true;
    EAudio.clip = E;
    EAudio.volume = EVolume;
    EAudio.Play();
    
    FAudio = gameObject.AddComponent<AudioSource>();
    FAudio.loop = true;
    FAudio.clip = F;
    FAudio.volume = FVolume;
    FAudio.Play();
    
    KAudio = gameObject.AddComponent<AudioSource>();
    KAudio.loop = true;
    KAudio.clip = K;
    KAudio.volume = KVolume;
    KAudio.Play();
    
    LAudio = gameObject.AddComponent<AudioSource>();
    LAudio.loop = true;
    LAudio.clip = L;
    LAudio.volume = LVolume;
    LAudio.Play();
    
    windAudio = gameObject.AddComponent<AudioSource>();
    windAudio.loop = true;
    windAudio.clip = wind;
    windAudio.volume = windVolume;
    windAudio.Play();
    
    tunnelAudio = gameObject.AddComponent<AudioSource>();
    tunnelAudio.loop = true;
    tunnelAudio.clip = tunnelSound;
    tunnelAudio.volume = tunnelVolume;
    
    skidAudio = gameObject.AddComponent<AudioSource>();
    skidAudio.loop = true;
    skidAudio.clip = skidSound;
    skidAudio.volume = 0.0f;
    skidAudio.Play();
    
    carAudio = gameObject.AddComponent<AudioSource>();
    carAudio.loop = false;
    carAudio.playOnAwake = false;
    carAudio.Stop();
    
    crashTime = Mathf.Max(crashLowSpeedSound.length, crashHighSpeedSound.length);
    
    backgroundMusic = gameObject.AddComponent<AudioSource>();
    backgroundMusic.loop = true;
    backgroundMusic.clip = BackgroundMusic;
    backgroundMusic.volume = BackgroundMusicVolume;
    backgroundMusic.Play();
  }

  public void Start() {
    carController = GetComponent<CarController>();
  }

  public void Update() {
    float speedFactor = Mathf.Clamp01(carController.VelocityMagnitude / carController.maximumSpeed);
    float throttle = carController.Throttle;
    
    KAudio.volume = Mathf.Lerp(0.0f, KVolume, speedFactor);
    windAudio.volume = Mathf.Lerp(0.0f, windVolume, speedFactor * 2.0f);
    
    if (shiftingGear) {
      return;
    }
    
    float pitchFactor = Mathf.Lerp(0.0f, topGear, Mathf.Sin(speedFactor * Mathf.PI * 0.5f));
    int newGear = throttle >= 0.0f ? (int)pitchFactor : 1;
    
    pitchFactor -= newGear;
    
    float throttleFactor = pitchFactor;

    pitchFactor *= 0.3f;
    pitchFactor += throttleFactor * 0.7f * Mathf.Clamp01(Mathf.Abs(throttle) * 2.0f);
    
    if (newGear != gear) {
      if (newGear > gear) {
        GearShift(prevPitchFactor, pitchFactor, gear, true);
      } else {
        GearShift(prevPitchFactor, pitchFactor, gear, false);
      }

      gear = newGear;
    }
    
    else {
      float newPitch = 0.0f;
      if (gear == 0) {
        newPitch = Mathf.Lerp(idlePitch, highPitchFirst, pitchFactor);
      } else if (gear == 1) {
        newPitch = Mathf.Lerp(startPitch, highPitchSecond, pitchFactor);
      } else if (gear == 2) {
        newPitch = Mathf.Lerp(lowPitch, highPitchThird, pitchFactor);
      } else {
        newPitch = Mathf.Lerp(medPitch, highPitchFourth, pitchFactor);
      }

      SetPitch(newPitch);
      SetVolume(newPitch);
    }

    prevPitchFactor = pitchFactor;
  }

  private void SetPitch(float pitch) {
    DAudio.pitch = pitch;
    EAudio.pitch = pitch;
    FAudio.pitch = pitch;
    LAudio.pitch = pitch;
    tunnelAudio.pitch = pitch;
  }

  private void SetVolume(float pitch) {
    float pitchFactor = Mathf.Lerp(0.0f, 1.0f, (pitch - startPitch) / (highPitchSecond - startPitch));
    DAudio.volume = Mathf.Lerp(0.0f, DVolume, pitchFactor);
    
    float fVolume = Mathf.Lerp(FVolume * 0.80f, FVolume, pitchFactor);
    FAudio.volume = fVolume * 0.7f + fVolume * 0.3f * Mathf.Abs(carController.Throttle);
    
    float eVolume = Mathf.Lerp(EVolume * 0.89f, EVolume, pitchFactor);
    EAudio.volume = eVolume * 0.8f + eVolume * 0.2f * Mathf.Abs(carController.Throttle);
  }

  private IEnumerator GearShift(float oldPitchFactor, float newPitchFactor, int gear, bool shiftUp) {
    shiftingGear = true;
    
    float timer = 0.0f;
    float pitchFactor = 0.0f;
    float newPitch = 0.0f;
    
    if (shiftUp) {
      while (timer < gearShiftTime) {
        pitchFactor = Mathf.Lerp(oldPitchFactor, 0.0f, timer / gearShiftTime);
        if (gear == 0) {
          newPitch = Mathf.Lerp(lowPitch, highPitchFirst, pitchFactor);
        } else {
          newPitch = Mathf.Lerp(lowPitch, highPitchSecond, pitchFactor);
        }

        SetPitch(newPitch);
        SetVolume(newPitch);
        timer += Time.deltaTime;
        yield return null;
      }
    }
    
    else {
      while (timer < gearShiftTime) {
        pitchFactor = Mathf.Lerp(0.0f, 1.0f, timer / gearShiftTime);
        newPitch = Mathf.Lerp(lowPitch, shiftPitch, pitchFactor);
        SetPitch(newPitch);
        SetVolume(newPitch);
        timer += Time.deltaTime;
        yield return null;
      }
    }
      
    shiftingGear = false;
  }

  public void Skid(bool play, float volumeFactor) {
    if (!skidAudio) {
      return;
    }

    if (play) {
      skidAudio.volume = Mathf.Clamp01(volumeFactor + 0.3f);
    } else {
      skidAudio.volume = 0.0f;
    }
  }

  private IEnumerator StartCrash(float volumeFactor) {
    if (volumeFactor > 0.75f) {
      carAudio.PlayOneShot(crashHighSpeedSound, Mathf.Clamp01((0.5f + volumeFactor * 0.5f) * crashHighVolume));
    }

    carAudio.PlayOneShot(crashLowSpeedSound, Mathf.Clamp01(volumeFactor * crashLowVolume));
    crashesStarted++;
    
    yield return new WaitForSeconds(crashTime);
    
    crashesStarted--;
  }

  // Checks if the max amount of crash sounds has been started, and
  // if the max amount of total one shot sounds has been started.
  public void Crash(float volumeFactor) {
    if (crashesStarted > 3 || OneShotLimitReached()) {
      return;
    }

    StartCoroutine(StartCrash(volumeFactor));
  }

  // A function for testing if the maximum amount of OneShot AudioClips
  // has been started.
  private bool OneShotLimitReached() {
    return (crashesStarted + gearShiftsStarted) > oneShotLimit;
  }

  public void OnTriggerEnter(Collider collider) {
    SoundToggler st = collider.transform.GetComponent<SoundToggler>();
    if (st) {
      ControlSound(true, st.fadeTime);
    }
  }

  public void OnTriggerExit(Collider collider) {
    SoundToggler st = collider.transform.GetComponent<SoundToggler>();
    if (st) {
      ControlSound(false, st.fadeTime);
    }
  }

  public IEnumerator ControlSound(bool play, float fadeTime) {
    float timer = 0.0f;
    if (play && !tunnelAudio.isPlaying) {
      tunnelAudio.volume = 0.0f;
      tunnelAudio.Play();
      while (timer < fadeTime) {
        tunnelAudio.volume = Mathf.Lerp(0, tunnelVolume, timer / fadeTime);
        timer += Time.deltaTime;
        yield return null;
      }
    }
    
    else if (!play && tunnelAudio.isPlaying) {
      while (timer < fadeTime) {
        tunnelAudio.volume = Mathf.Lerp(0.0f, tunnelVolume, timer / fadeTime);
        timer += Time.deltaTime;
        yield return null;
      }

      tunnelAudio.Stop();
    }
  }

}
