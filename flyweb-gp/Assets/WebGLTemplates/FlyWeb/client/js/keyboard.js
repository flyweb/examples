window.KeyboardController = (function() {

const KEYCODE_UP    = 38;
const KEYCODE_DOWN  = 40;
const KEYCODE_LEFT  = 37;
const KEYCODE_RIGHT = 39;
const KEYCODE_W     = 87;
const KEYCODE_S     = 83;
const KEYCODE_A     = 65;
const KEYCODE_D     = 68;

function KeyboardController() {
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

  this.onKeyDown = (evt) => {
    switch (evt.keyCode) {
      case KEYCODE_LEFT:
      case KEYCODE_A:
        this.x = -1.0;
        break;
      case KEYCODE_RIGHT:
      case KEYCODE_D:
        this.x = 1.0;
        break;
      case KEYCODE_UP:
      case KEYCODE_W:
        this.y = 1.0;
        break;
      case KEYCODE_DOWN:
      case KEYCODE_S:
        this.y = -1.0;
        break;
    }

    checkInput();
  };

  this.onKeyUp   = (evt) => {
    switch (evt.keyCode) {
      case KEYCODE_LEFT:
      case KEYCODE_A:
      case KEYCODE_RIGHT:
      case KEYCODE_D:
        this.x = 0.0;
        break;
      case KEYCODE_UP:
      case KEYCODE_W:
      case KEYCODE_DOWN:
      case KEYCODE_S:
        this.y = 0.0;
        break;
    }

    checkInput();
  };
}

KeyboardController.prototype.start = function() {
  window.addEventListener('keydown', this.onKeyDown);
  window.addEventListener('keyup',   this.onKeyUp);
};

KeyboardController.prototype.stop = function() {
  window.removeEventListener('keydown', this.onKeyDown);
  window.removeEventListener('keyup',   this.onKeyUp);
};

KeyboardController.prototype.oninput = function() {};

return KeyboardController;

})();
