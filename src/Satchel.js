/**
 * A utility for managaing sessionStorage and localStorage
 *
 */
class Satchel {
  #stcl = 'stcl'
  #pocketKey
  #storage

  /**
   * @class Satchel
   * @classdec Create new Satchel instance
   * @param {string} key Storage key
   * @param {object} cargo The data to be saved to Storage
   * @param {boolean} local Specify sessionStorage (default) or localStorage
   * @param {string} pocket Namespace for Storage keys
   */
  constructor(key = null, cargo = {}, local = false, pocket = 'satchel') {
    this.#storage = local ? localStorage : sessionStorage

    if (!this.#storageAvailable(this.#storage)) return false
    if (!key) throw new Error('Satchel: a Key is required.')

    this.#pocketKey = `${this.#stcl}.${this.pocket}.${this.key}`

    this.settings = { data: undefined, expiry: null }
    this.cargo = { ...this.settings, ...cargo }

    // Keep creation time from being edited
    Object.defineProperty(this.cargo, 'creation', {
      enumerable: true,
      writable: false,
      value: Date.now()
    })

    // Send the cargo to Storage
    this.set(this.cargo)
  }

  /**
   * Use Storage events?
   * TODO:https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#responding_to_storage_changes_with_the_storageevent
   *
   * Emit custom events for Satchel
   * @typedef {CustomEvent}
   * @param {object} detail current CustomEvent details
   * @property {string} detail.type, the type of Storage object
   * @property {string} detail.key name of the Storage key being called
   * @property {string} detail.action the name of the function emiting the event
   * @property {string | null} detail.data the stringified data for the given key
   * @returns {CustomEvent} CustomEvent
   */
  #emit(detail) {
    const required = {
      type: null,
      key: null,
      action: null,
      data: null
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
   * Todo: replace with https://www.npmjs.com/package/storage-available
   *
   * Borrowed humbly from https://www.npmjs.com/package/storage-available
   * @returns {boolean} true if the environment has localStorage
   */
  #storageAvailable(type) {
    // let SatchelStorgeTest

    // const key = '__testSatchelEnv__'
    // if (SatchelStorgeTest !== undefined) return false
    // try {
    //   if (!localStorage) return false
    // } catch (e) {
    //   console.warn(e)
    //   return false
    // }
    // try {
    //   localStorage.setItem(key, key)
    //   localStorage.removeItem(key, key)
    //   SatchelStorgeTest = true
    // } catch (e) {
    //   SatchelStorgeTest = !!(this.#isOutOfSpace(e) && localStorage.length)
    // }
    // return SatchelStorgeTest

    try {
      storageAvailable(type)
    } catch (e) {
      if (!this.#storageFull(type)) return false
      try {
        // pruneStorageAvailable(type)
      } catch (e) {
        return false
      }
    }
  }

  /**
   * Borrowed humbly from https://github.com/pamelafox/lscache/blob/master/lscache.js
   * @returns {boolean} true if the environment has localStorage
   */
  #storageFull(e) {
    return (
      e &&
      (e.name === 'QUOTA_EXCEEDED_ERR' ||
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        e.name === 'QuotaExceededError')
    )
  }

  /**
   * Returns an object of age and freshness related data
   *
   * @typedef {Object} Age object
   * @property {number} age in milliseconds
   * @property {number} creation Date.now() (ms)
   * @property {boolean} fresh if Store key is fresh
   * @return {Age} An age object representing the age of the current Store key.
   */
  age() {
    const store = JSON.parse(this.#storage.getItem(this.#pocketKey))
    return {
      age: Date.now() - store.creation,
      creation: store.creation,
      expiry: store.expiry,
      fresh: this.isFresh()
    }
  }

  /**
   *
   * @returns {null | boolian:false } nullif su
   */
  bin() {
    this.#storage.removeItem(this.#pocketKey)

    if (!this.#storage.getItem(this.#pocketKey)) {
      this.#emit({
        type: this.#storage,
        key: this.#pocketKey,
        action: 'bin'
      })
      return null
    }
  }

  get(ignore = false) {
    const item = this.#storage.getItem(this.#pocketKey)
    if (this.isFresh() && !ignore) {
      return item
    } else if (ignore) {
      return JSON.parse(this.#storage.getItem(this.#pocketKey))
    }

    this.#emit({
      type: this.#storage,
      key: this.#pocketKey,
      action: 'get',
      data: item
    })

