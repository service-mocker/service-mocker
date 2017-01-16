/* istanbul ignore next */
export function createEvent(name: string): any {
  try {
    return new Event(name);
  } catch (e) {
    const event = document.createEvent('Event');
    event.initEvent(name, false, false);
    return event;
  }
}
