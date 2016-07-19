var joystick;
var throttle;

var keepAliveInterval;

var ws = new WebSocket('ws://' + location.host + '/control');

ws.onopen = function() {
  keepAliveInterval = setInterval(function() {
    if (ws) {
      ws.send('KA');
    }
  }, 1000);
};

if ('ontouchstart' in window) {
  window.addEventListener('touchstart', function() {
    if (!window.fullScreen) {
      document.documentElement.mozRequestFullScreen();
      return false;
    }
  });

  document.addEventListener('mozfullscreenchange', function() {
    if (window.fullScreen) {
      screen.mozLockOrientation('landscape-primary');
    } else {
      screen.mozUnlockOrientation();
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  joystick = new Joystick(document.getElementById('joystick'));
  throttle = new Throttle(document.getElementById('throttle'));

  var controlState = {
    joystick: joystick.value,
    throttle: throttle.value
  };

  var sendControlState = limit(function() {
    var state = {
      x: truncate(joystick.value.x),
      y: truncate(joystick.value.y),
      throttle: truncate(throttle.value.y)
    };

    ws.send(JSON.stringify(state));
  }, 200);

  joystick.el.addEventListener('change', sendControlState);
  throttle.el.addEventListener('change', sendControlState);

  document.getElementById('calibrate').addEventListener('click', function() {
    ws.send('CALIBRATE');
  });

  document.getElementById('takeoff').addEventListener('click', function() {
    ws.send('TAKEOFF');
  });

  document.getElementById('land').addEventListener('click', function() {
    ws.send('LAND');
  });

  // Emergency land on ESC
  window.addEventListener('keydown', function(evt) {
    if (evt.keyCode === 27) {
      ws.send(JSON.stringify({ x: 0, y: 0, throttle: 0 }));
      ws.send(JSON.stringify({ x: 0, y: 0, throttle: 0 }));
      ws.send(JSON.stringify({ x: 0, y: 0, throttle: 0 }));
      ws.send(JSON.stringify({ x: 0, y: 0, throttle: 0 }));
      ws.send(JSON.stringify({ x: 0, y: 0, throttle: 0 }));
    }
  });

  function limit(fn, ms) {
    var last = Date.now();
    var timeout;
    return function() {
      var args = arguments;
      var now = Date.now();
      if (now < last + ms) {
        clearTimeout(timeout);
        timeout = setTimeout(function() {
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

  function truncate(value) {
    return parseFloat(value.toFixed(4));
  }
});
