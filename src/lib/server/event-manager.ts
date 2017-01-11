/**
 * Event listeners MUST be added on the initial evaluation of worker scripts,
 * we need to delegate them for lazy evaluation.
 */
const nativeEventListeners: any = {};
const customEventListeners: any = {};

/* istanbul ignore else: unable to report coverage from sw context */
if (self === self.window) {
  // only need to wrap fetch event for legacy server
  nativeEventListeners.fetch = [];
} else {
  Object.keys(self)
    .filter(prop => /^on/.test(prop))
    .forEach(prop => {
      const type = prop.replace(/^on/, '');

      nativeEventListeners[type] = [];
    });
}

// prehandle native events
Object.keys(nativeEventListeners).forEach((type) => {
  self.addEventListener(type, (event) => {
    nativeEventListeners[type].forEach((fn) => {
      fn(event);
    });
  });
});

export const EventManager = {
  on(type: string, listener: EventListener): void {
    if (!nativeEventListeners.hasOwnProperty(type)) {
      if (!customEventListeners.hasOwnProperty(type)) {
        customEventListeners[type] = [];
      }

      customEventListeners[type].push(listener);

      return;
    }

    nativeEventListeners[type].push(listener);
  },

  off(type: string, listener?: EventListener): void {
    const all = nativeEventListeners[type] || customEventListeners[type];

    /* istanbul ignore if */
    if (!all) {
      return;
    }

    if (!listener) {
      all.length = 0;
      return;
    }

    all.some((fn, idx) => {
      return fn === listener && all.splice(idx, 1);
    });
  },

  emit(event: Event): void {
    const type = event.type;

    /* istanbul ignore else */
    if (nativeEventListeners.hasOwnProperty(type)) {
      self.dispatchEvent(event);
    } else if (customEventListeners.hasOwnProperty(type)) {
      customEventListeners[type].forEach((listener) => {
        listener(event);
      });
    }
  },
};
