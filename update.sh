#!/usr/bin/env bash

rm -rf dist
git checkout v3 dist/

rm -rf tests
git checkout v3 tests/

rm -rf examples
git checkout v3 examples/
