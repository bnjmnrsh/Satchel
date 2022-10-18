/**
 * I've swapped the parm order for getAllPocketKeys, tidyPocket and emptyPocket.
 * The tests in this branch have not yet been updated to reflect this.
 *
 * The approach below is a dead end, because tidyPocket and emptyPocket both rely on
 * getAllPocketKeys that in turn relies on the Satchel.stcl param, which is really just a prefix.
 *
 * If it is, the either we need to:
 *  - pass Satchel.stcl to each function (possibly as an optional third param)
 *  - or extend the Satchel instance and bundle these with that extended Class, using super to carry over this.stchl.
 *
 * Passing the Satchel instance to each function, isn't so bad so long as it's optional.
 * However extending the Satchel class will ultimately result in an even larger bundle, as you can't just import only the bits you want.
 *
 *  Is the extra namespaceing of Satchel.stcl really needed?
 */

/**
 * Emit custom event for Satchel pocket opperations.
 *
 * @param {object} detail Event details
 * @property {string|null} detail.pocket name of the Storage pocket being cleaned
 * @property {number|null} detail.keysBefore then number of keys in the pocket before emptyPocket or tidyPocket
 * @property {number|null} detail.keysAfter then number of keys in the pocket after emptyPocket or tidyPocket
 * @property {string} detail.storageArea, the type of Storage object
 * @property {string} detail.url, the url of the document whoes key changed
 * @property {string} detail.action the name of the Satchel function emiting the event
 * @returns {CustomEvent} CustomEvent
 */
function emitPocket(detail = {}) {
  const required = {
    pocket: null,
    keysBefore: null,
    keysRemaining: null,
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
function storageAreaString(store) {
  return store === window.localStorage ? 'LocalStorage' : 'SessionStorage'
}

/**
 * Returns array of keys for a 'Pocket' namespace.
 *
 * @param {string} pocket namespace prefix, default 'pocket'
 * @param {boolean} local specify sessionStorage (default) or localStorage
 * @returns {array} array of Storage keys for the current pocket.
 */
function getAllPocketKeys(local = false, pocket = 'pocket') {
  const store = local ? window.localStorage : window.sessionStorage

  const allKeys = Object.keys(store)
    .map((key) => {
      return key.startsWith(this.stcl + '.' + pocket) ? key : ''
    })
    .filter((e) => {
      return e
    })

  return Array.from(allKeys)
}

/**
 *  Removes all expired items from a given 'pocket' namespace
 *
 * @param {string} pocket namespace prefix, default 'pocket'
 * @param {boolean} local specify sessionStorage (default) or localStorage
 * @returns The number of items remaing in store that have yet to expire.
 */
function tidyPocket(local = false, pocket = 'pocket', stcl = 'stcl') {
  const store = local ? window.localStorage : window.sessionStorage
  const keysBefore = getAllPocketKeys(pocket, local)
  if (!keysBefore.length) return null

  Object.keys(keysBefore).forEach((key) => {
    const expiry = JSON.parse(store.getItem(keysBefore[key])).expiry
    if (!expiry || expiry - Date.now() > 0) return null
    store.removeItem(keysBefore[key])
  })
  const keysRemaining = getAllPocketKeys(local, pocket).length

  emitPocket(
    {
      pocket: String(pocket),
      keysBefore: Number(keysBefore.length),
      keysRemaining: Number(keysRemaining),
      storageArea: String(storageAreaString(store)),
      action: 'tidyPocket'
    },
    true
  )
  return keysRemaining
}

/**
 * Clears all items regardless of freshness from a given 'pocket' namespace
 *
 * @param {boolean} local specify sessionStorage (default) or localStorage
 * @param {string} pocket namespace prefix, default 'pocket'
 * @returns {array} The number of poket keys remaing in store, which if sucessful should be 0.
 */
function emptyPocket(local = false, pocket = 'pocket', stcl = 'stcl') {
  const store = local ? window.localStorage : window.sessionStorage
  const keysBefore = getAllPocketKeys(pocket, local)

  Object.keys(keysBefore).forEach((key) => {
    store.removeItem(keysBefore[key])
  })

  const keysAfter = getAllPocketKeys(local, pocket)
  const totalKeysRemaining = store.length

  emitPocket(
    {
      pocket: pocket,
      keysBefore: keysBefore.length,
      totalKeysRemaining,
      storageArea: storageAreaString(store),
      action: 'emptyPocket'
    },
    true
  )
  return [keysBefore, totalKeysRemaining]
}

export { emptyPocket, tidyPocket, getAllPocketKeys }
