# @bnjmnrsh/satchel.js

 __A sessionStorage & localStorage utility with namespaced entries and extra Freshness.__

 A project which uses Sactchel+Bindel extensively can be found here: [Signal-v-Noise](https://bnjmnrsh-projs.github.io/signal-v-noise/) | [GitHub](https://github.com/bnjmnrsh-projs/signal-v-noise)

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

- [Installation](#Installation-)
- [What is this?](#what-is-this-)
- [How to use](#how-to-use-)
- [Choosing sessionStorage or localStorage](#choosing-sessionstorage-or-localstorage-)
- [Satchel Pockets & Namespaces](#satchel-pockets--namespaces-)
- [Satchel Events](#satchel-events-)
- [Satchel Freshness](#satchel-freshness-)
- [Satchel Instance Methods](#satchel-instance-methods-)
- [Satchel Static Methods](#satchel-static-methods-)
- [Optional imports in bindle.js](#optional-imports-in-bindlejs-)
- [Licence & Copyright](#licence-isc-)

---
## Installation [↑](#table-of-contents)

Use `npm` to install Satchel from github targeting a specific tag; drop everything after the hash if you just want the latest version.

```bash
npm i https://github.com/bnjmnrsh/satchel#v0.2.4
```
---
## What is this? [↑](#table-of-contents)

`Satchel.js` is a library for managing browser `sessionStorage` and `localStorage` entries. It allows developers to set entry expiry times and test a given entry's freshness when retrieving values. It also allows for the namespacing of entries using shared key prefixes called 'pockets'. To help manage pockets, `Satchel.js` ships with `bindle.js`, a small suite of optional imports: `emptyPocket()`, `tidyPocket()` and `getAllPocketKeys()`.

---
## How to use [↑](#table-of-contents)

```javascript
import { Satchel } from '@bnjmnrsh/satchel'

const twoHours = 7200; // seconds
const taco = new Satchel('taco', { data: 'a tasty treat', expiry: Date.now() + twoHours }, false, 'pocket');

console.log(taco.isFresh());
// true

console.log(taco.get());
// returns { data: 'a tasty treat', expiry: null }
```

`Satchel` can be passed the following parameters during instantiation:

```javascript
Satchel(
  key:string, // required
  cargo:object { data: string|object, expiry: number },
  localStore:boolean // defaults is false for sessionStorage
  pocket:string // optional namespace, defaults to 'pocket'
      )
```
At a minimum, `Satchel` requires a `key` to instantiate. During setup, if not provided any further values, `Satchel` will create a `sessionStorage` (default) or `localStorage` entry with a string representation of a default `cargo` object:
```javascript
{ data: null, expiry:null, _creation: number }
```

`Satchel`'s cargo object contains three properties:
  - `data`: can be a number, string or serialisable object †
  - `expiry`: an optional number, representing a future UNIX time in seconds
  - `_creation`:  a UNIX creation timestamp in seconds (cannot be modified directly) ††

Both the `data` and `expiry` properties default to `null`. You can update and retrieve these values using [`.set()`](#set---sarchel-object) and [`.get()`](#get---objectfalsenull)††.

```javascript
const taco = new Satchel('taco')
console.log(taco.get())
// {data: null, expiry: null}

taco.set({data: 'a tasty treat'})
console.log(taco.get())
// {data: 'a tasty treat', expiry: null}
```

> † ⚠️ NOTE: `localStorage` and `sessionStorage` can only hold string values. Any data passed to `Satchel.set()` is run thorough [`JSON.stringify()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#description) which has inherent limitations, effecting deeply nested objects, circular references, and [very large numbers](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt).

> †† ☝️ NOTE: The `_creation` property  holds a UNIX timestamp recording the moment a key was created –– it cannot be modified directly.

See also [Satchel.setKey()](#satchelsetkey----satchel)

---
## Choosing sessionStorage or localStorage [↑](#table-of-contents)

`Satchel` uses `sessionStorage` by default. You can specify `localStorage` by passing `true` as a third  parameter during instantiation:

```javascript
const localTaco = new Satchel('localTaco', {data: 'a yummy treat'}, true);
```

---
## Pockets & Namespaces [↑](#table-of-contents)
`Satchel` scopes all of its entries using a 'pocket' namespace, which can be modified as needed as the fourth parameter during instantiation:

```javascript
// default 'pocket' namespace
const taco1 = new Satchel('taco', {data: 'a yummy treat'}, false);
console.log(taco1.getKey());
// stcl.pocket.taco <- default 'stcl.pocket' namespaces

const taco2 = new Satchel('taco', {data: 'a yummy treat'}, false, 'tacoTruck');
console.log(taco2.getKey());
// stcl.tacoTruck.taco <-- custom 'stcl.tacoTruck' pocket namespace
```

The `stcl` prefix of the storage key may be customised prior to instantiation by setting the  `Satchel.stcl` property:

```javascript
Satchel.stcl = 'restaurant'
const taco = new Satchel('taco', {data: 'a yummy treat'}, false);
console.log(taco.getKey()); // restaurant.pocket.taco <-- prefixed namespace
```

`Satchel.stcl` is both a `getter` and `setter`, so it can be used to retrieve the value if required. This can be useful when working with the optional functions found in [bindle.js](#bindlejs-optional-imports-).

---
## Satchel Freshness [↑](#table-of-contents)
Satchel provides several methods to manage key freshness. By default, [`.get()`](#getignorestale--false---objectfalse) will only return values that are fresh by testing freshness with [`.isFresh()`](#isfresh---boolean) internally. This behaviour can be overridden by passing `.get(true)`, which will return values from the store regardless of freshness.

The [`.age()`](#age---numbernull) helper method returns an object of age-related values for a given store key. The returned object includes the properties `age` (seconds), which is the age of the current store, and a `creation` property, a UNIX timestamp of its creation date. It also includes a `fresh` boolean property indicating the record's current freshness state.

See also the optional import [`tidyPocket()`](#tidypocket) will  remove any stale records from a given 'pocket' in a store.

---
## Satchel Events [↑](#table-of-contents)

Satchels methods [`set()`](#set---object), and [`bin()`](#bin---object) methods emit `Satchel` custom events which largely mirror the properties of the [StorageEvent API](https://developer.mozilla.org/en-US/docs/Web/API/StorageEvent), albeit nested within the `e.detail` CustomEvent property. Unlike `StorageEvent`, which emits across browser tabs, `Satchel` events are limited to the current browser tab.

Basic Usage:
```javascript
window.addEventListener('Satchel', fn);

const fn = function(e)  {
  if (e.type !== 'Satchel') return
  console.log(e.detail);
}

Satchel.('taco', {data: 'a tasty treat'})
```
The event emitted by the above function could look something like this:

```javascript
e.detail {
  action: 'set'
  key: 'stcl.pocket.taco',
  newValue: {
    data: 'a tasty treat',
    expiry: null,
    creation: 1666013618656
    },
  oldValue: null,
  storageArea: 'SessionStorage',
  url: 'http://localhost:8080',  // window.location.href,
}
```

The `action` property indicates the `Satchel` method, which fired the event.

Additionally the optional imports [`tidyPocket()`](#tidypocket----arraynull) and [`emptyPocket()`](#emptypocket----arraynull) emit events with details related to these operations. See [bindle.js](#bindlejs-optional-imports-) for details.

---
## Satchel instance methods [↑](#table-of-contents)
To work with stored data `Satchel` provides the following instance methods.

---
#### `.age()` -> number|null

Returns an object of age-related values or `null` if the key is not found in the store.

```javascript
{
  age: 704915, // number, seconds since the creation of key in store
  creation: 1666013618656, // UNIX timestamp at point of creation
  expiry: 1666013623656, // UNIX timestamp for when this key expires
  fresh: false // boolean for if the current key is fresh
}
```

Usage: `console.log(taco.age());`

---
#### `.bin() -> boolean: true|null`

Removes the key associated with the current `Satchel` instance from storage. Returns `true` if the key was removed and `null` if the key for the current instance could not be found in the store.

Usage: `console.log(taco.bin()); // true`

##### [`CustomEvent`](#satchel-events-):
A successful `bin()` operation emits the following event:

```javascript
e.detail {
  action: 'bin'
  key: 'stcl.pocket.taco',
  newValue: null,
  oldValue: {
    data: 'a tasty treat',
    expiry: null,
    creation: integer (seconds)
    },
  storageArea: 'SessionStorage',
  url: String(window.location.href),
}
```

---
#### `.get() -> object|false|null`

If the stored entry is 'fresh', `.get()` returns the value of the stored key object containing the properties:
- `data` (object|string)
- `expiry` (number in seconds) properties, returning false if not 'fresh'.

The method accepts an optional boolean `.get(true)`, which will force it to return a stored entry regardless of whether the entry is 'fresh' or not.
If an entry cannot be found for the current key instance (for example, as the result of a previous `.bin()` operation), `.get()` returns `null`.

Usage:
```javascript
const taco = new Satchel('taco')
console.log(taco.get()); // { _creation: 1666884532131, data: null, expiry: null }`
```

---
#### `.set() -> Sarchel object`

Accepts a `cargo` object with either of two optional values:
- `data` (number|string|object) Objects passed to `data` will be passed through `JSON.stringify()`.†
- `expiry` (number) represents a future UNIX date in seconds until the current entry expires.

As of version 0.2.3 `cargo.data` and `cargo.expiry` can be set independently.

Usage:
```javascript
const _24h = 86400
const taco = new Satchel('taco',{data: 'a tasty treat'})
taco.set({expiry: Date.now() + _24h})
```

> † ⚠️ NOTE: `localStorage` and `sessionStorage` can only hold string values. Any data passed to `Satchel.set()` is run thorough [`JSON.stringify()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#description) which has inherent limitations, effecting deeply nested objects, circular references, and [very large numbers](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt).

##### [`CustomEvent`](#satchel-events-):
```javascript
e.detail {
  action: 'set'
  key: 'stcl.pocket.taco',
  newValue: {
      data: 'a great snack':
      expiry: null,
      creation: 1666013618656
      },
  oldValue: {
    data: 'a tasty treat':
    expiry: null,
    creation: 1666013618656
    },
  storageArea: 'SessionStorage',
  url: 'http://localhost:8080',
}
```
---
#### `.isFresh() -> boolean|null`

Returns a `boolean` indicating the freshness of the current key in storage, `null` if the key could not be found.

Usage:
```javascript
console.log(taco.isFresh()); // true
```
---
#### `.getKey() -> string`

Returns a dot-separated string representing the key of the current Satchel instance, including prefix and 'pocket' namespaces. Note that `getKey()` returns the key value as stored on the current `Satchel` instance, and is _not_ proof that the key currently exists in storage.
The default instance namespace is `stchl`, and the default "pocket" namespace is `pocket`.

See notes on [Pockets & Namespaces](#pockets--namespaces-).

Usage:
```javascript
const taco = new Satchel('taco);
console.log(taco.getKey()) // "stchl.pocket.taco"
```

---
## Satchel Static Methods [↑](#table-of-contents)
### `Satchel.getSatchel() --> Satchel|null`
`Satchel.getSatchel(key, local=false, pocket='pocket')`

Returns a `Satchel` instance if the key is found in storage or `null` if not found. Accepts a `string` for the 'key' (required), `boolean` for the storage area, and `string` for the 'pocket' namespace (optional). Default is `false` for `sessionStorage`, `true` for `localStorage`.

Usage: `Satchel.getSatchel('taco', true, 'myPocket')`

---

### `Satchel.setKey() --> undefined`

For when you want to use `Satchel` for its side effects only and don't need an instance returned. Is a thin wrapper around `new Satchel()` See [How to use](#how-to-use-) for a full list of options.

Useage: `Satchel.setKey('taco')`

---
## Optional imports in bindle.js [↑](#table-of-contents)

`Satchel` comes with `bindle.js`, which adds optional methods to help manage pocket namespaces.

```javascript
import { getAllPocketKeys, tidyPocket, emptyPocket } from '@bnjmnrsh/satchel/dist/bindle'
```
### `getAllPocketKeys() ––> Array`
`getAllPocketKeys( local=false, pocket='pocket', stcl='stcl')`

 Returns an array of all 'pocket' namespace keys regardless of freshness. Accepts a boolean for the storage area, which defaults to `false` for `sessionStorage`, `true` for `localStorage`, a string for the 'pocket' to look for (default is 'pocket'), and an optional `stcl` string if a namespace has been set on the `Satchel.stcl` object.

Usage:

```javascript
console.log(getAllPocketKeys(false)) // ['stcl.pocket.taco' ...]

// With a custom prefix:
Satchel.stcl = 'tacoTruck'
console.log(getAllPocketKeys(false, 'pocket', Satchel.stcl)) // ['tacoTruck.pocket.taco' ...]
```
### `tidyPocket() --> Array|null`
`tidyPocket(local = false, pocket='pocket', stcl='stcl')`

Removes expired items from a pocket. Accepts a `boolean` for the storage area (defaulting to `false` for `sessionStorage`, `true` for `localStorage`), a string for the 'pocket' namespace (default is 'pocket'), and an optional '`stcl`' `string` if a namespace prefix has been set on the `Satchel.stcl` object.

Returns an array containing the number of items remaining in the pocket and the total number of items remaining in the store regardless of namespace. If no items are found for a given 'pocket', `null` is returned.

Usage:
```javascript
tidyPocket(true, 'myPocket') // example return [2,5]
```

### `emptyPocket() --> Array|null`
`emptyPocket(local=false, pocket='pocket', stcl='stcl')`

Completely empties a store of all keys within a given 'pocket' namespace, regardless of freshness. Accepts a `boolean` for the storage area (defaulting to `false` for `sessionStorage`, `true` for `localStorage`), a string for the 'pocket' namespace (default is 'pocket'), and an optional '`stcl`' `string` if a namespace prefix has been set on the `Satchel.stcl` object.

Returns an array containing the number of items remaining in the pocket (which for `emptyPocket()` should always be `0`) and the total number of items remaining in the store regardless of namespace. If no items are found for a given 'pocket', `null` is returned.

Usage:

```javascript
// Local Store
emptyPocket(true) // example return [0,5]
```

---
## LICENCE [ISC](./LICENSE) [↑](#table-of-contents)
Copyright (c) 2022 Benjamin O. Rush ([bnjmnrsh](https://github.com/bnjmnrsh)).
