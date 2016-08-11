const BASE_URL = this.location.pathname.substring(0, this.location.pathname.lastIndexOf('/'));

this.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        BASE_URL + '/',
        BASE_URL + '/index.html',
        BASE_URL + '/favicon.ico',
        BASE_URL + '/client/',
        BASE_URL + '/client/index.html',
        BASE_URL + '/client/css/style.css',
        BASE_URL + '/client/img/texture-noise.png',
        BASE_URL + '/client/js/app.js',
        BASE_URL + '/client/js/button.js',
        BASE_URL + '/client/js/joystick.js',
        BASE_URL + '/client/js/keyboard.js',
        BASE_URL + '/client/js/motion.js',
        BASE_URL + '/css/style.css',
        BASE_URL + '/img/fullbar.png',
        BASE_URL + '/img/fullscreen.png',
        BASE_URL + '/img/loadingbar.png',
        BASE_URL + '/img/logo.png',
        BASE_URL + '/img/progresslogo.png',
        BASE_URL + '/js/server.js',
        BASE_URL + '/lib/UnityProgress.js',
        BASE_URL + '/Release/Build.datagz',
        BASE_URL + '/Release/Build.jsgz',
        BASE_URL + '/Release/Build.memgz',
        BASE_URL + '/Release/UnityLoader.js'
      ]);
    })
  );
});

this.addEventListener('fetch', (evt) => {
  var response = caches.match(evt.request)
    .catch(() => {
      return fetch(evt.request);
    })
    .then((response) => {
      caches.open('v1').then((cache) => {
        cache.put(evt.request, response);
      });

      return response.clone();
    })
    .catch((error) => {
      return new Response('', { status: 404 });
    });

  evt.respondWith(response);
});
