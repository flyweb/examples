(function() {

var USE_TOUCH = 'ontouchstart' in window;

var HANDLE_MIN_X = -100;
var HANDLE_MAX_X = 100;
var HANDLE_MIN_Y = -100;
var HANDLE_MAX_Y = 100;

function Joystick(el) {
  this.el = el;
  
  var handle = document.createElement('div');
  handle.className = 'joystick-handle';

  el.appendChild(handle);

  var stick = document.createElement('div');
  stick.className = 'joystick-stick';

  handle.appendChild(stick);

  this.sensitivity = 0.8;
  this.value = {
    x: 0.0,
    y: 0.0
  };

  var x = 0;
  var y = 0;

  var lastClientX = null;
  var lastClientY = null;

  var translate = (function(x, y) {
    requestAnimationFrame(function() {
      handle.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    });
  }).bind(this);

  var clearTranslation = (function() {
    requestAnimationFrame(function() {
      handle.style.transition = 'transform 150ms ease';
      handle.style.transform = 'translate(0,0)';
    });
  }).bind(this);

  var pointerMoveHandler = (function(evt) {
    var pointer = USE_TOUCH ? evt.targetTouches[0] : evt;
    var clientX = pointer.clientX;
    var clientY = pointer.clientY;
    var deltaX = (clientX - lastClientX) * this.sensitivity;
    var deltaY = (clientY - lastClientY) * this.sensitivity;

    x = clamp(HANDLE_MIN_X, HANDLE_MAX_X, x + deltaX);
    y = clamp(HANDLE_MIN_Y, HANDLE_MAX_Y, y + deltaY);

    lastClientX = clientX;
    lastClientY = clientY;

    translate(x, y);

    this.value.x = x / (HANDLE_MAX_X - HANDLE_MIN_X) * 2;
    this.value.y = y / (HANDLE_MIN_Y - HANDLE_MAX_Y) * 2;

    el.dispatchEvent(new CustomEvent('change'));
  }).bind(this);

  var pointerEndHandler = (function(evt) {
    if (USE_TOUCH) {
      el.removeEventListener('touchmove', pointerMoveHandler);
      el.removeEventListener('touchend', pointerEndHandler);   
    } else {
      window.removeEventListener('mousemove', pointerMoveHandler);
      window.removeEventListener('mouseup', pointerEndHandler);
    }

    lastClientX = null;
    lastClientY = null;

    clearTranslation();

    this.value.x = 0.0;
    this.value.y = 0.0;

    el.dispatchEvent(new CustomEvent('change', { detail: this.value }));
  }).bind(this);

  el.addEventListener(USE_TOUCH ? 'touchstart' : 'mousedown', (function(evt) {
    var pointer = USE_TOUCH ? evt.targetTouches[0] : evt;
    var clientX = pointer.clientX;
    var clientY = pointer.clientY;

    x = 0;
    y = 0;

    lastClientX = clientX;
    lastClientY = clientY;
    
    if (USE_TOUCH) {
      el.addEventListener('touchmove', pointerMoveHandler);
      el.addEventListener('touchend', pointerEndHandler);   
    } else {
      window.addEventListener('mousemove', pointerMoveHandler);
      window.addEventListener('mouseup', pointerEndHandler);
    }

    handle.style.transition = 'none';
  }).bind(this));
}

Joystick.prototype.constructor = Joystick;

function clamp(min, max, value) {
  return Math.min(Math.max(min, value), max);
}

window.Joystick = Joystick;

})();
