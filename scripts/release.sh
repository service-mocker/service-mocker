#!/bin/sh
set -e

# Color set
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# dist directory
DIST_DIR="dist"

if [[ `git rev-parse --abbrev-ref HEAD` != "master" ]]; then
  echo "${RED}Please run release script in master branch.${NC}"
  exit 1
fi

if [[ -n `git status -s` ]]; then
  echo "${RED}Please commit local changes before releasing.${NC}"
  exit 1
fi

echo "${GREEN}Which type of release is this?${NC}"
echo
TYPES=(
  "patch - bug fixes and other minor changes (a.b.0 -> a.b.1)"
  "minor - new features which don't break existing features (a.0.c -> a.1.0)"
  "major - changes which break backwards compatibility (0.b.c -> 1.0.0)"
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

read -r -p "Releasing version:$VERSION - are you sure? (y/N) "

if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Releasing version $VERSION"
  npm run lint
  npm run test:sauce
  npm run compile

  NPM_VERSION=`npm version $VERSION`

  echo "Copying files to $DIST_DIR"
  mkdir -p $DIST_DIR
  cp -r build/* $DIST_DIR
  cp package.json $DIST_DIR
  cp README.md $DIST_DIR
  cp LICENSE $DIST_DIR

  echo "Publishing $NPM_VERSION"
  git push
  git push --tags
  npm publish
fi
