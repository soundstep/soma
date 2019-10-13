# Test imports

All commands should be executed from the root.

```
npm install -g live-server
npm install webpack
npm install webpack-cli
```

## browser (bundle)

```
live-server . --open=examples/usage/browser
```

## cjs (with Node)

node examples/usage/cjs/index.js

## cjs (with Webpack)

```
npm install webpack webpack-cli
webpack --mode production examples/usage/esm/src/main.js --output examples/usage/esm/dist/main.js
live-server . --open=examples/usage/esm/dist
```
