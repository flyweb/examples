using UnityEngine;
using System.Collections.Generic;
using System.Runtime.InteropServices;

/// <summary>
/// The Kart Controller. Handles all the dynamics for the kart and also implements some helper functions for 
/// things like speed boosts/penalties, and making the kart spin/wiggle/jump.
/// </summary>
[RequireComponent(typeof(Rigidbody))]
[RequireComponent(typeof(SoundController))]
public class CarController : MonoBehaviour {

  [DllImport("__Internal")]
  private static extern void DispatchEvent(string eventName, string eventData);

  [Range(10.0f, 200.0f)]
  public float maximumSpeed = 120.0f;

  [Range(10.0f, 200.0f)]
  public float maximumSpeedInReverse = 40.0f;

  [Range(0.01f, 20.0f)]
  public float accelerationTime = 8.0f;
  
  [Range(0.01f, 1.0f)]
  public float traction = 0.4f;

  [Range(0.01f, 1.0f)]
  public float decelerationSpeed = 0.2f;

  [Range(0.01f, 50.0f)]
  public float maximumBrakeTorque = 30.0f;

  [Range(0.1f, 10.0f)]
  public float frontWheelRadius = 0.5f;

  [Range(0.1f, 10.0f)]
  public float rearWheelRadius = 0.5f;

  [Range(1.0f, 90.0f)]
  public float maximumSteeringAngle = 30.0f;

  [Range(0.01f, 1.0f)]
  public float steeringSpeed = 0.5f;

  [Range(0.01f, 20.0f)]
  public float offRoadDrag = 2.0f;

  [Range(0.01f, 20.0f)]
  public float inAirDrag = 0.5f;

  [Range(0.01f, 1.0f)]
  public float steeringDrift = 0.3f;

  public Transform bodyTransform;
  public Transform frontLeftWheelTransform;
  public Transform frontRightWheelTransform;
  public Transform rearLeftWheelTransform;
  public Transform rearRightWheelTransform;

  private float throttle;
  public float Throttle {
    get { return throttle; }
    set { throttle = Mathf.Clamp(value, -1.0f, 1.0f); }
  }

  private float steering;
  public float Steering {
    get { return steering; }
    set { steering = Mathf.Clamp(value, -1.0f, 1.0f); }
  }

  private float currentSpeed;
  public float CurrentSpeed {
    get { return currentSpeed; }
  }

  private bool isOffRoad;
  public bool IsOffRoad {
    get { return isOffRoad; }
  }

  private bool isInAir;
  public bool IsInAir {
    get { return isInAir; }
  }

  private bool isFlipped;
  public bool IsFlipped {
    get { return isFlipped; }
  }

  public float SpeedPercent {
    get { return currentSpeed / maximumSpeed; }
  }

  public float VelocityMagnitude {
    get { return rigidbody.velocity.magnitude; }
  }

  private const float metersToMiles = 1.0f / 1600.0f;
  private const float secondsToHours = 3600.0f;

  private float driftVelocity;

  private WheelCollider[] wheelColliders = new WheelCollider[4];

  private Transform frontLeftWheelSteeringTransform;
  private Transform frontRightWheelSteeringTransform;

  private Transform bodySteeringTransform;

  private new Rigidbody rigidbody;
  private SoundController soundController;
//

  public void Start() {
    bodySteeringTransform = WrapTransformChildren(bodyTransform, "BodySteering");

    wheelColliders[0] = CreateWheelCollider(frontLeftWheelTransform, frontWheelRadius);
    wheelColliders[1] = CreateWheelCollider(frontRightWheelTransform, frontWheelRadius);
    wheelColliders[2] = CreateWheelCollider(rearLeftWheelTransform, rearWheelRadius);
    wheelColliders[3] = CreateWheelCollider(rearRightWheelTransform, rearWheelRadius);

    frontLeftWheelSteeringTransform = WrapTransform(frontLeftWheelTransform, "FrontLeftWheelSteering");
    frontRightWheelSteeringTransform = WrapTransform(frontRightWheelTransform, "FrontRightWheelSteering");

    rigidbody = GetComponent<Rigidbody>();
    soundController = GetComponent<SoundController>();
  }

