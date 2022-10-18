import { Satchel } from '../src/Satchel'
import { expect, jest, test, describe } from '@jest/globals'

describe('Satchel: Tests realated to instantiation', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  test('Satchel should throw an error if a key not set.', () => {
    const ERROR_MESSAGE = 'Satchel: a "key" is required.'
    expect(() => new Satchel()).toThrow(new Error(ERROR_MESSAGE))
  })

  test('Satchel should throw an error if a key not a string.', () => {
    const ERROR_MESSAGE = 'Satchel: "key" must be a string.'
    expect(() => new Satchel(42)).toThrow(new Error(ERROR_MESSAGE))
  })

  test('Satchel should throw an error if cargo is not an object.', () => {
    const ERROR_MESSAGE = 'Satchel: {cargo} must be an object.'
    expect(() => new Satchel('taco', 42)).toThrow(new Error(ERROR_MESSAGE))
  })

  test('Satchel should throw an error if the localStore parameter is not a boolian.', () => {
    const ERROR_MESSAGE = 'Satchel: local must be a boolean.'
    expect(() => new Satchel('taco', null, null)).toThrow(
      new Error(ERROR_MESSAGE)
    )
  })

  test('Satchel should throw an error if the "pocket" parameter is not a string.', () => {
    const ERROR_MESSAGE = 'Satchel: "pocket" must be an string.'
    expect(() => new Satchel('taco', null, false, 42)).toThrow(
      new Error(ERROR_MESSAGE)
    )
    expect(() => Satchel.getSatchel('taco', null, false, 42)).toThrow(
      new Error(ERROR_MESSAGE)
    )
  })

  test('Satchel should throw an error if passed anything other then "null" or a numeric value for "expiry"', () => {
    const ERROR_MESSAGE = 'Satchel: Expiry must be null or a number.'
    function badTacos() {
      new Satchel('bad-tacos', { data: null, expiry: 'guaque' })
    }
    expect(() => badTacos()).toThrow(new Error(ERROR_MESSAGE))
  })

  test('Create new localStore instance of Satchel, with a Pocket of "tacos" and a Key of "Chicken" holding a data value of "very good with guaque"', () => {
    const POCKET = 'tacos'
    const KEY = 'chicken'
    const VALUE = 'very good with guaque'
    const DATE = Date.now()

    const chicken = new Satchel(
      KEY,
      { data: VALUE, expired: null },
      true,
      POCKET
    )
    expect(chicken).toBeInstanceOf(Satchel)
    expect(chicken.get()).toHaveProperty('data', VALUE)
    expect(chicken.get()).toHaveProperty('expiry', null)
    expect(chicken.get()).toHaveProperty('creation')
    expect(chicken.getKey()).toBe('stcl.tacos.chicken')
  })

  test('Instantiate seperate localStore and sessionStore entries.', () => {
    localStorage.clear()
    sessionStorage.clear()
    const localTaco = new Satchel('taco', { data: null, expiry: null }, true) // localStorage
    const sessionTaco = new Satchel('taco', { data: null, expiry: null }, false) // sessionStorage is default

    expect(sessionStorage.length).toEqual(1)
    expect(localStorage.length).toEqual(1)
  })
})
