var photoStore = new PhotoStore();

$(() => {
  var $cardColumns = $('#card-columns');

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
