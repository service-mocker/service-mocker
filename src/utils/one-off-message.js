export async function oneOffMessage({
  target,
  body,
  timeout = 3 * 1e3,
} = {}) {
  const { port1, port2 } = new MessageChannel();

  return new Promise((resolve, reject) => {
    const timer = timeout && setTimeout(() => {
      reject(new Error(`messaging timeout: ${JSON.stringify(body)}`));
    }, timeout);

    port1.onmessage = (evt) => {
      clearTimeout(timer);

      // avoid high transient memory usage
      // see <https://html.spec.whatwg.org/multipage/comms.html#message-channels>
      port1.onmessage = null;
      port1.close();
      port2.close();

      resolve(evt.data);
    };

    if (target === self.window) {
      // legacy mode
      target.postMessage(body, '*', [port2]);
    } else {
      target.postMessage(body, [port2]);
    }
  });
}
