
function LOG() {
  var text_array = [];
  for (var i = 0; i < arguments.length; i++) {
    text_array.push("" + arguments[i]);
  }
  var text = text_array.join('');
  var lines = text.split("\n");

  var log_div = document.getElementById('log');
  var logentry_div = document.createElement('div');
  logentry_div.setAttribute('class', 'logentry');
  lines.forEach(function (line) {
    var logentry_text = document.createTextNode(line);
    var br = document.createElement('br');
    logentry_div.appendChild(logentry_text);
    logentry_div.appendChild(br);
  });
  if (log_div.children.length == 0) {
    log_div.appendChild(logentry_div);
  } else {
    log_div.insertBefore(logentry_div, log_div.children[0]);
  }
}

function main() {
  LOG("Loaded.");

  fetch("/files").then(function (resp) {
    LOG("Got response to fetch /files");
    return resp.json();
  }).then(function (json) {
    LOG("Got response to files: " + JSON.stringify(json));
    showAvailableFiles(json.files);
  }).catch(function (err) {
    LOG("Fetch of /files failed: " + err);
  });
}

function showAvailableFiles(files) {
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    showFile(file);
  }
}

function showFile(file) {
  LOG("Showing file: " + file.name);
  var elem = document.createElement('div');
  elem.setAttribute('class', 'availableFile');
  elem.innerHTML = "" + file.name + " (" + file.size + ")";


  elem.appendChild(document.createElement('br'));

  var a = document.createElement('a');
  a.setAttribute('href', "/file/" + file.id);
  a.innerHTML = "DOWNLOAD";
  elem.appendChild(a);

  var avail = document.getElementById('avail');
  avail.appendChild(elem);
}
