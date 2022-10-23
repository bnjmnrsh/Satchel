import { Satchel } from '../src/Satchel'
import { expect, jest, test, describe } from '@jest/globals'

describe('Satchel: Test Satchel.set()', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  test('Satchel.set() to create a stale entry with a key of "taco" and a data value of "good with guaque"', () => {
    const KEY = 'taco'
    const VALUE = 'good with guaque'
    const EXP = Date.now()

    const taco = new Satchel(KEY)
    taco.set({ data: VALUE, expiry: EXP })

    expect(taco).toBeInstanceOf(Satchel)
    expect(taco.isFresh()).toBe(false)
    expect(taco.get()).toBe(false)

    expect(taco.get(true)).toHaveProperty('expiry', EXP)
    expect(taco.get(true)).toHaveProperty('data', VALUE)
    expect(taco.get(true)).toHaveProperty('creation')
    expect(taco.get(true).creation).toBeLessThanOrEqual(Date.now())
  })

  test('Satchel.set() throw error when trying to set anything other then a string or an object to cargo.data.', () => {
    const ERROR_MESSAGE =
      'Satchel.set({data}): "data" must be a string or an object.'

    function badTaco() {
      new Satchel('taco', {
        data: 42,
        expiry: null
      })
    }
    expect(() => badTaco()).toThrow(new Error(ERROR_MESSAGE))
  })

  test('Satchel.set() throw error when trying to set anything other then a number or null to cargo.expiry.', () => {
    const ERROR_MESSAGE =
      'Satchel.set({expiry}): "expiry" must be null or a number.'

    function badTaco() {
      new Satchel('taco', {
        expiry: 'bad-taco'
      })
    }
    expect(() => badTaco()).toThrow(new Error(ERROR_MESSAGE))
  })
})
