var UnityToWebGL = {
  DispatchEvent: function(eventNamePtr, eventDataPtr) {
    var eventName = Pointer_stringify(eventNamePtr);
    var eventData = Pointer_stringify(eventDataPtr);

    window.dispatchEvent(new CustomEvent(eventName, { detail: eventData }));
  }
};

mergeInto(LibraryManager.library, UnityToWebGL);
