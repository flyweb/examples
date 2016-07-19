module.exports = function(server) {

  var X_SCALE        = 0.5;
  var Y_SCALE        = 0.5;
  var THROTTLE_SCALE = 0.25;

  var arDrone = require('ar-drone');
  var ws = new require('ws').Server({
    server: server,
    path: '/control'
  });

  // XXX: Use for connecting to real drone.
  // var client = arDrone.createClient();

  // XXX: Use for simulating drone.
  var client = {
    after: function(ms, callback) {
      setTimeout(callback, ms);
    },
    calibrate: function(id) {
      console.log('client.calibrate(' + id + ')');
    },
    takeoff: function(callback) {
      console.log('client.takeoff()');
      setTimeout(callback, 1000);
    },
    land: function(callback) {
      console.log('client.land()');
      setTimeout(callback, 1000);
    },
    stop: function() {
      console.log('client.stop()');
    },
    up: function(speed) {
      console.log('client.up(' + speed + ')');
    },
    clockwise: function(speed) {
      console.log('client.clockwise(' + speed + ')');
    },
    front: function(speed) {
      console.log('client.front(' + speed + ')');
    }
  };

  var emergencyLandTimeout;

  ws.on('connection', function(ws) {
    ws.on('message', function(data) {
      clearTimeout(emergencyLandTimeout);
      emergencyLandTimeout = setTimeout(emergencyLand, 2000);

      if (data === 'KA') {
        return;
      }

      if (data === 'CALIBRATE') {
        client.stop();
        client.calibrate(0);
        return;
      }

      if (data === 'TAKEOFF') {
        client.stop();
        client.takeoff(function() {
          client.after(1000, function() {
            client.stop();
          });
        });
        return;
      }

      if (data === 'LAND') {
        client.stop();
        client.land();
        return;
      }

      var state = JSON.parse(data);
      state.x        *= X_SCALE;
      state.y        *= Y_SCALE;
      state.throttle *= THROTTLE_SCALE;

      client.up(state.throttle);
      client.clockwise(state.x);
      client.front(state.y);
    });

    console.log('WebSocket connection established');
  });

  function emergencyLand() {
    client.stop();
    client.land();
  }

}
