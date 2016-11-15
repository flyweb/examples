$(function() {
  $.material.init();

  const SCAN_AREA_WIDTH_MM = 215.9;
  const SCAN_AREA_HEIGHT_MM = 297.011;
  const PREVIEW_ASPECT_RATIO = SCAN_AREA_WIDTH_MM / SCAN_AREA_HEIGHT_MM;

  var previewCanvas = new fabric.Canvas('preview-canvas');
  var previewImage = new fabric.Image();

  var selection = new fabric.Rect({
    fill: 'rgba(255,255,255,.75)',
    cornerColor: 'rgba(0,0,0,.95)',
    cornerStrokeColor: 'rgba(255,255,255,.95)',
    transparentCorners: false,
    hasRotatingPoint: false,
    lockScalingFlip: true,
    lockUniScaling: false,
    left: 10,
    top: 10,
    width: 50,
    height: 50
  });

  previewCanvas.add(selection);
  previewCanvas.setBackgroundImage(previewImage);

  previewCanvas.observe('object:scaling', function(evt) {
    var obj = evt.target;
    if (obj.scaleX * obj.width  >= previewCanvas.width) {
      obj.setScaleX(previewCanvas.width / obj.width);
    }

    if (obj.scaleY * obj.height >= previewCanvas.height) {
      obj.setScaleY(previewCanvas.height / obj.height);
    }

    constrainObjectInBounds(obj);
  });

  previewCanvas.observe('object:moving', function(evt) {
    var obj = evt.target;
    if (obj.height > previewCanvas.height ||
        obj.width  > previewCanvas.width) {
      return;
    }

    constrainObjectInBounds(obj);
  });

  var isPreviewCancelled = false;

  $('#preview-button').on('click', function() {
    isPreviewCancelled = false;

    var img = new Image();
    img.onload = function() {
      if (isPreviewCancelled) {
        return;
      }

      previewImage.setSrc(img.src, previewCanvas.renderAll.bind(previewCanvas), {
        width:  previewCanvas.width,
        height: previewCanvas.height
      });

      $('#preview-modal').modal('hide');
    };
    img.onerror = function() {
      $('#preview-modal').modal('hide');
      $.snackbar({ content: 'An error occurred while acquiring the preview' });
    };

    img.src = '/api/scanner/preview?d=' + Date.now();
  });

  $('#preview-cancel-button').on('click', function() {
    isPreviewCancelled = true;
  });

  var isScanCancelled = false;

  $('#scan-button').on('click', function() {
    isScanCancelled = false;

    var pctLeft   = selection.left   / previewCanvas.width;
    var pctTop    = selection.top    / previewCanvas.height;
    var pctWidth  = selection.scaleX * selection.width  / previewCanvas.width;
    var pctHeight = selection.scaleY * selection.height / previewCanvas.height;
    
    var mmLeft   = pctLeft   * SCAN_AREA_WIDTH_MM;
    var mmTop    = pctTop    * SCAN_AREA_HEIGHT_MM;
    var mmWidth  = pctWidth  * SCAN_AREA_WIDTH_MM;
    var mmHeight = pctHeight * SCAN_AREA_HEIGHT_MM;

    var img = new Image();
    img.onload = function() {
      if (isScanCancelled) {
        return;
      }

      var canvas = document.createElement('canvas');
      canvas.width  = img.width;
      canvas.height = img.height;

      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(function(blob) {
        var url = URL.createObjectURL(blob);
        var $link = $('<a href="' + url + '" download="Scan.jpg"/>');
        
        $link.appendTo(document.body)[0].click();

        $('#scan-modal').modal('hide');

        setTimeout(function() {
          $link.remove();
        });
      }, 'image/jpeg');
    };
    img.onerror = function() {
      $('#scan-modal').modal('hide');
      $.snackbar({ content: 'An error occurred while scanning' });
    };

    img.src = '/api/scanner/scan?l=' + mmLeft + '&t=' + mmTop + '&x=' + mmWidth + '&y=' + mmHeight + '&d=' + Date.now();
  });

  $('#scan-cancel-button').on('click', function() {
    isScanCancelled = true;
  });

  $(window).on('resize', updateCanvasDimensions);
  updateCanvasDimensions();

  function constrainObjectInBounds(obj) {
    obj.setCoords();

    if (obj.getBoundingRect().top  < 0 ||
        obj.getBoundingRect().left < 0) {
      obj.top  = Math.max(obj.top,  obj.top  - obj.getBoundingRect().top);
      obj.left = Math.max(obj.left, obj.left - obj.getBoundingRect().left);
    }

    if (obj.getBoundingRect().top  + obj.getBoundingRect().height > obj.canvas.height ||
        obj.getBoundingRect().left + obj.getBoundingRect().width  > obj.canvas.width) {
      obj.top  = Math.min(obj.top,  obj.canvas.height - obj.getBoundingRect().height + obj.top  - obj.getBoundingRect().top);
      obj.left = Math.min(obj.left, obj.canvas.width  - obj.getBoundingRect().width  + obj.left - obj.getBoundingRect().left);
    }
  }

  function updateCanvasDimensions() {
    var viewportMin = Math.min(window.innerWidth, window.innerHeight);

    var height = viewportMin - 128;
    var width  = height * PREVIEW_ASPECT_RATIO;

    previewCanvas.setHeight(height);
    previewCanvas.setWidth(width);
    previewImage.set('height', height);
    previewImage.set('width', width);
  }
});

