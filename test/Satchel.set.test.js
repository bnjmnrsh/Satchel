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
    expect(taco.get(true)).toHaveProperty('_creation')
    expect(taco.get(true)._creation).toBeLessThanOrEqual(Date.now())
  })

  test('Satchel.set() throw error when trying to set anything other then a number, string or object to cargo.data.', () => {
    const ERROR_MESSAGE =
      'Satchel.set({data}): must be either null or a number, string or object.'

    function badTaco() {
      new Satchel('taco', {
        data: [42],
        expiry: null
      })
    }
    expect(() => badTaco()).toThrow(new Error(ERROR_MESSAGE))
  })

  test('Satchel.set() throw error when trying to set a bigInt to cargo.data.', () => {
    const ERROR_MESSAGE =
      'Satchel.set({data}): must be either null or a number, string or object.'

    function badTaco() {
      new Satchel('taco', {
        data: 9007199254740991n,
        expiry: null
      })
    }
    expect(() => badTaco()).toThrow(new Error(ERROR_MESSAGE))
  })

  test('Satchel.set() throw error when trying to set object with circular structure to cargo.data.', () => {
    const ERROR_MESSAGE = `Satchel.set({data}): TypeError: Converting circular structure to JSON
    --> starting at object with constructor 'Object'
    --- property 'myself' closes the circle`
    function badTaco() {
      const circularReference = {}
      circularReference.myself = circularReference

      new Satchel('taco', {
        data: circularReference
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

  test('Satchel.set({data}) should not overwrite existing expiry values, if declared.', () => {
    const testTaco = new Satchel('testTaco', {
      data: 'testTaco',
      expiry: 1666878565201
    })

    expect(testTaco.get(true).expiry).toBe(1666878565201)
    expect(testTaco.get(true).data).toBe('testTaco')

    testTaco.set({ data: 'newTestTaco' })

    expect(testTaco.get(true).expiry).toBe(1666878565201)
    expect(testTaco.get(true).data).toBe('newTestTaco')

    testTaco.set({ expiry: 1666878977865 })
  })

  test('Satchel.set(expiry) should not overwrite existing data values if declared.', () => {
    const testTaco = new Satchel('testTaco', {
      data: 'testTaco',
      expiry: 1666878565201
    })

    expect(testTaco.get(true).expiry).toBe(1666878565201)
    expect(testTaco.get(true).data).toBe('testTaco')

    testTaco.set({ expiry: 1666878977865 })

    expect(testTaco.get(true).expiry).toBe(1666878977865)
    expect(testTaco.get(true).data).toBe('testTaco')
  })
})