    return this
  }

  /**
   * Sets the data, for a given key and namespace
   *
   * @param {Object} settings object
   * @property {Object} data the Storage object to set
   * @property {number} expiry the expiery date in (ms)
   * @property {string} creation the creation date in (ms) Date.now()
   *
   * @return {Object} Satchel
   */
  set({ data, expiry, creation }) {
    const current = this.get(true)
    const temp = {}
    temp.data = data || null
    temp.expiry = expiry || this.cargo?.expiry || null
    temp.creation = current?.creation || this.cargo.creation // dont overwrite existing creation time

    this.#storage.setItem(this.#pocketKey, JSON.stringify(temp))

    this.#emit({
      type: this.#storage,
      key: this.#pocketKey,
      action: 'set',
      data: temp
    })
    return this
  }

  /**
   * Check if current item is fresh.
   *
   * @returns {boolean} true if the item has not expired
   */
  isFresh() {
    const store = JSON.parse(this.#storage.getItem(this.#pocketKey))
    return !store?.expiry ? true : store.expiry - Date.now() > 0
  }

  /**
   * Returns the current namespaced Store key (pocket.key)
   *
   * @returns string
   */
  getID() {
    return this.#pocketKey
  }

  /**
   * TODO: remove .includes for a more robust check
   *
   * Returns array of keys for the a 'pocket' namespace.
   *
   * @param {string} pocket namespace prefix, default 'satchel'
   * @param {boolean} local specify sessionStorage (default) or localStorage
   * @returns {array} array of Storage keys for the current pocket.
   */
  static getAllPocketKeys(pocket = 'satchel', local = false) {
    return Object.keys(localStorage)
      .map((key) => {
        return key.startsWith(this.#stcl + '.' + pocket) ? key : ''
      })
      .filter(function (e) {
        return e
      })
  }

  /**
   * Clears all items in a specified 'pocket' namespace, default 'satchel'
   *
   * @param {string} pocket namespace prefix, default 'satchel'
   * @param {boolean} local specify sessionStorage (default) or localStorage
   * @returns {numbererger} The number of items remaing in store, which if sucessful should be 0.
   */
  static emptyPocket(pocket = 'satchel', local = false) {
    const store = local ? localStorage : sessionStorage
    const items = Satchel.getAllPocketKeys(this.#stcl + '.' + pocket, store)
    if (!items.length) return null

    Object.keys(items).forEach((item) => {
      store.removeItem(items[item])
    })

    const remaing = Satchel.getAllPocketKeys(pocket, store).length

    document.dispatchEvent(
      new CustomEvent('Satchel', {
        bubbles: true,
        cancelable: true,
        detail: {
          action: 'emptyPocket',
          remaing
        }
      })
    )

    return remaing
  }

  /**
   *  Destroys all expired items from a given 'pocket' namespace
   *
   * @param {string} pocket namespace prefix, default 'satchel'
   * @param {boolean} local specify sessionStorage (default) or localStorage
   * @returns The number of items remaing in store that have yet to expire.
   */
  static cleanPocket(pocket = 'satchel', local = false) {
    const store = local ? localStorage : sessionStorage
    const items = Satchel.getAllPocketKeys(pocket, store)
    if (!items.length) return null

    Object.keys(items).forEach((item) => {
      const expiry = JSON.parse(store.getItem(items[item])).expiry
      if (!expiry || expiry - Date.now() > 0) return null
      store.removeItem(items[item])
    })
    const remaing = Satchel.getAllPocketKeys(
      this.#stcl + '.' + pocket,
      store
    ).length

    document.dispatchEvent(
      new CustomEvent('SatchelStatic', {
        bubbles: true,
        cancelable: true,
        detail: {
          action: 'cleanPocket',
          remaing
        }
      })
    )

    return remaing
  }

  /**
   * Returns an instance of Satchel associated with the provided key, or false.
   *
   * @param {string} key  key for target item
   * @param {string} pocket namespace prefix, default 'satchel'
   * @param {string} local specify sessionStorage (default) or localStorage
   * @returns {Satchel} new Satchel instance | false
   */
  static getKey(key, pocket = 'satchel', local = false) {
    const pocketKey = `${this.#stcl}.${this.pocket}.${this.key}`
    const store = local ? localStorage : sessionStorage
    const item = store.getItem(pocketKey)
    if (!item) return false

    return new Satchel(key, null, local, pocket)
  }
}

export { Satchel }
