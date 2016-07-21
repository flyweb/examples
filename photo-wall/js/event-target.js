class EventTarget {
  dispatchEvent(name, data) {
    var events    = this._events || {};
    var listeners = events[name] || [];
    listeners.forEach((listener) => {
      listener.call(this, data);
    });
  }

  addEventListener(name, listener) {
    var events    = this._events = this._events || {};
    var listeners = events[name] = events[name] || [];
    if (listeners.find(fn => fn === listener)) {
      return;
    }

    listeners.push(listener);
  }

  removeEventListener(name, listener) {
    var events    = this._events || {};
    var listeners = events[name] || [];
    for (var i = listeners.length - 1; i >= 0; i--) {
      if (listeners[i] === listener) {
        listeners.splice(i, 1);
        return;
      }
    }
  }
}
