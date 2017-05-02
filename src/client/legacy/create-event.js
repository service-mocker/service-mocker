/* istanbul ignore next */
/**
 * Create custom event
 *
 * @param  {string} name event name
 * @return {Event}
 */
export function createEvent(name) {
  try {
    return new Event(name);
  } catch (e) {
    const event = document.createEvent('Event');
    event.initEvent(name, false, false);
    return event;
  }
}
