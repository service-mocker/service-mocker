export function runOnce(proto: any, key: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;
  const symbol = `@runOnce/${key}`;

  descriptor.value = function wrapped(...args) {
    if (this[symbol]) {
      return this[symbol];
    }

    const result = method.apply(this, args);

    Object.defineProperty(this, symbol, {
      value: result,
    });

    return result;
  };
}
