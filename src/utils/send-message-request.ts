export type Message = {
  action: string,
  [key: string]: any,
};

// Client => Server
export async function sendMessageRequest(
  target: ServiceWorker | Window /* legacy mode */,
  message: Message,
  timeout?: number,
): Promise<any>;

// Server => Client
export async function sendMessageRequest(
  target: ServiceWorkerClient | Window /* legacy mode */,
  message: Message,
  timeout?: number,
): Promise<any>;

export async function sendMessageRequest(
  target,
  message,
  timeout = 3 * 1e3,
) {
  const { port1, port2 } = new MessageChannel();

  return new Promise((resolve, reject) => {
    const timer = timeout && setTimeout(() => {
      reject(new Error(`messaging timeout: ${JSON.stringify(message)}`));
    }, timeout);

    port1.onmessage = ({ data }) => {
      clearTimeout(timer);

      // avoid high transient memory usage, see
      // https://html.spec.whatwg.org/multipage/comms.html#ports-and-garbage-collection
      port1.close();
      port2.close();

      if (typeof data === 'object') {
        data.request = message.action;
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
