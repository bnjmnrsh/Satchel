/*
  See notes within events.test.js for details.
*/

import { Satchel } from '../src/Satchel'
import { emptyPocket, tidyPocket, getAllPocketKeys } from '../src/bindle'
import { expect, jest, test, describe } from '@jest/globals'

describe('Satchel: testing custom events coming from extras.', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  const fn = jest.fn((e) => {
    const eventData = e.detail

    // We nuke the creation timestamps so we can run deterministic tests
    if (eventData.newValue) {
      let newValue = JSON.parse(eventData.newValue)
      newValue.creation = null
      eventData.newValue = JSON.stringify(newValue)
    }

    if (eventData.oldValue) {
      let oldValue = JSON.parse(eventData.oldValue)
      oldValue.creation = null
      eventData.oldValue = JSON.stringify(oldValue)
    }

    eventData.url = null // URL could change depeding on testing environment, so null

    return eventData
  })

  test('Satchel: Test tidyPocket() custom event', () => {
    const expectedReturn = {
      action: 'tidyPocket',
      pocket: 'pocket',
      remainingPocketKeys: 1,
      startingPocketKeys: 2,
      remainingKeysInStore: 1,
      storageArea: 'SessionStorage',
      url: null
    }
    new Satchel('taco', { data: 'a tasty treat', expiry: null })
    new Satchel('old-taco', {
      data: 'a sad mushy plate',
      expiry: Date.now() - 50000
    })

    window.addEventListener('Satchel', fn)
    tidyPocket()
    expect(Promise.resolve(fn)).resolves.toHaveLastReturnedWith(expectedReturn)
    removeEventListener('Satchel', fn)
  })

  test('Satchel: Test emptyPocket() custom event', () => {
    const expectedReturn = {
      action: 'emptyPocket',
      pocket: 'pocket',
      remainingPocketKeys: 0,
      startingPocketKeys: 2,
      remainingKeysInStore: 1,
      storageArea: 'SessionStorage',
      url: null
    }
    // set items
    new Satchel('taco', { data: 'a tasty treat', expiry: null })
    new Satchel('old-taco', {
      data: 'a sad mushy plate',
      expiry: Date.now() - 50000
    })
    // set non Satchel item
    sessionStorage.setItem('test', null)

    window.addEventListener('Satchel', fn)
    emptyPocket()
    expect(Promise.resolve(fn)).resolves.toHaveLastReturnedWith(expectedReturn)
    removeEventListener('Satchel', fn)
  })
})
