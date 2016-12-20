#!/bin/sh
set -e

# Color set
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

if [[ -n `git status -s` ]]; then
  echo "${RED}Please commit local changes before releasing.${NC}"
  exit 1
fi

DIST_DIR="dist"

echo "${GREEN}Which type of release is this?${NC}"
echo
TYPES=(
  "patch - bug fixes and other minor changes"
  "minor - new features which don't break existing features"
  "major - changes which break backwards compatibility"
  "others"
)

PS3="Pick a release type: "

select opt in "${TYPES[@]}"; do
    case $REPLY in
        1 )
            VERSION="patch"; break
            ;;
        2 )
            VERSION="minor"; break
            ;;
        3 )
            VERSION="major"; break
            ;;
        4 )
            VERSION=""; break
            ;;
        *) echo invalid option;;
    esac
done

if [[ -z $VERSION ]]; then
  read -p "Please enter the version: "
  VERSION=$REPLY
fi

read -r -p "Releaing version:$VERSION - are you sure? (y/N) "

if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Releasing version $VERSION"
  npm run lint
  npm run test
  npm run clean
  npm run compile

  NPM_VERSION=`npm version $VERSION --message "Release $VERSION"`

  echo "Copying files to $DIST_DIR"
  mkdir -p $DIST_DIR
  cp -r src $DIST_DIR
  cp -r lib $DIST_DIR
  cp package.json $DIST_DIR
  cp typings.json $DIST_DIR
  cp LICENSE $DIST_DIR

  echo "Creating entry points"
  cd $DIST_DIR
  # Alignment!
  echo 'exports.createClient = require("./client").createClient;'      >  index.js
  echo 'exports.createServer = require("./server").createServer;'      >> index.js
  echo 'export { createClient } from "./client";'                      >  index.d.ts
  echo 'export { createServer } from "./server";'                      >> index.d.ts

  echo 'exports.createClient = require("./lib/client/").createClient;' > client.js
  echo 'export { createClient } from "./lib/client/";'                 > client.d.ts

  echo 'exports.createServer = require("./lib/server/").createServer;' > server.js
  echo 'export { createServer } from "./lib/server/";'                 > server.d.ts

  echo "Publishing $NPM_VERSION"
  npm publish
  cd ..
  git push origin refs/tags/v$VERSION
fi
