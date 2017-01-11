/**
 * Event listeners MUST be added on the initial evaluation of worker scripts,
 * we need to delegate them for lazy evaluation.
 */
const eventListeners = {};

/* istanbul ignore if: unable to report coverage from sw context */
if (!self.hasOwnProperty('window')) {
  // DON'T use `Object.keys()` here, there're some inherited props like `onerror`
  for (let prop in self) {
    if (/^on/.test(prop)) {
      const type = prop.replace(/^on/, '');
      eventListeners[type] = [];
    }
  }

  // prehandle native events for service worker
  Object.keys(eventListeners).forEach((type) => {
    self.addEventListener(type, (event) => {
      eventListeners[type].forEach((listener) => {
        listener(event);
      });
    });
  });
}

/* istanbul ignore next */
export function delegateEvent(type: string, listener: EventListener): void {
  const stack = eventListeners[type];

  if (!stack) {
    return self.addEventListener(type, listener);
  }

  stack.push(listener);
}

/* istanbul ignore next */
export function clearWorkerEventListeners(): void {
  Object.keys(eventListeners).forEach((type) => {
    eventListeners[type].length = 0;
  });
}
