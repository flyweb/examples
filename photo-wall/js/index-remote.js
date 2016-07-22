var socket;

$(() => {
  var $fileInput = $('#file-input');
  $fileInput.on('change', (evt) => {
    var photos = [].slice.apply(evt.target.files);
    photos.forEach((photo) => {
      fixImageOrientation(photo)
        .then((fixedPhoto) => {
          var xhr = new XMLHttpRequest();
          xhr.open('POST', '/api/upload', true);
          xhr.send(fixedPhoto);
        });
    });
  });

  fetch('/api/photos')
    .then(response => response.json())
    .then((photos) => {
      photos.forEach(photo => addRemotePhotoById(photo.id));
    });

  openSocket();
});

function addRemotePhotoById(id) {
  fetch('/api/photos?id=' + id)
    .then(response => response.blob())
    .then(blob => photoStore.add(blob, id));
}

function openSocket() {
  socket = new WebSocket('ws://' + window.location.host + '/api/ws');
  socket.onopen = (evt) => {
    console.log('socket.onopen()', evt);
  };

  socket.onclose = (evt) => {
    console.log('socket.onclose()', evt);
  };

  socket.onerror = (evt) => {
    console.log('socket.onerror()', evt);
    socket.close();
  }

  socket.onmessage = (evt) => {
    console.log('socket.onmessage()', evt);

    var message = JSON.parse(evt.data);
    if (!message) {
      return;
    }

    switch (message.event) {
      case 'add':
        addRemotePhotoById(message.data.id);
        break;
      default:
        console.warn('Unknown event type: ' + message.event);
        break;
    }
  };
}
