/*! satchel v1.0.0 | (c) 2022 undefined | ISC License | https://github.com/bnjmnrsh/ */
var satchel = (function (exports) {
  'use strict';

  /**
   * A utility library for managaing namespaced sessionStorage and localStorage entries.
   */
  class Satchel {
    #pocketKey
    #store
    #settings

    /**
     * @class Satchel
     * @classdec Create new Satchel instance
     * @param {string} key Storage key
     * @param {object} cargo The cargo payload to be saved to Storage
     * @property {object|string} cargo.data The data to be saved, may be string or object
     * @property {number|null} cargo.expiry The expiry time of the cargo ,may be a number or null
     * @param {boolean} [local=false] Specify sessionStorage (default) or localStorage
     * @param {string} [pocket='pocket'] Namespace for Storage keys, default is 'pocket'
     */
    constructor(key = null, cargo = {}, local = false, pocket = 'pocket') {
      this.#store = local ? window.localStorage : window.sessionStorage;
      if (!key) throw new Error('Satchel: a key is required.')
      this.stcl = Satchel.stcl;
      this.#pocketKey = `${this.stcl}.${pocket}.${key}`;
      this.#settings = { data: undefined, expiry: null };

      cargo = { ...this.#settings, ...cargo };

      // Set the cargo to Storage
      this.set(cargo);
    }

    /**
     * Returns an object of age and freshness related data
     *
     * @typedef {Object} Age object
     * @property {number} age in milliseconds
     * @property {number} creation Date.now() (ms)src/Satchel.js
     * @property {boolean} fresh if Store key is fresh
     * @return {Age} An age object representing the age of the current Store key.
     */
    age() {
      const store = JSON.parse(this.#store.getItem(this.#pocketKey));
      return {
        age: Date.now() - store.creation,
        creation: store.creation,
        expiry: store.expiry,
        fresh: this.isFresh()
      }
    }

    /**
     * Remove the current namespaced key from the store.
     *
     * @returns {boolian:true | Error } Returns true on sucess, error if item is not found.
     */
    bin() {
      const item = this.#store.getItem(this.#pocketKey);
      this.#store.removeItem(this.#pocketKey);
      if (!this.#store.getItem(this.#pocketKey)) {
        Satchel.#emit({
          key: this.#pocketKey,
          oldValue: JSON.parse(item),
          storageArea: Satchel.#storageAreaString(this.#store),
          action: 'bin'
        });
        return true
      } else {
        throw new Error('Satchel: Failure to bin key: ' + this.#pocketKey)
      }
    }

    get(ignore = false) {
      const item = this.#store.getItem(this.#pocketKey);
      if (!item) return false
      if ((this.isFresh() && !ignore) || ignore) {
        return JSON.parse(item)
      }
      return false
    }

    /**
     * Sets the data, for a given key and namespace
     *
     * @param {object} settings object
     * @property {object|string} data the Storage object to set
     * @property {number|null} expiry the expiery date in (ms)
     * @property {number} creation the creation date in (ms) Date.now()
     *
     * @return {Object} Satchel
     */
    set({ data, expiry, creation }) {
      if (typeof expiry !== 'number' && expiry !== null) {
        throw new Error('Satchel: Expiry must be null or a number.')
      }
      if (creation && typeof creation !== 'number') {
        throw new Error('Satchel: Creation cannot be set directly.')
      }
      const storedEntry = this.get(true);
      const temp = {};
      temp.data = data || null; // Key exsists but we are not setting a data attribute
      temp.expiry = expiry || data?.expiry || null;

      if (!data && !expiry && storedEntry)
        throw new Error(
          `Satchel: The key ("${this.#pocketKey}") already exists in ${
          this.#store === window.localStorage
            ? 'LocalStorage'
            : 'SessionStorage'
        }, and "data" and "expiry" atributes have not been set, set these or create a new unique key.`
        )
      // Key exsists and the creation property is being changed
      if (!data && storedEntry && creation) {
        throw new Error(
          'Satchel: Overwriting a key\'s "creation" property is not allowed.'
        )
      } else {
        // dont overwrite existing creation time
        temp.creation = storedEntry?.creation || Date.now();
      }
      // Set storage values
      this.#store.setItem(this.#pocketKey, JSON.stringify(temp));

      Satchel.#emit({
        key: this.#pocketKey,
        newValue: temp,
        oldValue: storedEntry,
        storageArea: Satchel.#storageAreaString(this.#store),
        action: 'set'
      });
      return this
    }

    /**
     * Check if current item is fresh.
     *
     * @returns {boolean} true if the item has not expired
     */
    isFresh() {
      const store = JSON.parse(this.#store.getItem(this.#pocketKey));
      return !store?.expiry ? true : store.expiry - Date.now() > 0
    }

    /**
     * Returns the current namespaced Store key (pocket.key), the key is prefixed with 'stcl'
     *
     * @returns string
     */
    getKey() {
      return this.#pocketKey
    }

    /**
     * Returns array of keys for the a 'Pocket' namespace.
     *
     * @param {string} pocket namespace prefix, default 'pocket'
     * @param {boolean} local specify sessionStorage (default) or localStorage
     * @returns {array} array of Storage keys for the current pocket.
     */
    static getAllPocketKeys(pocket = 'pocket', local = false) {
      const store = local ? window.localStorage : window.sessionStorage;

      return Object.keys(store)
        .map((key) => {
          return key.startsWith(this.stcl + '.' + pocket) ? key : ''
        })
        .filter(function (e) {
          return e
        })
    }

    /**
     * Get the Storage type as a string 'localStorage' or 'sessionStorage'
     *
     * @param {object} Storage object
     * @returns {string} the Storage type as a string 'localStorage' or 'sessionStorage'
     */
    static #storageAreaString(store) {
      return store === localStorage ? 'localStorage' : 'sessionStorage'
    }

    /**
     * Emulates the StorageEvent API, which may be preferable for some use cases.
     * https://developer.mozilla.org/en-US/docs/Web/API/StorageEvent
     *
     * Emit custom events for Satchel
     * @typedef {CustomEvent}
     * @param {object} detail Event details
     * @property {string|null} detail.key name of the Storage key being called
     * @property {string|null} detail.pocket name of the Storage pocket being cleaned
     * @property {string|null} detail.newValue the updated value of the Storage key
     * @property {string|null} detail.oldValue the old value of the Storage key
     * @property {number|null} detail.keysBefore then number of keys in the pocket before emptyPocket or tidyPocket
     * @property {number|null} detail.keysAfter then number of keys in the pocket after emptyPocket or tidyPocket
     * @property {string} detail.storageArea, the type of Storage object
     * @property {string} detail.url, the url of the document whoes key changed
     * @property {string} detail.action the name of the Satchel function emiting the event
     * @property {boolean} [pocketClean = false] Optional flag to indiacte a emptyPocket or tidyPocket opperation.
     * @returns {CustomEvent} CustomEvent
     */
    static #emit(detail = {}, pocketClean = false) {
      let required = {
        key: null,
        newValue: null,
        oldValue: null,
        storageArea: null,
        url: window.location.href || null,
        action: null
      };
      if (pocketClean) {
        required = {
          pocket: null,
          keysBefore: null,
          keysRemaining: null,
          storageArea: null,
          url: window.location.href || null,
          action: null
        };
      }
      detail = { ...required, ...detail };
      const event = new CustomEvent('Satchel', {
        bubbles: true,
        cancelable: true,
        detail
      });
      return document.dispatchEvent(event)
    }

    /**
     * Clears all items regardless of freshness from a given 'pocket' namespace
     *
     * @param {string} pocket namespace prefix, default 'pocket'
     * @param {boolean} local specify sessionStorage (default) or localStorage
     * @returns {array} The number of items remaing in store, which if sucessful should be 0.
     */
    static emptyPocket(pocket = 'pocket', local = false) {
      const store = local ? window.localStorage : window.sessionStorage;
      const keysBefore = Satchel.getAllPocketKeys(pocket, local);
      if (!keysBefore.length) {
        console.warn('No pocket keys found for ' + pocket + ' in ' + store);
        return keysBefore
      }

      Object.keys(keysBefore).forEach((key) => {
        store.removeItem(keysBefore[key]);
      });
      const keysRemaining = Satchel.getAllPocketKeys(pocket, local);

      Satchel.#emit(
        {
          pocket: pocket,
          keysBefore,
          keysRemaining,
          storageArea: Satchel.#storageAreaString(store),
          action: 'emptyPocket'
        },
        true
      );

      return keysRemaining
    }

    /**
     *  Removes all expired items from a given 'pocket' namespace
     *
     * @param {string} pocket namespace prefix, default 'pocket'
     * @param {boolean} local specify sessionStorage (default) or localStorage
     * @returns The number of items remaing in store that have yet to expire.
     */
    static tidyPocket(pocket = 'pocket', local = false) {
      const store = local ? localStorage : sessionStorage;
      const keysBefore = Satchel.getAllPocketKeys(pocket, local);
      if (!keysBefore.length) return null

      Object.keys(keysBefore).forEach((key) => {
        const expiry = JSON.parse(store.getItem(keysBefore[key])).expiry;
        if (!expiry || expiry - Date.now() > 0) return null
        store.removeItem(keysBefore[key]);
      });
      const keysRemaining = Satchel.getAllPocketKeys(pocket, local).length;

      Satchel.#emit(
        {
          pocket: pocket,
          keysBefore: keysBefore.length,
          keysRemaining,
          storageArea: Satchel.#storageAreaString(store),
          action: 'tidyPocket'
        },
        true
      );
      return keysRemaining
    }

    /**
     * Returns an instance of Satchel associated with the given key, pocket,store, or false if none is found.
     *
     * @param {string} key key for the stored item
     * @param {string} [pocket='pocket'] namespace prefix, default 'pocket'
     * @param {string} [local='false'] specify sessionStorage (default) or localStorage
     * @returns {Satchel|false} new Satchel instance | false
     */
    static getSatchel(key, pocket = 'pocket', local = false) {
      const pocketKey = `${Satchel.stcl}.${pocket}.${key}`;
      const store = local ? localStorage : sessionStorage;
      const item = JSON.parse(store.getItem(pocketKey));
      if (!item) return false

      return new Satchel(key, item, local, pocket)
    }
  }

  Satchel.stcl = 'stcl';

  exports.Satchel = Satchel;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({});
//# sourceMappingURL=Satchel.iife.js.map
