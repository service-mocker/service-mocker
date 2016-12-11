const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const inquirer = require('inquirer');
const pkg = require('../package.json');

const DIST_DIR = 'dist';

const version = pkg.version;
const versionList = version.match(/\d+/g).slice(0, 3).map(Number);

const indexMap = {
  patch: 2,
  minor: 1,
  major: 0,
};

function updateVersion(index) {
  return versionList.map((v, i) => {
    if (i === index) {
      return v + 1;
    }

    if (i > index) {
      return 0;
    }

    return v;
  }).join('.');
}

const questions = [{
  type: 'list',
  name: 'releaseType',
  message: 'Which type of release is this?',
  choices: Object.keys(indexMap),
  default: 'patch',
}, {
  type: 'confirm',
  name: 'isBeta',
  message: 'Is this a beta release?',
  default: false,
}];

let nextVersion = version;

inquirer.prompt(questions)
  .then((anwsers) => {
    nextVersion = updateVersion(indexMap[anwsers.releaseType]);

    if (anwsers.isBeta) {
      nextVersion += '-beta';
    }

    return inquirer.prompt([{
      type: 'confirm',
      name: 'correct',
      message: `Does this look right to you: ${version} => ${nextVersion}?`,
      default: true,
    }]);
  })
  .then((anwsers) => {
    if (anwsers.correct) {
      return { nextVersion };
    }

    return inquirer.prompt([{
      type: 'input',
      name: 'nextVersion',
      message: 'Enter the next version:',
      default: nextVersion,
    }]);
  })
  .then((anwsers) => {
    pkg.version = anwsers.nextVersion;

    fs.writeFileSync(
      path.join(__dirname, '..', 'package.json'),
      JSON.stringify(pkg, null, 2)
    );

    return pkg;
  })
  .then(() => {
    shell.exec('npm run compile');

    shell.echo('copying files...');
    shell.mkdir('-p', DIST_DIR);
    shell.cp('-R', pkg.files, DIST_DIR);

    shell.echo('creating entry files...');
    shell.exec('node ./scripts/add-entry.js');

    shell.echo('publishing to npm...');
    shell.cd(DIST_DIR);
    shell.exec('npm publish');

    shell.echo('pushing new tag...');
    shell.cd('..');
    shell.exec(`git tag v${pkg.version}`);
    shell.exec('git push --tags');
  })
