/**
 * A utility library for managaing namespaced sessionStorage and localStorage entries.
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
    this.#store = local ? window.localStorage : window.sessionStorage
    if (!key) {
      throw new Error('Satchel: a "key" is required.')
    }
    if (typeof key !== 'string') {
      throw new Error('Satchel: "key" must be a string.')
    }
    if (typeof cargo !== 'object') {
      throw new Error('Satchel: {cargo} must be an object.')
    }
    if (typeof local !== 'boolean') {
      throw new Error('Satchel: "local" must be a boolean.')
    }
    if (typeof pocket !== 'string') {
      throw new Error('Satchel: "pocket" must be a string.')
    }

    this.#pocketKey = `${Satchel.stcl}.${pocket}.${key}`
    this.#settings = { data: undefined, expiry: null }

    cargo = { ...this.#settings, ...cargo }

    // Set the cargo to Storage
    this.set(cargo)
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
    this._stcl = prefix
  }

  /**
   * Getter for Satchel.stcl property
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
   * @typedef {object} age object
   * @property {number} age in milliseconds
   * @property {number} creation Date.now() (ms)src/Satchel.js
   * @property {boolean} fresh if Store key is fresh
   * @return {Age} An age object representing the age of the current Store key.
   */
  age() {
    const store = JSON.parse(this.#store.getItem(this.#pocketKey))
    if (!store) return null
    return {
      age: Number(Date.now() - store.creation),
      creation: Number(store.creation),
      expiry: store.expiry ? Number(store.expiry) : null,
      fresh: Boolean(this.isFresh())
    }
  }

  /**
   * Remove the current namespaced key from the store.
   *
   * @returns { boolian:true | null } Returns true on success, or null if no record found.
   */
  bin() {
    const item = this.#store.getItem(this.#pocketKey)
    if (!item) return null
    this.#store.removeItem(this.#pocketKey)
    Satchel.#emit({
      key: String(this.#pocketKey),
      oldValue: String(item),
      storageArea: String(Satchel.#storageAreaString(this.#store)),
      action: 'bin'
    })
    return true
  }

  /**
   * Get the data for the current Storage key.
   *
   * @param {boolean} getStale flag to ignore stale entries from a "pocket"
   * @returns {object|boolan:false} the data for the stored key or false.
   */
  get(getStale = false) {
    const item = this.#store.getItem(this.#pocketKey)
    if (!item) return false
    if ((this.isFresh() && !getStale) || getStale) {
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
   * @return {object} Satchel
   */
  set({ data, expiry }) {
    if (typeof expiry !== 'number' && expiry !== null) {
      throw new Error(
        'Satchel.set({expiry}): "expiry" must be null or a number.'
      )
    }
    if (data && typeof data !== 'string' && typeof data !== 'object') {
      throw new Error(
        'Satchel.set({data}): "data" must be a string or an object.'
      )
    }
    if (data && typeof data === 'object') {
      try {
        JSON.parse(JSON.stringify(data))
      } catch (e) {
        throw new Error(`Satchel.set({data}): 'data': ${e}`)
      }
    }
    const storedEntry = this.get(true)
    const temp = {}
    temp.data = data || null
    temp.expiry = expiry || null

    // dont overwrite existing creation time
    temp.creation = Number(storedEntry.creation) || Date.now()
    // Set storage values
    this.#store.setItem(this.#pocketKey, JSON.stringify(temp))

    Satchel.#emit({
      key: String(this.#pocketKey),
      newValue: JSON.stringify(temp),
      oldValue: storedEntry ? JSON.stringify(storedEntry) : null,
      storageArea: String(Satchel.#storageAreaString(this.#store)),
      action: 'set'
    })
    return this
  }

  /**
   * Check if current item is fresh.
   *
   * @returns {boolean|null} true if the item has not expired, null if the record doesn't exist.
   */
  isFresh() {
    const store = JSON.parse(this.#store.getItem(this.#pocketKey))
    if (!store) return null
    return Boolean(!store?.expiry ? true : store.expiry - Date.now() > 0)
  }

  /**
   * Returns the current namespaced Store key (pocket.key), the key is prefixed with 'stcl'.
   * Note that this is the internal reference to the key, not proof the key has been set to Storage.
   *
   * @returns {string} the key to the current pocket-key
   */
  getKey() {
    return String(this.#pocketKey)
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
      url: String(window.location.href),
      action: null
    }
    detail = { ...required, ...detail }
    const event = new CustomEvent('Satchel', {
      bubbles: true,
      cancelable: true,
      detail
    })
    return document.dispatchEvent(event)
  }

  /**
   * Get the Storage type as a string 'localStorage' or 'sessionStorage'
   *
   * @param {object} Storage object
   * @returns {string} the Storage type as a string 'localStorage' or 'SessionStorage'
   */
  static #storageAreaString(store) {
    return store === window.localStorage ? 'LocalStorage' : 'SessionStorage'
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

    const pocketKey = `${Satchel.stcl}.${pocket}.${key}`
    const store = local ? window.localStorage : window.sessionStorage
    const item = JSON.parse(store.getItem(pocketKey))
    if (!item || item.length === 0) return false

    return new Satchel(key, item, local, pocket)
  }
}

export { Satchel }
