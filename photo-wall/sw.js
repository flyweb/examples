const BASE_URL = this.location.pathname.substring(0, this.location.pathname.lastIndexOf('/'));

this.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        BASE_URL + '/',
        BASE_URL + '/index.html',
        BASE_URL + '/favicon.ico',
        BASE_URL + '/css/styles.css',
        BASE_URL + '/css/vendor/bootstrap.min.css',
        BASE_URL + '/css/vendor/photoswipe/photoswipe.css',
        BASE_URL + '/css/vendor/photoswipe/default-skin/default-skin.css',
        BASE_URL + '/css/vendor/photoswipe/default-skin/default-skin.png',
        BASE_URL + '/css/vendor/photoswipe/default-skin/default-skin.svg',
        BASE_URL + '/css/vendor/photoswipe/default-skin/preloader.gif',
        BASE_URL + '/img/texture-noise.png',
        BASE_URL + '/js/event-target.js',
        BASE_URL + '/js/index-remote.js',
        BASE_URL + '/js/index.js',
        BASE_URL + '/js/photo-store.js',
        BASE_URL + '/js/shared.js',
        BASE_URL + '/js/vendor/exif.min.js',
        BASE_URL + '/js/vendor/jquery.min.js',
        BASE_URL + '/js/vendor/photoswipe/photoswipe-ui-default.min.js',
        BASE_URL + '/js/vendor/photoswipe/photoswipe.min.js'
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
