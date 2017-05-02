/**
 * Comparer function
 *
 * @callback comparer
 * @param {Event} event Event object
 * @return {boolean}
 */

/**
 * Wait until an event matches given conditions
 *
 * @param  {any}      target   Event target
 * @param  {string}   event    Event name
 * @param  {comparer} comparer Comparer function
 * @return {Promise<Event>}
 */
export function eventWaitUntil(target, event, comparer) {
  return new Promise((resolve) => {
    target.addEventListener(event, function handler(evt) {
      if (comparer(evt)) {
        target.removeEventListener(event, handler);
        resolve(evt);
      }
    });
  });
}
