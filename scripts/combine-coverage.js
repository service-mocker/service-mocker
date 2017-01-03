const combine = require('istanbul-combine');

var opts = {
  pattern: 'coverage/coverage-{modern,legacy}.json',
  print: 'summary',
};

if (process.env.CI) {
  opts.reporters = {
    lcovonly: {
      dir: './coverage',
    },
  };
} else {
  opts.reporters = {
    html: {
      dir: './coverage/html',
    },
  };
}

combine.sync(opts);
