/*
  Because Satchel.#emit is private, we can't use jest.spyOn, and we can't mock it,
  as suggested by many articles like this one:
  https://ilikekillnerds.com/2020/02/testing-event-listeners-in-jest-without-using-a-library/

  We can, however, use jest-environment-jsdom to listen for CustomEvents on the window.
  We can then use just.fn() to mock the event response instead. In this case, our event payload
  includes timestamps which presents a challenge, because after unwinding the returned Promise,
  Jest does not provide methods for easy testing individual property values, like we can with
  `expect.objectContaining()`. Instead, we need to work with `.resolves.toReturnWith()`
  to access the Promise response, and so we must test against a preconfigured object.
  Because we can't choose which properties within the promise response to test,
  we must first remove any data that might change unpredictably
  like timestamps), from within jest.fn() before it returns.
*/

import { Satchel, emptyPocket, tidyPocket } from '../src/Satchel'
import { expect, jest, test, describe } from '@jest/globals'

describe('Satchel: testing custom events', () => {
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

  test('Satchel: Test set() custom event', async () => {
    const expectedReturn = {
      action: 'set',
      key: 'stcl.pocket.taco',
      newValue: JSON.stringify({
        data: 'a tasty treat',
        expiry: null,
        creation: null
      }),
      oldValue: null,
      storageArea: 'SessionStorage',
      url: null
    }
    window.addEventListener('Satchel', fn)
    new Satchel('taco', { data: 'a tasty treat' })
    expect(Promise.resolve(fn)).resolves.toReturnWith(expectedReturn)
    removeEventListener('Satchel', fn)
  })

  test('Satchel: Test bin() custom event', () => {
    const expectedReturn = {
      action: 'bin',
      key: 'stcl.pocket.taco',
      newValue: null,
      oldValue: JSON.stringify({
        data: 'a tasty treat',
        expiry: null,
        creation: null
      }),
      storageArea: 'SessionStorage',
      url: null
    }
    const mySatchel = new Satchel('taco', { data: 'a tasty treat' })
    window.addEventListener('Satchel', fn)
    mySatchel.bin()
    expect(Promise.resolve(fn)).resolves.toHaveLastReturnedWith(expectedReturn)
    removeEventListener('Satchel', fn)
  })
})
