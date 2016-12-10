const defaultColor = 'dodgerblue';

const colorPresets = {
  log: defaultColor,
  info: defaultColor,
  warn: 'goldenrod',
  error: 'crimson',
};

// merge console interface
export interface PrefixedConsole extends Console {
  color(c?: string): PrefixedConsole;
  scope(ns?: string): PrefixedConsole;
}

export class PrefixedConsole {
  constructor(
    private _namespace = 'mocker',
    private _color = colorPresets.log,
  ) {}

  color(c = this._color) {
    return new PrefixedConsole(`${this._namespace}`, c);
  }

  scope(ns = this._namespace) {
    return new PrefixedConsole(`${this._namespace}:${ns}`);
  }
}

export const debug = new PrefixedConsole();

const proto = PrefixedConsole.prototype;

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

Object.keys(console)
  .filter(method => !proto.hasOwnProperty(method))
  .forEach(method => {
    proto[method] = console[method].bind(console);
  });
