const defaultColor = 'dodgerblue';

const colorPresets = {
  log: defaultColor,
  info: defaultColor,
  warn: 'goldenrod',
  error: 'crimson',
};

class PrefixedConsole {
  constructor(namespace = 'mocker', color = colorPresets.log) {
    this._namespace = namespace;
    this._color = color;
  }

  color(c) {
    return new PrefixedConsole(`${this._namespace}`, c);
  }

  scope(ns) {
    return new PrefixedConsole(`${this._namespace}:${ns}`);
  }
}

const proto = PrefixedConsole.prototype;

[
  'log',
  'info',
  'warn',
  'error',
].forEach(method => {
  Object.defineProperty(proto, method, {
    value: function (msg, ...rest) {
      const {
        _namespace,
        _color,
      } = this;

      let head = `%c[${_namespace}]%c`;

      if (/%c/.test(msg)) {
        head = `${head} ${msg}`;
      } else {
        rest.unshift(msg);
      }

      const color = _color === defaultColor ? colorPresets[method] : _color;

      console[method](head, `color: ${color}`, `color: #000`, ...rest);

      return this;
    },
    enumerable: false,
    writable: true,
    configurable: true,
  });
});

Object.keys(console)
  .filter(method => !proto.hasOwnProperty(method))
  .forEach(method => {
    Object.defineProperty(proto, method, {
      value: function (...args) {
        console[method](`[${this._namespace}]`, ...args);

        return this;
      },
      enumerable: false,
      writable: true,
      configurable: true,
    });
  });

export const debug = new PrefixedConsole();
