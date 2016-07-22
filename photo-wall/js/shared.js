var photoStore = new PhotoStore();
var photoSwipe;

$(() => {
  var $body          = $(document.body);
  var $cardColumns   = $('#card-columns');
  var $fixedElements = $('.fixed-bottom');
  var $photoSwipe    = $('.pswp');

  $cardColumns.on('click', 'a', (evt) => {
    evt.preventDefault();

    var $target  = $(evt.currentTarget);
    var position = $target.position();
    var width    = $target.width();
    var index    = $cardColumns.children().index($target);
    var items    = getPhotoSwipeItems();

    photoSwipe = new PhotoSwipe($photoSwipe[0], PhotoSwipeUI_Default, items, {
      index: index,
      captionEl: false,
      shareEl: false,
      preloaderEl: false,
      getThumbBoundsFn() {
        return {
          x: position.left,
          y: position.top,
          w: width
        };
      }
    });
    
    photoSwipe.init();
  });

  photoStore.addEventListener('add', (evt) => {
    var photo = photoStore.get(evt.id);
    var url = URL.createObjectURL(photo);

    $cardColumns.append(
      '<a class="card">' +
        '<img class="card-img img-fluid img-thumbnail" src="' + url + '">' +
      '</a>'
    );
  });

  function getPhotoSwipeItems() {
    return $cardColumns.find('img').toArray().map((img) => {
      return {
        src: img.src,
        w:   img.naturalWidth,
        h:   img.naturalHeight
      };
    });
  }
});