  public void FixedUpdate() {
    // calculate our current velocity in local space (i.e. so z is forward, x is sideways etc)
    Vector3 relativeVelocity = transform.InverseTransformDirection(rigidbody.velocity);
    // our current speed is the forward part of the velocity - note this will be negative if we are reversing.
    currentSpeed = relativeVelocity.z * metersToMiles * secondsToHours;

    // cast a ray to check if we are grounded or not
    Vector3 frontWheelBottom = 0.5f * (frontLeftWheelTransform.position + frontRightWheelTransform.position) - new Vector3(0.0f, 0.5f, 1.0f) * frontWheelRadius;
    RaycastHit hit;
    isInAir = !Physics.Raycast(frontWheelBottom, -Vector3.up, out hit, 2.0f * frontWheelRadius);

    // check if the ground beneath us is tagged as 'off road'
    if(!isInAir) {
      isOffRoad = hit.collider.gameObject.CompareTag("OffRoad");
    }

    // check if the vehicle has overturned. we don't do anything with this, but a controller script could use it
    // to reset a vehicle that has been overturned for a certain amount of time for example.
    isFlipped = transform.up.y < 0.0f;

    // only apply thrust if the wheels are touching the ground
    if(!isInAir) {
      ApplyThrust();
    }

    ApplyDrag();
    ApplySteering();

    // calculate the angle that the wheels should have rolled since the last frame given our current speed
    float frontWheelRotation = (relativeVelocity.z / frontWheelRadius) * Time.deltaTime * Mathf.Rad2Deg;
    float rearWheelRotation = (relativeVelocity.z / rearWheelRadius) * Time.deltaTime * Mathf.Rad2Deg;
    // now rotate each wheel
    frontLeftWheelTransform.Rotate(frontWheelRotation, 0.0f, 0.0f);
    frontRightWheelTransform.Rotate(frontWheelRotation, 0.0f, 0.0f);
    rearLeftWheelTransform.Rotate(rearWheelRotation, 0.0f, 0.0f);
    rearRightWheelTransform.Rotate(rearWheelRotation, 0.0f, 0.0f);
  }

  public void OnCollisionEnter(Collision collision) {
    if (collision.contacts.Length > 0) {
      if (collision.collider.gameObject.tag == "IgnoreCrash") {
        return;
      }

      float volumeFactor = Mathf.Clamp01(collision.relativeVelocity.magnitude * 0.1f);

      volumeFactor *= Mathf.Clamp01(Mathf.Abs(Vector3.Dot(collision.relativeVelocity.normalized, collision.contacts[0].normal)));
      volumeFactor = volumeFactor * 0.5f + 0.5f;

      soundController.Crash(volumeFactor);

      // Send "crash" event to WebGL page.
      try {
        DispatchEvent("crash", gameObject.name);
      } catch {}
    }
  }

  private void ApplyThrust() {
    float maximumMetersPerSec = (maximumSpeed * 2.0f) / (metersToMiles * secondsToHours);

    // calculate our acceleration value in m/s^2
    float acceleration = maximumMetersPerSec / accelerationTime;

    // if we're at or over the top speed, then don't accelerate any more
    if(currentSpeed >= maximumSpeed || currentSpeed <= -maximumSpeedInReverse) {
      acceleration = 0.0f;
    }

    // calculate our final acceleration vector
    Vector3 thrustDirection = transform.forward;
    Vector3 accelerationDirection = acceleration * thrustDirection * throttle;

    // add our acceleration to our current velocity
    Vector3 velocity = rigidbody.velocity;
    velocity += accelerationDirection * Time.deltaTime;
    rigidbody.velocity = velocity;

    // apply the brakes automatically when the throttle is off to stop the vehicle rolling by itself.
    float brakeTorque = 0.0f;
    // modify the braking amount based on the current speed so we come to a gentle stop.
    if (throttle == 0.0f && currentSpeed < 10.0f) {
      brakeTorque = maximumBrakeTorque * Mathf.Clamp01(decelerationSpeed * (10.0f - currentSpeed));
    }

    foreach (WheelCollider wheel in wheelColliders) {
      wheel.brakeTorque = brakeTorque;
      wheel.motorTorque = throttle * 0.1f;
    }
  }

