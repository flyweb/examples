class PhotoStore extends EventTarget {
  constructor() {
    super();

    this._photos = [];
  }

  add(photo, id) {
    if (!id) {
      id = this._photos.length;
    }

    this._photos[id] = photo;
    this.dispatchEvent('add', { id: id });
  }

  get(id) {
    return this._photos[id];
  }

  list() {
    var list = [];
    for (var i = 0; i < this._photos.length; i++) {
      if (this._photos[i]) {
        list.push({ id: i });
      }
    }

    return list;
  }
}
