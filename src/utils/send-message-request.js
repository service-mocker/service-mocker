/**
 * Send message and get the response
 *
 * @param  {any}    target  Message target
 * @param  {any}    message Message body
 * @param  {number} timeout Messaging timeout
 * @return {Promise<any>} Resolves with response message
 */
export async function sendMessageRequest(
  target,
  message,
  timeout = 3 * 1e3,
) {
  const { port1, port2 } = new MessageChannel();

  return new Promise((resolve, reject) => {
    const timer = isFinite(timeout) && setTimeout(() => {
      reject(new Error(`messaging timeout: ${JSON.stringify(message)}`));
    }, timeout);

    port1.onmessage = ({ data }) => {
      if (timer) {
        clearTimeout(timer);
      }

      // avoid high transient memory usage, see
      // https://html.spec.whatwg.org/multipage/comms.html#ports-and-garbage-collection
      port1.close();
      port2.close();

      /* istanbul ignore else */
      if (typeof data === 'object') {
        data.request = message;
      }

      if (data && data.error) {
        reject(data);
      } else {
        resolve(data);
      }
    };

    if (target === self.window) {
      // posting message to self => legacy mode
      // add `origin` param to `window.postMessage(message, targetOrigin, [transfer])`
      target.postMessage(message, '*', [port2]);
    } else {
      target.postMessage(message, [port2]);
    }
  });
}
