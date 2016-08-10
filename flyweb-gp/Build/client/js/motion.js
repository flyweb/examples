window.MotionController = (function() {

function MotionController(axis) {
  this.value = 0.0;

  this.onDeviceMotion = (evt) => {
    if (!window.fullScreen) {
      return;
    }

    this.value = clamp(evt.accelerationIncludingGravity[axis] / 7.5, -1.0, 1.0);

    this.oninput(this.value);
  };

  this.onTouchStart = () => {
    if (!window.fullScreen) {
      document.documentElement.mozRequestFullScreen();
    }
  };

  this.onFullScreenChange = () => {
    screen.mozLockOrientation('landscape-primary');
  };
}

MotionController.prototype.start = function() {
  window.addEventListener('devicemotion', this.onDeviceMotion);
  window.addEventListener('touchstart', this.onTouchStart);
  document.addEventListener('mozfullscreenchange', this.onFullScreenChange);
};

MotionController.prototype.stop = function() {
  window.removeEventListener('devicemotion', this.onDeviceMotion);
  window.removeEventListener('touchstart', this.onTouchStart);
  document.removeEventListener('mozfullscreenchange', this.onFullScreenChange);
};

MotionController.prototype.oninput = function() {};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
};

return MotionController;

})();
