(function() {

var USE_TOUCH = 'ontouchstart' in window;

var HANDLE_MIN_Y = -110;
var HANDLE_MAX_Y = 110;

function Throttle(el) {
  this.el = el;
  
  var handle = document.createElement('div');
  handle.className = 'throttle-handle';

  el.appendChild(handle);

  this.sensitivity = 0.5;
  this.value = {
    y: 0.0
  };

  var y = 0;

  var lastClientY = null;

  var translate = (function(y) {
    requestAnimationFrame(function() {
      handle.style.transform = 'translateY(' + y + 'px)';
    });
  }).bind(this);

  var clearTranslation = (function() {
    requestAnimationFrame(function() {
      handle.style.transition = 'transform 150ms ease';
      handle.style.transform = 'translateY(0)';
    });
  }).bind(this);

  var pointerMoveHandler = (function(evt) {
    var pointer = USE_TOUCH ? evt.targetTouches[0] : evt;
    var clientY = pointer.clientY;
    var deltaY = (clientY - lastClientY) * this.sensitivity;

    y = clamp(HANDLE_MIN_Y, HANDLE_MAX_Y, y + deltaY);

    lastClientY = clientY;

    translate(y);

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

    lastClientY = null;

    clearTranslation();

    this.value.y = 0.0;

    el.dispatchEvent(new CustomEvent('change', { detail: this.value }));
  }).bind(this);

  el.addEventListener(USE_TOUCH ? 'touchstart' : 'mousedown', (function(evt) {
    var pointer = USE_TOUCH ? evt.targetTouches[0] : evt;
    var clientY = pointer.clientY;

    y = 0;

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

Throttle.prototype.constructor = Throttle;

function clamp(min, max, value) {
  return Math.min(Math.max(min, value), max);
}

window.Throttle = Throttle;

})();
