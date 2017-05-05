/**
 * Create custom event
 *
 * @param  {string} name event name
 * @return {Event}
 */
/* istanbul ignore next */
function createEvent(name) {
  try {
    return new Event(name);
  } catch (e) {
    const event = document.createEvent('Event');
    event.initEvent(name, false, false);
    return event;
  }
}

// Don't use `export function createEvent() {}`
// because `istanbul ignore next` has issue with ES6 exports
// <https://github.com/gotwarlost/istanbul/issues/762>
export { createEvent };
