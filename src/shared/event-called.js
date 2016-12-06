export async function eventCalled(target, event, timeout) {
  return new Promise((resolve) => {
    const done = (result) => {
      target.removeEventListener(event, done);
      clearTimeout(timer);
      resolve(result);
    };

    const timer = timeout && setTimeout(() => {
      done(null);
    }, timeout);

    target.addEventListener(event, done);
  });
}
