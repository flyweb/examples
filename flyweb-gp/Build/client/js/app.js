var webSocket;
var keepAliveInterval;

var joystick      = document.getElementById('joystick');
var forwardButton = document.getElementById('forward');
var reverseButton = document.getElementById('reverse');
var mode          = document.getElementById('mode');

var useJoystick = mode.checked;
joystick.hidden = !useJoystick;

var controllerState = {
  x: 0.0,
  y: 0.0
};

var sendControllerData = throttle(() => {
  if (webSocket) {
    webSocket.send(JSON.stringify(controllerState));
  }
}, 100);

document.addEventListener('DOMContentLoaded', () => {
  var ws = new WebSocket('ws://' + window.location.host + '/api/controller');
  ws.onopen = () => {
    webSocket = ws;

    keepAliveInterval = setInterval(() => {
      if (webSocket) {
        webSocket.send('KA');
      }
    }, 5000);
  };

  ws.onmessage = (evt) => {
    var message = evt.data;
    if (message === 'CRASH') {
      navigator.vibrate(200);
    }
  }

  // Trigger the Vibration API permission prompt in advance
  navigator.vibrate(1);
});

var keyboardController = new KeyboardController();
keyboardController.oninput = function(input) {
  controllerState.x = input.x;
  controllerState.y = input.y;

  sendControllerData();
};

var joystickController = new JoystickController(joystick);
joystickController.oninput = function(input) {
  if (!useJoystick) {
    return;
  }

  controllerState.x = clamp(input.x / 0.75, -1.0, 1.0);

  sendControllerData();
};

var motionController = new MotionController('y');
motionController.oninput = function(value) {
  if (useJoystick) {
    return;
  }

  controllerState.x = value;

  sendControllerData();
};

var forwardController = new ButtonController(forwardButton);
forwardController.oninput = function(value) {
  controllerState.y = value ? 1.0 : 0.0;

  sendControllerData();
}

var reverseController = new ButtonController(reverseButton);
reverseController.oninput = function(value) {
  controllerState.y = value ? -1.0 : 0.0;

  sendControllerData();
}

mode.addEventListener('change', () => {
  useJoystick = mode.checked;
  joystick.hidden = !useJoystick;
});

keyboardController.start();
forwardController.start();
reverseController.start();
joystickController.start();
motionController.start();

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
};

function throttle(fn, ms) {
  var last = Date.now();
  var timeout;
  return (...args) => {
    var now = Date.now();
    if (now < last + ms) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        last = now;
        fn.apply(this, args);
      }, ms);
    }

    else {
      last = now;
      fn.apply(this, args);
    }
  };
}
