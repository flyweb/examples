window.JoystickController = (function() {

var USE_TOUCH_POINTER = 'ontouchstart' in window;

var POINTER_START = USE_TOUCH_POINTER ? 'touchstart' : 'mousedown';
var POINTER_MOVE  = USE_TOUCH_POINTER ? 'touchmove'  : 'mousemove';
var POINTER_END   = USE_TOUCH_POINTER ? 'touchend'   : 'mouseup';

function JoystickController(el) {
  this.el = el;

  this.joystick = document.createElement('div');
  this.joystick.style.background   = 'radial-gradient(ellipse at center,#555 40%,#222 90%)';
  this.joystick.style.borderRadius = '50%';
  this.joystick.style.boxShadow    = '0 4px 8px 2px rgba(0,0,0,.5)';
  this.joystick.style.position     = 'relative';
  this.joystick.style.top          = 'calc(50% - 50px)';
  this.joystick.style.left         = 'calc(50% - 50px)';
  this.joystick.style.width        = '100px';
  this.joystick.style.height       = '100px';

  this.lastX = 0.0;
  this.lastY = 0.0;

  this.x = 0.0;
  this.y = 0.0;

  var checkInput = () => {
    if (this.x !== this.lastX ||
        this.y !== this.lastY) {
      this.lastX = this.x;
      this.lastY = this.y;

      this.oninput({
        x: this.x,
        y: this.y
      });
    }
  };

  var offset = {};

  this.onPointerStart = (evt) => {
    offset.left   = this.el.offsetLeft;
    offset.top    = this.el.offsetTop;
    offset.width  = this.el.offsetWidth;
    offset.height = this.el.offsetHeight;

    var target = USE_TOUCH_POINTER ? this.el : window;
    target.addEventListener(POINTER_MOVE, this.onPointerMove);
    target.addEventListener(POINTER_END,  this.onPointerEnd);
  };

  this.onPointerMove = (evt) => {
    var point = USE_TOUCH_POINTER ? evt.targetTouches[0] : evt;

    var xRange = offset.width  / 2;
    var yRange = offset.height / 2;

    var x = point.clientX - offset.left - xRange;
    var y = point.clientY - offset.top  - yRange;

    x = clamp(-xRange, xRange, x);
    y = clamp(-yRange, yRange, y);

    this.joystick.style.transform = 'translate(' + x + 'px,' + y + 'px)';

    this.x =  x / xRange;
    this.y = -y / yRange;

    checkInput();
  };

  this.onPointerEnd  = (evt) => {
    this.joystick.style.transform = 'translate(0px,0px)';

    this.x = this.lastX = 0.0;
    this.y = this.lastY = 0.0;

    this.oninput({
      x: this.x,
      y: this.y
    });

    var target = USE_TOUCH_POINTER ? this.el : window;
    target.removeEventListener(POINTER_MOVE, this.onPointerMove);
    target.removeEventListener(POINTER_END,  this.onPointerEnd);
  };
}

JoystickController.prototype.start = function() {
  this.el.addEventListener(POINTER_START, this.onPointerStart);
  this.el.appendChild(this.joystick);
};

JoystickController.prototype.stop = function() {
  this.el.removeEventListener(POINTER_START, this.onPointerStart);
  this.el.removeChild(this.joystick);
};

JoystickController.prototype.oninput = function() {};

function clamp(min, max, value) {
  return Math.min(Math.max(min, value), max);
}

return JoystickController;

})();
