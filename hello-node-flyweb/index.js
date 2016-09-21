var http = require('http');
var mdns = require('mdns');

var port = parseInt(process.env.PORT || '3000');

var server = http.createServer(function(request, response) {
  var html = '<h1>Hello FlyWeb from Node JS!</h1>' + 
             '<h3>You requested: ' + request.url + '</h3>';

  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.end(html);
});

var advertisement = mdns.createAdvertisement(mdns.tcp('flyweb'), port, {
  name: 'Hello Node FlyWeb'
});

server.listen(port, function() {
  console.log('Server listening on port ' + port);
  advertisement.start();
});
