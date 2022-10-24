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
    action: null,

    pocket: null,
    remainingPocketKeys: null,
    startingPocketKeys: null,
    remainingKeysInStore: null,
    storageArea: null,
    url: String(window.location.href)
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
function getAllPocketKeys(local = false, pocket = 'pocket', stcl = 'stcl') {
  const store = local ? window.localStorage : window.sessionStorage

  const allKeys = Object.keys(store)
    .map((key) => {
      return key.startsWith(stcl + '.' + pocket) ? key : ''
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
  const pocketKeys = getAllPocketKeys(local, pocket)
  if (!pocketKeys.length) return null

  Object.keys(pocketKeys).forEach((key) => {
    const expiry = JSON.parse(store.getItem(pocketKeys[key])).expiry
    if (!expiry || expiry - Date.now() > 0) return null
    store.removeItem(pocketKeys[key])
  })
  const remainingPocketKeys = getAllPocketKeys(local, pocket)

  emitPocket(
    {
      action: 'tidyPocket',
      pocket: String(pocket),
      remainingPocketKeys: getAllPocketKeys(local, pocket).length,
      startingPocketKeys: Number(pocketKeys.length),
      remainingKeysInStore: Number(store.length),
      storageArea: String(storageAreaString(store))
    },
    true
  )
  return [remainingPocketKeys.length, store.length]
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
  const pocketKeys = getAllPocketKeys(local, pocket)

  Object.keys(pocketKeys).forEach((key) => {
    store.removeItem(pocketKeys[key])
  })

  const remainingPocketKeys = getAllPocketKeys(local, pocket)

  emitPocket(
    {
      action: 'emptyPocket',
      pocket: String(pocket),
      remainingPocketKeys: Number(remainingPocketKeys.length),
      startingPocketKeys: Number(pocketKeys.length),
      remainingKeysInStore: Number(store.length),
      storageArea: String(storageAreaString(store))
    },
    true
  )
  return [remainingPocketKeys.length, store.length]
}

export { emptyPocket, tidyPocket, getAllPocketKeys }
