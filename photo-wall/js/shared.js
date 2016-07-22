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

function fixImageOrientation(file) {
  return new Promise((resolve) => {
    if (file.type !== 'image/jpeg') {
      resolve(file);
      return;
    }

    EXIF.getData(file, function() {
      var orientation = EXIF.getTag(this, 'Orientation');
      if (!orientation || orientation === 1) {
        resolve(file);
        return;
      }

      var image = new Image;

      image.onload = () => {
        var canvas = document.createElement('canvas');
        canvas.width  = image.width;
        canvas.height = image.height;

        var ctx = canvas.getContext('2d');
        ctx.save();
        
        var width       = canvas.width;
        var height      = canvas.height;
        var styleWidth  = canvas.style.width;
        var styleHeight = canvas.style.height;
        
        if (orientation) {
          if (orientation > 4) {
            canvas.width        = height;
            canvas.height       = width;
            canvas.style.width  = styleHeight;
            canvas.style.height = styleWidth;
          }

          switch (orientation) {
            case 2:
              ctx.translate(width, 0);
              ctx.scale(-1, 1);
              break;
            case 3:
              ctx.translate(width, height);
              ctx.rotate(Math.PI);
              break;
            case 4:
              ctx.translate(0, height);
              ctx.scale(1, -1);
              break;
            case 5:
              ctx.rotate(0.5 * Math.PI);
              ctx.scale(1, -1);
              break;
            case 6:
              ctx.rotate(0.5 * Math.PI);
              ctx.translate(0, -height);
              break;
            case 7:
              ctx.rotate(0.5 * Math.PI);
              ctx.translate(width, -height);
              ctx.scale(-1, 1);
              break;
            case 8:
              ctx.rotate(-0.5 * Math.PI);
              ctx.translate(-width, 0);
              break;
          }
        }

        ctx.drawImage(image, 0, 0);
        ctx.restore();

        canvas.toBlob(blob => resolve(blob), 'image/jpeg');

        URL.revokeObjectURL(image.src);
      };

      image.src = URL.createObjectURL(file);
    });
  });
}
