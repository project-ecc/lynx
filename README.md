# Sapling

## Contributors
- Greg Griffith
- Dan Molitor


## Install

* **Note: requires a node version >= 6 and an npm version >= 3.**

```bash
$ npm install
$ npm run setup
```

## Run

Start the app in the `dev` environment. This starts the renderer process in [**hot-module-replacement**](https://webpack.js.org/guides/hmr-react/) mode and starts a server sends hot updates to the renderer process:

```bash
$ npm run dev
```

## Compile

All of the compile scripts are also listed inside package.json

Compile for Windows 32 Bit
```bash
$ npm run package-win-32
```

Compile for Windows 64 Bit
```bash
$ npm run package-win
```
Compile for Linux 32 Bit
```bash
$ npm run package-linux-32
```

Compile for Windows 64 Bit
```bash
$ npm run package-linux-64
```

Compile for all supported OS
```bash
$ npm run package-all
```


