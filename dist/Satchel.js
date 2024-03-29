/* ! @preserve @bnjmnrsh/satchel v0.2.6 | (c) 2024 bnjmnrsh | ISC | https://github.com/bnjmnrsh/satchel */
/**
 * A utility for managaing the freshness of namespaced sessionStorage and localStorage entries.
 */
class Satchel {
  static _stcl
  #pocketKey
  #store
  #settings

  /**
   * @class Satchel
   * @classdec Create new Satchel instance
   * @param {string|null} key Storage key
   * @param {object} cargo The cargo payload to be saved to Storage
   * @property {object|string} cargo.data The data to be saved, may be string or object
   * @property {number|null} cargo.expiry The expiry time of the cargo ,may be a number or null
   * @param {boolean} [local=false] Specify sessionStorage (default) or localStorage
   * @param {string} [pocket='pocket'] Namespace for Storage keys, default is 'pocket'
   */
  constructor(key = null, cargo = {}, local = false, pocket = 'pocket') {
    this.#store = local ? window.localStorage : window.sessionStorage;
    if (!key) {
      throw new Error('Satchel: a "key" is required.')
    }
    if (typeof key !== 'string') {
      throw new Error('Satchel: "key" must be a string.')
    }
    if (!this.#isObject(cargo)) {
      throw new Error('Satchel: {cargo} must be an object.')
    }
    if (typeof local !== 'boolean') {
      throw new Error('Satchel: "local" must be a boolean.')
    }
    if (typeof pocket !== 'string') {
      throw new Error('Satchel: "pocket" must be a string.')
    }

    this.#pocketKey = `${Satchel.stcl}.${pocket}.${key}`;
    this.#settings = { data: undefined, expiry: null };

    cargo = { ...this.#settings, ...cargo };

    // Set the cargo to Storage
    this.set(cargo);
  }

  /**
   * Setter for Satchel.stcl must be a string.
   *
   * @static
   * @memberof Satchel
   */
  static set stcl(prefix) {
    if (typeof prefix !== 'string') {
      throw new Error('Satchel.stcl must be a string.')
    }
    this._stcl = prefix;
  }

  /**
   * Getter for the Satchel.stcl property.
   * Returns the prefix for current Satchel instance, defaulting to 'stcl'.
   *
   * @static
   * @memberof Satchel
   */
  static get stcl() {
    return this._stcl ? this._stcl : 'stcl'
  }

  /**
   * Returns an object of age and freshness related data
   *
   * @typedef {object} Age object
   * @property {number} age in milliseconds
   * @property {number} creation Date.now() (ms)src/Satchel.js
   * @property {boolean} fresh if Store key is fresh
   * @return {Age|null} An age object representing the age of the current Store key.
   */
  age() {
    const store = JSON.parse(this.#store.getItem(this.#pocketKey));
    if (!store) return null
    return {
      age: Date.now() - store._creation,
      creation: store._creation,
      expiry: store.expiry ? store.expiry : null,
      fresh: this.isFresh()
    }
  }

  /**
   * Remove the current namespaced key from the store.
   *
   * @returns { boolian:true | null } Returns true on success, or null if no record found.
   */
  bin() {
    const item = this.#store.getItem(this.#pocketKey);
    if (!item) return null
    this.#store.removeItem(this.#pocketKey);
    Satchel.#emit({
      key: this.#pocketKey,
      oldValue: item,
      storageArea: Satchel.#storageAreaString(this.#store),
      action: 'bin'
    });
    return true
  }

  /**
   * Get the data for the current Storage key.
   *
   * @param {boolean} getStale flag to ignore stale entries from a "pocket"
   * @returns {object|boolan:false} the data for the stored key or false.
   */
  get(getStale = false) {
    const item = this.#store.getItem(this.#pocketKey);
    if (!item) return null
    if ((this.isFresh() && !getStale) || getStale) {
      return JSON.parse(item)
    }
    return false
  }

