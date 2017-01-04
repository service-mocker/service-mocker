#!/bin/sh
set -e

# no need for `npm run test`
# all tests are executed in cover/sauce task
npm run lint
npm run test:sauce
npm run cover
./node_modules/.bin/codecov
