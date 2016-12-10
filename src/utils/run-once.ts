const symbol = typeof Symbol === 'function' ? Symbol('@runOnce') : '@runOnce';

export function runOnce(proto: any, key: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;

  descriptor.value = function wrapped(...args) {
    if (!this[symbol]) {
      Object.defineProperty(this, symbol, {
        value: {},
      });
    }

    const ns = this[symbol];

    if (ns.hasOwnProperty(key)) {
      return ns[key];
    }

    const result = method.apply(this, args);

    ns[key] = result;

    return result;
  };
}
