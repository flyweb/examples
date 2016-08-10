using UnityEngine;
using System.Collections;

/// <summary>
/// Very simple camera controller which smoothly follows behind a target object.
/// </summary>
public class CameraController : MonoBehaviour 
{
	public Transform target;											// the object we are following
	public Vector3 followOffset = new Vector3(0.0f, 2.0f, -5.0f);		// the offset away from the target that we attempt to keep
	public float smoothTime = 1.0f;										// smoothing time, smaller values will give a snappier camera

	private Vector3 velocity;

	void FixedUpdate() 
	{
		// calculate the target position
		Vector3 targetPos = target.TransformPoint(followOffset);
		Vector3 pos = transform.position;
		// update the camera position to smoothly follow the target 
		pos = Vector3.SmoothDamp(pos, targetPos, ref velocity, smoothTime);
		transform.position = pos;

		// make the camera always look at the target object
		transform.LookAt(target.position);
	}
}
