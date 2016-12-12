const fs = require('fs');
const path = require('path');

const joinRoot = path.join.bind(path, __dirname, '..', 'dist');

const entries = {
  'index.js':
`exports.createClient = require('./client').createClient;
exports.createServer = require('./server').createServer;`,

  'index.d.ts':
`export { createClient } from './client';
export { createServer } from './server';`,

  'client.js': `exports.createClient = require('./lib/client/').createClient;`,
  'client.d.ts': `export { createClient } from './lib/client/';`,

  'server.js': `exports.createServer = require('./lib/server/').createServer;`,
  'server.d.ts': `export { createServer } from './lib/server/';`,
};

Object.keys(entries).forEach((filename) => {
  fs.writeFileSync(
    joinRoot(filename),
    entries[filename]
  );
});
