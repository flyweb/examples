var photoStore = new PhotoStore();

$(() => {
  var $body          = $(document.body);
  var $cardColumns   = $('#card-columns');
  var $fixedElements = $('.fixed-bottom');

  var isZoomed = false;
  var isZooming = false;

  $cardColumns.on('click', 'a', (evt) => {
    evt.preventDefault();

    if (isZooming) {
      return;
    }

    isZooming = true;

    if (isZoomed) {
      zoom.out({
        callback() {
          $body.removeClass('zoom');
          $fixedElements.fadeIn(100);

          isZoomed = false;
          isZooming = false;
        }
      });
    }

    else {      
      $fixedElements.fadeOut(100, () => {
        $body.addClass('zoom');

        zoom.to({
          element: evt.target,
          callback() {
            isZoomed = true;
            isZooming = false;
          }
        });
      });
    }
  });

  photoStore.addEventListener('add', (evt) => {
    var photo = photoStore.get(evt.id);
    var url = URL.createObjectURL(photo);

    $cardColumns.append(
      '<a class="card">' +
        '<img class="card-img img-fluid img-thumbnail" src="' + url + '">' +
      '</a>'
    );

    setTimeout(() => URL.revokeObjectURL(url));
  });
});
