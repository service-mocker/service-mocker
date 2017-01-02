#!/bin/sh
set -e

# no need for `npm run test`
# all tests are executed in cover task
npm run lint
npm run cover

# report coverage except PRs
if [[ -z $CI_PULL_REQUEST ]]; then
  ./node_modules/.bin/codecov
fi

# run sauce for develop/master
if [ $CIRCLE_BRANCH == "develop" -o $CIRCLE_BRANCH == "master" ]; then
  npm run test:sauce
fi