  /**
   * Sets the cargo object for a given key and namespace.
   *
   * @param {object} settings object
   * @property {object|string} data the Storage object to set
   * @property {number|null} expiry the expiery date in (ms)
   *
   * @return {Satchel} Satchel
   */
  set({ data, expiry }) {
    // check if a key exists in store already
    const exsisting = JSON.parse(this.#store.getItem(this.#pocketKey));
    // allow data and expiry to be set independently
    data = exsisting?.data && !data ? exsisting.data : data;
    expiry = exsisting?.expiry && !expiry ? exsisting.expiry : expiry;

    if (
      data &&
      typeof data !== 'string' &&
      typeof data !== 'number' &&
      !this.#isObject(data)
    ) {
      throw new Error(
        'Satchel.set({data}): must be either null or a number, string or object.'
      )
    }

    if (typeof expiry !== 'number' && expiry !== null) {
      throw new Error(
        'Satchel.set({expiry}): "expiry" must be null or a number.'
      )
    }
    if (data && this.#isObject(data)) {
      try {
        JSON.parse(JSON.stringify(data));
      } catch (e) {
        throw new Error(`Satchel.set({data}): ${e}`)
      }
    }
    const storedEntry = this.get(true);
    const temp = {};
    temp.data = data || null;
    temp.expiry = expiry || null;

    // dont overwrite existing creation time
    temp._creation = storedEntry?._creation || Date.now();
    // Set storage values
    this.#store.setItem(this.#pocketKey, JSON.stringify(temp));

    Satchel.#emit({
      key: this.#pocketKey,
      newValue: JSON.stringify(temp),
      oldValue: storedEntry ? JSON.stringify(storedEntry) : null,
      storageArea: Satchel.#storageAreaString(this.#store),
      action: 'set'
    });
    return this
  }

  /**
   * Check if current item is fresh.
   *
   * @returns {boolean|null} true if the item has not expired, null if the record doesn't exist.
   */
  isFresh() {
    const store = JSON.parse(this.#store.getItem(this.#pocketKey));
    if (!store) return null
    return !store?.expiry ? true : store.expiry - Date.now() > 0
  }

  /**
   * Returns the current namespaced Store key (pocket.key), the key is prefixed with 'stcl'.
   * Note that this is the internal reference to the key, not proof the key has been set to Storage.
   *
   * @returns {string} the key to the current pocket-key
   */
  getKey() {
    return this.#pocketKey
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
  static #emit(detail = {}) {
    const required = {
      key: null,
      newValue: null,
      oldValue: null,
      storageArea: null,
      action: null
    };
    detail = { ...required, ...detail };
    detail.url = window.location.href;
    const event = new CustomEvent('Satchel', {
      bubbles: true,
      cancelable: true,
      detail
    });
    return document.dispatchEvent(event)
  }

  /**
   * Get the Storage type as a string: 'localStorage' or 'sessionStorage'.
   *
   * @param {object} Storage object
   * @returns {string} the Storage type as a string 'localStorage' or 'SessionStorage'
   */
  static #storageAreaString(store) {
    return store === window.localStorage ? 'LocalStorage' : 'SessionStorage'
  }

  /**
   * Test if a value is an interable object.
   *
   * @param {*} doesit the value to be checked
   * @returns
   */
  #isObject(doesit) {
    return doesit && typeof doesit === 'object' && doesit.constructor === Object
  }

  /**
   * Returns an instance of Satchel associated with the given key, pocket,store, or false if none is found.
   *
   * @param {string} key key for the stored item
   * @param {string} [pocket='pocket'] namespace prefix, default 'pocket'
   * @param {string} [local='false'] specify sessionStorage (default) or localStorage
   * @returns {Satchel|false} new Satchel instance | false
   */
  static getSatchel(key, local = false, pocket = 'pocket') {
    if (!key) {
      throw new Error('Satchel.getSatchel(key): a "key" is required.')
    }
    if (typeof key !== 'string') {
      throw new Error('Satchel.getSatchel(key): "key" must be a string.')
    }
    if (typeof local !== 'boolean') {
      throw new Error(
        'Satchel.getSatchel(key, local): "local" must be a boolean.'
      )
    }
    if (typeof pocket !== 'string') {
      throw new Error(
        'Satchel.getSatchel(key, local, pocket): "pocket" must be an string.'
      )
    }

    const pocketKey = `${Satchel.stcl}.${pocket}.${key}`;
    const store = local ? window.localStorage : window.sessionStorage;
    const item = JSON.parse(store.getItem(pocketKey));
    if (!item || item.length === 0) return null

    return new Satchel(key, item, local, pocket)
  }

  /**
   * A static method for setting a Satchel key, without calling `new Satchel`.
   * When you want to use Satchel only for it's side effects.
   *
   * @param {string|null} key Storage key
   * @param {object} cargo The cargo payload to be saved to Storage
   * @property {object|string} cargo.data The data to be saved, may be string or object
   * @property {number|null} cargo.expiry The expiry time of the cargo ,may be a number or null
   * @param {boolean} [local=false] Specify sessionStorage (default) or localStorage
   * @param {string} [pocket='pocket'] Namespace for Storage keys, default is 'pocket'
   * @returns {undefined}
   */
  static setKey(key = null, cargo = {}, local = false, pocket = 'pocket') {
    /* eslint-disable no-new */
    new Satchel(key, cargo, local, pocket);
  }
}

export { Satchel };
//# sourceMappingURL=Satchel.js.map
