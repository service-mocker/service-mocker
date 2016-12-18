export function createEvent(from: any, name: string): any {
  let event: any;

  try {
    event = new Event(name);
  } catch (e) {
    event = document.createEvent('Event');
    event.initEvent(name, false, false);
  }

  Object.defineProperties(event, {
    srcElement: {
      value: from,
      writable: false,
      enumerable: true,
      configurable: true,
    },
    target: {
      value: from,
      writable: false,
      enumerable: true,
      configurable: true,
    },
  });

  return event;
}
