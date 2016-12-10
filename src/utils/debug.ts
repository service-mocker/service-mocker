const defaultColor = 'dodgerblue';

const colorPresets = {
  log: defaultColor,
  info: defaultColor,
  warn: 'goldenrod',
  error: 'crimson',
};

// merge console interface
export interface PrefixedConsole extends Console {
  color(c: string): PrefixedConsole;
  scope(ns: string): PrefixedConsole;
}

export class PrefixedConsole {
  constructor(
    private _namespace = 'mocker',
    private _color = colorPresets.log,
  ) {}

  color(c: string) {
    return new PrefixedConsole(`${this._namespace}`, c);
  }

  scope(ns: string) {
    return new PrefixedConsole(`${this._namespace}:${ns}`, this._color);
  }
}

export const debug = new PrefixedConsole();

const proto = PrefixedConsole.prototype;

// inherit console methods
if (typeof Object.setPrototypeOf === 'function') {
  Object.setPrototypeOf(proto, console);
} else {
  (proto as any).__proto__ = console;
}

[
  'log',
  'info',
  'warn',
  'error',
].forEach((method) => {
  proto[method] = function logger(...messages) {
    const {
      _namespace,
      _color,
    } = this;

    let head = `%c[${_namespace}]%c`;

    if (/%c/.test(messages[0])) {
      head = `${head} ${messages.shift()}`;
    }

    const color = _color === defaultColor ? colorPresets[method] : _color;

    console[method](head, `color: ${color}`, 'color: #000', ...messages);
  };
});
