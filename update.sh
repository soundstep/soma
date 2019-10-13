#!/usr/bin/env bash

# get file from master

rm -rf dist
git checkout master dist/

rm -rf tests
git checkout master tests/

rm -rf examples
git checkout master examples/

# make external libs accessible

rm -rf libs
mkdir -p libs
npm install
cp -f node_modules/@soundstep/infuse/dist/infuse.min.js libs/infuse.min.js
cp -f node_modules/signals/dist/signals.min.js libs/signals.min.js
