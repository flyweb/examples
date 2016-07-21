$(() => {
  var $fileInput = $('#file-input');
  $fileInput.on('change', (evt) => {
    var photos = [].slice.apply(evt.target.files);
    photos.forEach((photo) => {
      photoStore.add(photo);
    });
  });
});

if (navigator.publishServer) {
  navigator.publishServer('Photo Wall')
    .then((server) => {
      server.onfetch = (evt) => {
        var urlParts = evt.request.url.split('?');
        
        var url = urlParts[0];
        var params = new URLSearchParams(urlParts[1]);

        switch (url) {
          /**
           * If the requested URL is '/api/photos', respond with the photo with
           * the specified `id` query param. If no `id` query param is specified,
           * send back a JSON response with the complete listing of all photos.
           */
          case '/api/photos':
            var id = params.get('id');
            if (!id) {
              evt.respondWith(new Response(JSON.stringify(photoStore.list()), {
                headers: {
                  'Content-Type': 'application/json'
                },
                status: 200,
                statusText: 'OK'
              }));
              break;
            }

            var photo = photoStore.get(params.get('id'));
            evt.respondWith(new Response(photo, { status: 200, statusText: 'OK' }));
            break;

          /**
           * If the requested URL is '/api/upload', read the `Blob` from the request
           * body and add it to the photo store.
           */
          case '/api/upload':
            evt.request.blob()
              .then((photo) => {
                console.log(evt.request, photo);
                photoStore.add(photo);
              });

            evt.respondWith(new Response('', { status: 200, statusText: 'OK' }));
            break;

          /**
           * If the requested URL is '/js/index.js', respond with '/js/index-remote.js'
           * which contains client-specific logic instead.
           */
          case '/js/index.js':
            fetch('/js/index-remote.js')
              .then((response) => {
                return response.blob();
              })
              .then((blob) => {
                evt.respondWith(new Response(blob, {
                  headers: {
                    'Content-Type': 'text/javascript'
                  }
                }));
              });
            break;

          /**
           * Otherwise, assume that a static asset for the remote FlyWeb page
           * has been requested. In order to serve the request, we re-fetch
           * the requested URL from our own host.
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
            fetch(url)
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
        if (url === '/api/ws') {
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

function acceptSocket(evt) {
  var sendAddedPhotoID = (evt) => {
    socket.send(JSON.stringify({
      event: 'add',
      data: evt
    }));
  };

  var socket = evt.accept();
  socket.onopen = (evt) => {
    console.log('socket.onopen()', evt, socket);
    photoStore.addEventListener('add', sendAddedPhotoID);
  };

  socket.onclose = (evt) => {
    console.log('socket.onclose()', evt);
    photoStore.removeEventListener('add', sendAddedPhotoID);
  };

  socket.onerror = (evt) => {
    console.log('socket.onerror()', evt);
    photoStore.removeEventListener('add', sendAddedPhotoID);
    socket.close();
  }

  socket.onmessage = (evt) => {
    console.log('socket.onmessage()', evt);
  };
}
