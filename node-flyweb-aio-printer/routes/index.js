var express = require('express');
var router = express.Router();

var spawn = require('child_process').spawn;
var tmp = require('tmp');
var fs = require('fs');

/* GET / */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'HP All-In-One'
  });
});

router.get('/api/scanner/preview', function(req, res, next) {
  var params = {
    mode: 'Color',
    resolution: '75'
  };

  var tmpFile = tmp.fileSync({ postfix: '.jpg' });
  var tmpFileStream = fs.createWriteStream(tmpFile.name);

  var scanimage = spawn('scanimage', [
      '--mode', params.mode,
      '--resolution', params.resolution,
      '--progress'
    ]);
  var pnmtojpeg = spawn('pnmtojpeg');

  scanimage.stdout.pipe(pnmtojpeg.stdin);

  scanimage.stderr.on('data', function(data) {
    console.log(data);
  });

  scanimage.on('close', function(code, signal) {
    if (code !== 0) {
      res.sendStatus(500);
    }

    pnmtojpeg.stdin.end();
    res.sendFile(tmpFile.name);
  });

  pnmtojpeg.stdout.pipe(tmpFileStream);
});

router.get('/api/scanner/scan', function(req, res, next) {
  var params = {
    mode: 'Color',
    resolution: '300',
    l: req.query.l,
    t: req.query.t,
    x: req.query.x,
    y: req.query.y
  };

  var tmpFile = tmp.fileSync({ postfix: '.jpg' });
  var tmpFileStream = fs.createWriteStream(tmpFile.name);

  var scanimage = spawn('scanimage', [
      '--mode', params.mode,
      '--resolution', params.resolution,
      '-l', params.l,
      '-t', params.t,
      '-x', params.x,
      '-y', params.y,
      '--progress'
    ]);
  var pnmtojpeg = spawn('pnmtojpeg');

  scanimage.stdout.pipe(pnmtojpeg.stdin);

  scanimage.stderr.on('data', function(data) {
    console.log(data);
  });

  scanimage.on('close', function(code, signal) {
    if (code !== 0) {
      res.sendStatus(500);
    }

    pnmtojpeg.stdin.end();
    res.sendFile(tmpFile.name);
  });

  pnmtojpeg.stdout.pipe(tmpFileStream);
});

module.exports = router;
