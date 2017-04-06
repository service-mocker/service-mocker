const https = require('https');
const exec = require('child_process').exec;

// TODO: switch to develop branch
const mappingsSrc = 'https://raw.githubusercontent.com/service-mocker/service-mocker/ts-compatibility-check/ts-version-map.json';

const MOCKER_MATCHED = 1 << 0;
const TS_MATCHED = 1 << 1;

function execToPromise(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err || stderr) {
        reject(err || stderr);
      } else {
        resolve(stdout);
      }
    });
  });
}

function argsToArray(args) {
  return Array.prototype.slice.call(args);
}

function installDeps() {
  const deps = argsToArray(arguments);
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

  return execToPromise(`npm install ${missed.join(' ')}`);
}

function getInstalled() {
  const pkgs = argsToArray(arguments);

  return execToPromise(`npm ls ${pkgs.join(' ')} --depth=0`)
    .then((stdout) => {
      const versions = {};

      pkgs.forEach((pkg) => {
        const regex = new RegExp(`${pkg}@([\\S]+)`);

        const matched = stdout.match(regex);

        if (matched) {
          versions[pkg] = matched[1].trim();
        }
      });

      return versions;
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
  if (!versions['typescript']) {
    return Promise.resolve();
  }

  return fetchRemote()
    .then((data) => {
      const semver = require('semver');

      console.log('Compatibility List:', JSON.stringify(data.mappings, null, 2));

      let finalState = 0;
      let error = null;

      data.mappings.some((mapping) => {
        let state = 0;

        if (semver.satisfies(versions['service-mocker'], mapping['service-mocker'])) {
          state |= MOCKER_MATCHED;
          finalState |= MOCKER_MATCHED;
        }

        if (semver.satisfies(versions['typescript'], mapping['typescript'])) {
          state |= TS_MATCHED;
          finalState |= TS_MATCHED;
        }

        switch (state) {
          case MOCKER_MATCHED & TS_MATCHED:
            return true;

          case MOCKER_MATCHED:
            return false; // next

          case TS_MATCHED:
            error = new Error(`service-mocker@${versions['service-mocker']} is not compatible with typescript@${versions['typescript']}, please use service-mocker@${mapping['service-mocker']}`);
            return true;
        }
      });

      if ((finalState & TS_MATCHED) === 0) {
        error = new Error(`service-mocker@${versions['service-mocker']} is not compatible with typescript@${versions['typescript']}, please file an issue at https://github.com/service-mocker/service-mocker/issues.`);
      }

      if (error !== null) {
        throw error;
      }
    });
}

console.log('Checking service-mocker compatibility...');

installDeps('semver')
  .then(() => getInstalled('typescript', 'service-mocker'))
  .then(compareVer)
  .catch((error) => {
    console.error(`\x1b[31m${error.message}\x1b[0m`);
    process.exit(1);
  });