  private void ApplyDrag() {
    float forwardDrag = Mathf.Lerp(0.1f, 0.5f, traction);
    float lateralDrag = Mathf.Lerp(1.0f, 5.0f, traction);
    float engineDrag = Mathf.Lerp(0.0f, 0.01f, decelerationSpeed);

    Vector3 relativeVelocity = transform.InverseTransformDirection(rigidbody.velocity);
    Vector3 drag = Vector3.zero;
    drag.z = relativeVelocity.z * (forwardDrag + ((1.0f - Mathf.Abs(throttle)) * engineDrag));

    if (isOffRoad) {
      drag.z += relativeVelocity.z * offRoadDrag;
    }

    drag.x = relativeVelocity.x * lateralDrag;

    if (isInAir) {
      drag *= inAirDrag;
    }

    drag = transform.TransformDirection(drag);

    Vector3 velocity = rigidbody.velocity;
    velocity -= drag * Time.deltaTime;
    
    rigidbody.velocity = velocity;
  }

  private void ApplySteering() {
    float steeringAngle = steering * maximumSteeringAngle;

    soundController.Skid(!isInAir && Mathf.Abs(steering) > 0.65f && SpeedPercent > 0.2f, SpeedPercent);

    // rotate the front wheels
    frontLeftWheelSteeringTransform.localRotation  = Quaternion.Euler(0.0f, steeringAngle, 0.0f);
    frontRightWheelSteeringTransform.localRotation = Quaternion.Euler(0.0f, steeringAngle, 0.0f);

    // only turn the vehicle when we're on the ground and moving
    if (!isInAir && rigidbody.velocity.sqrMagnitude > 0.1f) {
      // reverse the steering direction when the vehicle is moving backwards
      Vector3 relativeVelocity = transform.InverseTransformDirection(rigidbody.velocity);
      steeringAngle *= Mathf.Sign(relativeVelocity.z);

      // rotate the vehicle
      Quaternion steeringRotation = Quaternion.Euler(0.0f, steeringAngle * Time.deltaTime * (3.0f * steeringSpeed), 0.0f);
      rigidbody.MoveRotation(transform.rotation * steeringRotation);

      // also rotate the body a little for visual effect
      float currentDriftAngle = bodySteeringTransform.localRotation.eulerAngles.y;
      float driftAngle = Mathf.SmoothDampAngle(currentDriftAngle, steeringDrift * steeringAngle, ref driftVelocity, 0.5f);
      bodySteeringTransform.localRotation = Quaternion.Euler(0.0f, driftAngle, 0.0f);
    }
  }

  private WheelCollider CreateWheelCollider(Transform wheelTransform, float radius) {
    GameObject wheel = new GameObject("WheelCollider");
    wheel.transform.parent = bodyTransform;
    wheel.transform.position = wheelTransform.position;
    wheel.transform.localRotation = Quaternion.identity;

    WheelCollider collider = wheel.AddComponent<WheelCollider>();
    collider.radius = radius;
    collider.suspensionDistance = 0.1f;
    collider.mass = 5.0f;
    collider.forceAppPointDistance = 0.1f;
    collider.center = 0.5f * collider.suspensionDistance * Vector3.up;

    // we calculate our own sideways friction and slippage, so we don't need the wheel collider to do it too.
    WheelFrictionCurve sideFriction = collider.sidewaysFriction;
    sideFriction.stiffness = 0.01f;
    collider.sidewaysFriction = sideFriction;

    return collider;
  }

  private Transform WrapTransform(Transform targetTransform, string wrapperName) {
    Transform wrapperTransform = new GameObject(wrapperName).transform;
    wrapperTransform.position = targetTransform.position;
    wrapperTransform.rotation = targetTransform.rotation;
    wrapperTransform.parent = targetTransform.parent;

    targetTransform.parent = wrapperTransform;

    return wrapperTransform;
  }

  private Transform WrapTransformChildren(Transform targetTransform, string wrapperName) {
    Transform wrapperTransform = new GameObject(wrapperName).transform;
    wrapperTransform.position = targetTransform.position;
    wrapperTransform.rotation = targetTransform.rotation;

    while (targetTransform.childCount > 0) {
      targetTransform.GetChild(0).parent = wrapperTransform;
    }

    wrapperTransform.parent = targetTransform;

    return wrapperTransform;
  }

}
