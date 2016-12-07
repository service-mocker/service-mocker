export async function eventWaitUntil(target, event, comparer) {
  return new Promise((resolve) => {
    target.addEventListener(event, function handler(evt) {
      if (comparer(evt)) {
        target.removeEventListener(event, handler);
        resolve(evt);
      }
    });
  });
}
