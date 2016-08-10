window.ButtonController = (function() {

var USE_TOUCH_POINTER = 'ontouchstart' in window;

var POINTER_START = USE_TOUCH_POINTER ? 'touchstart' : 'mousedown';
var POINTER_END   = USE_TOUCH_POINTER ? 'touchend'   : 'mouseup';

function ButtonController(el) {
  this.el = el;

  this.onPointerStart = (evt) => {
    this.oninput(true);

    var target = USE_TOUCH_POINTER ? this.el : window;
    target.addEventListener(POINTER_END, this.onPointerEnd);
  };

  this.onPointerEnd  = (evt) => {
    this.oninput(false);

    var target = USE_TOUCH_POINTER ? this.el : window;
    target.removeEventListener(POINTER_END, this.onPointerEnd);
  };
}

ButtonController.prototype.start = function() {
  this.el.addEventListener(POINTER_START, this.onPointerStart);
};

ButtonController.prototype.stop = function() {
  this.el.removeEventListener(POINTER_START, this.onPointerStart);
};

ButtonController.prototype.oninput = function() {};

return ButtonController;

})();
