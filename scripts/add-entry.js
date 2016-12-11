const fs = require('fs');
const path = require('path');

const joinRoot = path.join.bind(path, __dirname, '..', 'dist');

const entries = {
  'index.js':
`var Mocker = {};
Object.assign(Mocker, require('./client'));
Object.assign(Mocker, require('./server'));
module.exports = exports = Mocker;`,

  'index.d.ts':
`export * from './client';
export * from './server';`,

  'client.js': `module.exports = exports = require('./lib/client/');`,
  'client.d.ts': `export * from './lib/client/';`,

  'server.js': `module.exports = exports = require('./lib/server/');`,
  'server.d.ts': `export * from './lib/server/';`,
};

Object.keys(entries).forEach((filename) => {
  fs.writeFileSync(
    joinRoot(filename),
    entries[filename] + '\n'
  );
});
