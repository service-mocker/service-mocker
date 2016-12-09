const defaultColor = 'dodgerblue';

const colorPresets = {
  log: defaultColor,
  info: defaultColor,
  warn: 'goldenrod',
  error: 'crimson',
};

class PrefixedConsole {
  constructor(
    private _namespace = 'mocker',
    private _color = colorPresets.log,
  ) {}

  color(c: string): PrefixedConsole {
    return new PrefixedConsole(`${this._namespace}`, c);
  }

  scope(ns: string): PrefixedConsole {
    return new PrefixedConsole(`${this._namespace}:${ns}`);
  }

  log(...args): PrefixedConsole {
    return this._print('log', ...args);
  }

  info(...args): PrefixedConsole {
    return this._print('info', ...args);
  }

  warn(...args): PrefixedConsole {
    return this._print('warn', ...args);
  }

  error(...args): PrefixedConsole {
    return this._print('error', ...args);
  }

  private _print(
    method: 'log' | 'info' | 'warn' | 'error',
    ...messages: any[],
  ): PrefixedConsole {
    const {
      _namespace,
      _color,
    } = this;

    let head = `%c[${_namespace}]%c`;

    if (/%c/.test(messages[0])) {
      head = `${head} ${messages.shift()}`;
    }

    const color = _color === defaultColor ? colorPresets[method] : _color;

    console[method](head, `color: ${color}`, `color: #000`, ...messages);

    return this;
  }
}

export const debug = new PrefixedConsole();
