#!/bin/sh
set -e

# no need for `npm run test`
# all tests are executed in cover/sauce task
npm run lint
npm run test:sauce
npm run cover
./node_modules/.bin/codecov



# report coverage except PRs
# if [[ -z $CI_PULL_REQUEST ]]; then
#   npm run cover
#   ./node_modules/.bin/codecov
# fi

# run sauce for develop/master
# if [ $CIRCLE_BRANCH == "develop" -o $CIRCLE_BRANCH == "master" ]; then
#   npm run test:sauce
# fi
