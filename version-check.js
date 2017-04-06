const https = require('https');
const exec = require('child_process').exec;

// TODO: switch to develop branch
const mappingsSrc = 'https://raw.githubusercontent.com/service-mocker/service-mocker/ts-compatibility-check/ts-version-map.json';

const MOCKER_MATCHED = 1 << 0;                   // 01
const TS_MATCHED = 1 << 1;                       // 10
const ALL_MATCHED = MOCKER_MATCHED | TS_MATCHED; // 11

function installDeps() {
  const deps = Array.prototype.slice.call(arguments);
  const missed = [];

  deps.forEach((pkg) => {
    try {
      require.resolve(pkg);
    } catch (e) {
      missed.push(pkg);
    }
  });

  if (!missed.length) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    exec(`npm install ${missed.join(' ')}`, (err, stdout, stderr) => {
      if (err || stderr) {
        reject(err || stderr);
      } else {
        resolve(stdout);
      }
    });
  });
}

function fetchRemote() {
  return new Promise((resolve, reject) => {
    https.get(mappingsSrc, (res) => {
      let rawData = '';

      res.on('data', (chunk) => {
        rawData += chunk;
      });

      res.on('end', () => {
        try {
          resolve(JSON.parse(rawData));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function compareVer(versions) {
  const mockerVersion = require('./package.json').version;
  const tsVersion = require('typescript').version;

  return fetchRemote()
    .then((data) => {
      const semver = require('semver');

      console.log('Compatibility List:', JSON.stringify(data.mappings, null, 2));

      let error = null;

      const tsVersionFound = data.mappings.some((mapping) => {
        let state = 0;

        if (semver.satisfies(mockerVersion, mapping['service-mocker'])) {
          state |= MOCKER_MATCHED;
        }

        if (semver.satisfies(tsVersion, mapping['typescript'])) {
          state |= TS_MATCHED;
        }

        switch (state) {
          case ALL_MATCHED:
            return true;

          case TS_MATCHED:
            error = new Error(`service-mocker@${mockerVersion} is not compatible with typescript@${tsVersion}, please use service-mocker@${mapping['service-mocker']}`);
            return true;

          case MOCKER_MATCHED:
            return false; // next
        }
      });

      if (!tsVersionFound) {
        error = new Error(`service-mocker dose not support typescript@${tsVersion} yet, please file an issue on https://github.com/service-mocker/service-mocker/issues.`);
      }

      if (error !== null) {
        throw error;
      }
    });
}

try {
  // check ts existence
  require.resolve('typescript');

  console.log('Checking service-mocker compatibility...');
  console.log(process.cwd());

  installDeps('semver')
    .then(compareVer)
    .catch((error) => {
      console.error(`\x1b[31m${error.message}\x1b[0m`);
      process.exit(1);
    });
} catch (e) {}
