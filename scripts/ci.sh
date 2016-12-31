#!/bin/sh
set -e

npm run lint
npm run test:modern
npm run test:cover # legacy mode

# report coverage except PRs
if [[ -z $CI_PULL_REQUEST ]]; then
  ./node_modules/.bin/codecov
fi

# run sauce for develop/master
if [ $CIRCLE_BRANCH == "develop" -o $CIRCLE_BRANCH == "master" ]; then
  npm run test:sauce
fi
