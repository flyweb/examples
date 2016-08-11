const BASE_URL = this.location.pathname.substring(0, this.location.pathname.lastIndexOf('/'));

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(BASE_URL + '/sw.js', { scope: BASE_URL + '/' })
    .then((registration) => {
      if (registration.installing) {
        console.log('Service Worker installing');
      } else if (registration.waiting) {
        console.log('Service Worker installed');
      } else if (registration.active) {
        console.log('Service Worker active');
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

var connectedPlayers = {
  1: false,
  2: false,
  3: false,
  4: false
};

function setThrottle(player, value) {
  window.SendMessage('Car-' + player, 'SetThrottle', value);
}

function setSteering(player, value) {
  window.SendMessage('Car-' + player, 'SetSteering', value);
}

function join() {
  for (var id in connectedPlayers) {
    if (!connectedPlayers[id]) {
      window.SendMessage('Car-' + id, 'Join');
      connectedPlayers[id] = true;
      return id;
    }
  }
}

function leave(id) {
  if (!id) {
    return;
  }

  window.SendMessage('Car-' + id, 'Leave');
  connectedPlayers[id] = false;
}

function startServer() {
  if (navigator.publishServer) {
    navigator.publishServer('FlyWeb GP')
      .then((server) => {
        server.onfetch = (evt) => {
          var urlParts = evt.request.url.split('?');
          
          var url = urlParts[0];
          var params = new URLSearchParams(urlParts[1]);

          switch (url) {
            /**
             * Otherwise, assume that a static asset for the remote FlyWeb page
             * has been requested. In order to serve the request, we re-fetch
             * the requested URL from our own host from the "/client" path.
             */
            default:
              // XXX: Ideally, we should be able to just pass the result of the
              // `fetch()` call directly to `respondWith()`. However, this will
              // not work if the page hosting the FlyWeb server is on a host
              // using HTTP compression (e.g. GitHub Pages). Once HTTP
              // compression is supported, this can all be reduced to a single
              // line of code:
              //
              // evt.respondWith(fetch(url));
              //

              var contentType;
              fetch(BASE_URL + "/client" + url)
                .then((response) => {
                  contentType = response.headers.get('Content-Type');
                  return response.blob();
                })
                .then((blob) => {
                  evt.respondWith(new Response(blob, {
                    headers: {
                      'Content-Type': contentType
                    }
                  }));
                });
              break;
          }
        };

        server.onwebsocket = (evt) => {
          var url = evt.request.url;
          if (url === '/api/controller') {
            acceptSocket(evt);
          }
        };
      })
      .catch((error) => {
        console.error(error);
      });
  } else {
    console.warn('FlyWeb not supported or enabled in this browser');
  }
}

function acceptSocket(websocketEvent) {
  var playerId;
  var socketCloseTimeout;

  var onCrash = (evt) => {
    if (evt.detail === 'Car-' + playerId) {
      socket.send('CRASH');
    }
  };
  
  var socket = websocketEvent.accept();
  socket.onopen = (evt) => {
    playerId = join();
    socketCloseTimeout = setTimeout(closeSocket, 10000);

    window.addEventListener('crash', onCrash);
  };

  socket.onclose = (evt) => {
    if (playerId) {
      leave(playerId);

      window.removeEventListener('crash', onCrash);
    }
  };

  socket.onerror = (evt) => {
    if (playerId) {
      leave(playerId);

      window.removeEventListener('crash', onCrash);
    }

    socket.close();
  };

  socket.onmessage = (evt) => {
    clearTimeout(socketCloseTimeout);
    socketCloseTimeout = setTimeout(closeSocket, 10000);

    var message = evt.data;
    if (message === 'KA') {
      return;
    }

    var input = JSON.parse(message);

    if (input.x !== undefined) {
      setSteering(playerId, input.x);
    }

    if (input.y !== undefined) {
      setThrottle(playerId, input.y);
    }
  };

  function closeSocket() {
    socket.close();
  }
}

window.addEventListener('gameready', () => {
  startServer();
});
