# @bnjmnrsh/satchel.js

 __A sessionStorage & localStorage utility with namespaced entries and extra Freshness.__


[![GitHub package.json version](https://img.shields.io/github/package-json/v/bnjmnrsh/satchel)](https://github.com/bnjmnrsh/Satchel)
[![GitHub license](https://img.shields.io/github/license/bnjmnrsh/Satchel)](https://github.com/bnjmnrsh/Satchel/blob/master/LICENSE)
[![GitHub file size in bytes](https://img.shields.io/github/size/bnjmnrsh/satchel/dist/Satchel.min.js)](https://raw.githubusercontent.com/bnjmnrsh/Satchel/main/dist/Satchel.min.js)
[![GitHub last commit](https://img.shields.io/github/last-commit/bnjmnrsh/Satchel/main)](https://github.com/bnjmnrsh/Satchel/)
[![GitHub issues](https://img.shields.io/github/issues/bnjmnrsh/Satchel)](https://github.com/bnjmnrsh/Satchel/issues)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/bnjmnrsh/satchel/ci-actions)
![Branches](./badges/coverage-branches.svg)
![Functions](./badges/coverage-functions.svg)
![Lines](./badges/coverage-lines.svg)
![Statements](./badges/coverage-statements.svg)
![Jest coverage](./badges/coverage-jest%20coverage.svg)

## Table of Contents

- [Installation](#Installation)
- [How to use](#how-to-use-↑)
- [Session & Local Storage](#session-&-local-storage-↑)
- [Satchel Events](#satchel-events-↑)
- [Freshness](#satchel-freshness-↑)
- [Satchel Instance Methods](#satchel-instance-methods-↑)
- [Satchel Static Methods](#satchel-static-methods-↑)
- [Licence & Copyright](#licence-isc-↑)

---
### Installation

```bash
npm i https://github.com/bnjmnrsh/satchel
```

## How to use [↑](#table-of-contents)

```javascript
import { Satchel } from '@bnjmnrsh/satchel'

const twoHours = 7200;
const taco = new Satchel('taco', { data: 'a tasty treat', expiry: Date.now() + twoHours }, false, 'pocket');

console.log(taco.isFresh()); // true

console.log(taco.get());
// returns { data: 'a tasty treat', expiry: null }
```

`Satchel` can be passed the following during instantiation:

```javascript
Satchel(
  key:string, // required
  cargo:object { data: string|object, expiry: number},
  localStore:boolean // defaults to false, sessionStorage
  pocket:string // optional namespace
        )
```
At a  minimum, `Satchel` requires a `key` to instantiate. During setup, `Satchel` will create `sessionStorage` (default) or `localStorage` entry with a string representation of the `cargo` object: `{ data: null, expiry:null, creation: number }`. The default value of `Satchel`'s cargo object contains three properties:
  - `data`: can be a string or an object
  - `expiry`: an optional number, representing a future UNIX time in seconds
  - `creation`:  a UNIX creation time in seconds (cannot be modified directly)

  Both the `data` and `expiry` properties default to `null`. You can update either of these using the [`set()`](#set) method.

```javascript
const taco = new Satchel('taco')
console.log(taco.get()) // {data: null, expiry: null}
taco.set({data: 'a tasty treat'})
console.log(taco.get()) // {data: 'a tasty treat', expiry: null}
```

## Session & Local Storage [↑](#table-of-contents)

`Satchel` uses `sessionStorage` by default. You can specify `localStorage` by passing `true` as  a third  parameter during instatiation:

```javascript
const localTaco = new Satchel('localTaco', {data: 'a yummy treat'}, true);
```

---
## Satchel Freshness [↑](#table-of-contents)
Satchel provides several methods to manage Freshness. By default, [`.get()`](#getignorestale--false---objectfalse) will only return values that are fresh, by testing freshness with [`.isFresh()`](#isfresh---boolean) internally. This behaviour can be overridden by passing `.get(true)`, which will return values from the store regardless of Freshness.

The [`.age()`](#age---numbernull) helper method returns an object of age-related values for a given store key. The returned object includes the properties `age` (seconds) which is the age of the current store, and a `creation` property, a UNIX timestamp of its creation date. It also includes a `fresh` boolean property indicating the record's current freshness state.

The static method [`Satchel.tidyPocket()](#satcheltidypocketpocket--pocket-local--false) will  remove any stale records from a given 'pocket' in a store.

---
## Satchel Events [↑](#table-of-contents)

Satchels methods [`set()`](#set---object), and [`bin()`](#bin---object) methods emit `Satchel` custom events which, largely contains the same properties as the [StorageEvent API](https://developer.mozilla.org/en-US/docs/Web/API/StorageEvent), nested with the `e.detail` CustomEvent property. Unlike `StorageEvent`, which emits across browser tabs, `Satchel` events are only available on the current tab.

Basic Usage:
```javascript

window.addEventListener('Satchel', fn);

const fn = function(e)  {
  if (!e.detail) return;
  console.log(e.detail);
}

Satchel.('taco', {data: 'a tasty treat'})
```
The event emitted by the above function could look something like this:

```javascript
e.detail {
  action: 'set'
  key: 'stcl.pocket.taco',
  newValue: {data: 'a tasty treat': expiry: null, creation: 1666013618656},
  oldValue: null,
  storageArea: 'SessionStorage',
  url: 'http://localhost:8080',
}
```

The `action` property is unique to `Satchel` and indicates the method which fired the event.

Additionally the static methods [`Satchel.tidyPocket()`](#satcheltidypocketpocket--pocket-local--false) and [`Satchel.emptyPocket()`](#satchelemptypocketpocket--pocket-local--false) also emit events with details related to these opperations, which are unique to `Satchel`. See method documentation for details.

## Satchel instance methods [↑](#table-of-contents)
To work with stored data, `Satchel` provides several instance methods:

#### `.age()` -> number|null
Returns an object of age-related values.

```javascript
{
  age: 704915, // number, seconds since the creation of key in store
  creation: 1666013618656, // number value of Date.now() at point of creation
  expiry: 1666013623656, // number, the UNIX date in seconds that this key will expire
  fresh: false // boolean
}
```

Useage: `console.log(taco.age());`

#### `.bin()` -> boolean: true|null
Removes the key assoocated with the current `Satchel` instance from Storage. Returns `true` if the key was removed and `null` if the key for the current instance could not be found in the store.

Useage: `console.log(taco.bin()); // true`

[`CustomEvent`](#satchel-events-↑):
```javascript
e.detail {
  action: 'bin'
  key: 'stcl.pocket.taco',
  newValue: null,
  oldValue: {data: 'a tasty treat': expiry: null, creation: integer (seconds)},
  storageArea: 'SessionStorage',
  url: String(window.location.href),
}
```
#### `.get(ignoreStale = false)` -> object|false
If the stored entry is 'fresh', this method returns the stored item as an object containing `data` (object|string)  and `expiry` (number in seconds) properties. If the stored entry is not 'fresh', this method returns false. The method accepts an optional `boolean`, which indicates whether to return the stored entry regardless of whether the entry is fresh or not.

Useage: `console.log(taco.get()); // { data: null, expiry: null }`

#### `.set()` -> object
Accepts two values: `data` (string|object) and `expiry` (number). Objects passed to `data` will be passed through `JSON.stringify()`. `expiry` represents a future UNIX date `number` in seconds until the current entry expires.

Useage: `.set({data: 'tacos are great pub food', expiry: Date.now() + someTime})`

#### `.isFresh()` -> boolean
Returns a `boolean` indicating the Freshness of the current store.

Useage: `console.log(taco.isFresh()); // true`
#### `.getKey()` -> string
Returns a dot-separated string representing the entire key of the current Satchel instance, including prefix and 'pocket' namespaces. The default instance namespace is `stchl`, and the default "pocket" namespace is `pocket`.

Usage:
```javascript
const taco = new Satchel('taco);
console.log(taco.getKey()) // "stchl.pocket.taco"
```

## Satchel Static Methods [↑](#table-of-contents)
`Satchel` also has several static methods to manage pocket namespaces and Stores:

### `Satchel.getAllPocketKeys(pocket = 'pocket', local = false)`
Returns an array of all keys from a given store with a pocket namespace. This list includes keys that may be stale.

Usage:
```javascript
console.log(Satchel.getAllPocketKeys('pocket', false)) // ['stchl.pocket.taco' ...]
```
### `Satchel.tidyPocket(pocket = 'pocket', local = false)`
Removes expired items from Storage. Accepts a string for the 'pocket' to tidy and a boolean for the storage area. Defaults to `false` for `sessionStorage`, `true` for `localStorage`. Returns the number of remaining non-stale entries left in the store.

Useage: `Satchel.tidyPocket('myPocket', true)`

### `Satchel.emptyPocket(pocket = 'pocket', local = false)`
Completely empties a Store of all keys with a given 'pocket' namespace, regardless of Freshness. Accepts a `string` namespace of the 'pocket' to be emptied and a `boolean` for the storage area. Defaults to `false` for `sessionStorage`, `true` for `localStorage`. Returns

Useage: `Satchel.emptyPocket('pocket', true)`

### `Satchel.getSatchel(key, pocket = 'pocket', local = false)`
Returns a `Satchel` instance if the key is found in Storage or `false` if not found. `.getSatchel()` accepts a `string` for both the 'key' (required) and the 'pocket' (optional) namespace and a `boolean` for the storage area. Defaults to `false` for `sessionStorage`, `true` for `localStorage`.

Useage: `Satchel.getSatchel('taco', 'pocket', true)`

---
## LICENCE [ISC](./LICENSE) [↑](#table-of-contents)
Copyright (c) 2022 Benjamin O. Rush (bnjmnrsh).