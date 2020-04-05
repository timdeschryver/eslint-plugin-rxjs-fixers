# Fixers for RxJS v7

## How to use

### Via npx

```bash
$ npx eslint-plugin-rxjs-fixers-poc
```

> This will install eslint and @typescript-eslint/parser if needed, and removes them afterwards

Recursively fixes every (`.js` and `.ts`) file in the current directory.

### Via ESLint

```bash
$ npm i eslint-plugin-rxjs-fixers-poc --save-dev
```

Add the following config to your ESLint config:

```json
{
  "plugins": ["rxjs-fixers-poc"],
  "extends": ["plugin:rxjs-fixers-poc/all"]
}
```
