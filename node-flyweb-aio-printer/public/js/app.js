document.addEventListener('DOMContentLoaded', function() {
  const SCAN_AREA_WIDTH_MM = 215.9;
  const SCAN_AREA_HEIGHT_MM = 297.011;
  const PREVIEW_ASPECT_RATIO = SCAN_AREA_WIDTH_MM / SCAN_AREA_HEIGHT_MM;

  var canvas = new fabric.Canvas('preview-canvas');
  var image = new fabric.Image();

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

  canvas.add(selection);
  canvas.setBackgroundImage(image);

  canvas.observe('object:scaling', function(evt) {
    var obj = evt.target;
    if (obj.scaleX * obj.width  >= canvas.width) {
      obj.setScaleX(canvas.width / obj.width);
    }

    if (obj.scaleY * obj.height >= canvas.height) {
      obj.setScaleY(canvas.height / obj.height);
    }

    constrainObjectInBounds(obj);
  });

  canvas.observe('object:moving', function(evt) {
    var obj = evt.target;
    if (obj.height > canvas.height ||
        obj.width  > canvas.width) {
      return;
    }

    constrainObjectInBounds(obj);
  });

  updateCanvasDimensions();

  var scanButton = document.getElementById('scan-button');
  scanButton.addEventListener('click', function() {
    var pctLeft   = selection.left   / canvas.width;
    var pctTop    = selection.top    / canvas.height;
    var pctWidth  = selection.scaleX * selection.width  / canvas.width;
    var pctHeight = selection.scaleY * selection.height / canvas.height;
    
    var mmLeft   = pctLeft   * SCAN_AREA_WIDTH_MM;
    var mmTop    = pctTop    * SCAN_AREA_HEIGHT_MM;
    var mmWidth  = pctWidth  * SCAN_AREA_WIDTH_MM;
    var mmHeight = pctHeight * SCAN_AREA_HEIGHT_MM;

    var link = document.createElement('a');
    link.href = '/api/scanner/scan?l=' + mmLeft + '&t=' + mmTop + '&x=' + mmWidth + '&y=' + mmHeight + '&d=' + Date.now();
    link.download = 'Scan.jpg';
    document.body.appendChild(link);
    link.click();

    setTimeout(function() {
      document.body.removeChild(link);
    });
  });

  var previewButton = document.getElementById('preview-button');
  previewButton.addEventListener('click', function() {
    image.setSrc('/api/scanner/preview?d=' + Date.now(), canvas.renderAll.bind(canvas), {
      width:  canvas.width,
      height: canvas.height
    });
  });

  window.addEventListener('resize', updateCanvasDimensions);

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

    var height = viewportMin - 100;
    var width  = height * PREVIEW_ASPECT_RATIO;

    canvas.setHeight(height);
    canvas.setWidth(width);
    image.set('height', height);
    image.set('width', width);
  }
});

