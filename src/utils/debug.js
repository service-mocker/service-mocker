const isIE = /Trident|Edge/.test(navigator.userAgent);

const defaultColor = 'dodgerblue';

const colorPresets = {
  log: defaultColor,
  info: defaultColor,
  warn: 'goldenrod',
  error: 'crimson',
};

export class PrefixedConsole {
  /**
   * Logger namespace
   *
   * @private
   * @type {string}
   */
  _namespace = 'mocker';

  /**
   * Logger color
   *
   * @private
   * @type {string}
   */
  _color = colorPresets.log;

  constructor(namespace = 'mocker', color = colorPresets.log) {
    this._namespace = namespace;
    this._color = color;
  }

  /**
   * Set logger color, returns new PrefixedConsole
   *
   * @param  {string} c Color string
   * @return {PrefixedConsole}
   */
  color(c) {
    return new PrefixedConsole(this._namespace, c);
  }

  /**
   * Set logger namespace, returns new PrefixedConsole
   *
   * @param  {string} ns Namespace
   * @return {PrefixedConsole}
   */
  scope(ns) {
    return new PrefixedConsole(`${this._namespace}:${ns}`, this._color);
  }
}

export const debug = new PrefixedConsole();

/* istanbul ignore else */
// inherit console methods
if (typeof Object.setPrototypeOf === 'function') {
  Object.setPrototypeOf(PrefixedConsole.prototype, console);
} else {
  const desc = {};

  Object.getOwnPropertyNames(PrefixedConsole.prototype).forEach((prop) => {
    desc[prop] = Object.getOwnPropertyDescriptor(PrefixedConsole.prototype, prop);
  });

  PrefixedConsole.prototype = Object.create(console, desc);
}

[
  'log',
  'info',
  'warn',
  'error',
].forEach((method) => {
  PrefixedConsole.prototype[method] = function logger(...messages) {
    const {
      _namespace,
      _color,
    } = this;

    /* istanbul ignore if */
    if (isIE) {
      return console[method](`[${_namespace}]`, ...messages);
    }

    let head = `%c[${_namespace}]%c`;

    if (/%c/.test(messages[0])) {
      head = `${head} ${messages.shift()}`;
    }

    const color = _color === defaultColor ? colorPresets[method] : _color;

    console[method](head, `color: ${color}`, 'color: #000', ...messages);
  };
});
