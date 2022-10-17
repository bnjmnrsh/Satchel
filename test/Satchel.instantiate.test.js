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

  test('Satchel.getSatchel() should throw an error if a key not set.', () => {
    const ERROR_MESSAGE = 'Satchel: a "key" is required.'
    expect(() => Satchel.getSatchel()).toThrow(new Error(ERROR_MESSAGE))
  })

  test('Satchel should throw an error if a key not a string.', () => {
    const ERROR_MESSAGE = 'Satchel: "key" must be a string.'
    expect(() => new Satchel(42)).toThrow(new Error(ERROR_MESSAGE))
  })

  test('Satchel.getSatchel() should throw an error if a key not a string.', () => {
    const ERROR_MESSAGE = 'Satchel: "key" must be a string.'
    expect(() => Satchel.getSatchel(42)).toThrow(new Error(ERROR_MESSAGE))
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

  test('Satchel.getSatchel() should throw an error if the localStore parameter is not a boolian.', () => {
    const ERROR_MESSAGE = 'Satchel: local must be a boolean.'
    expect(() => Satchel.getSatchel('taco', 'pocket', null)).toThrow(
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

  test('Satchel: instantiate a localStorage entry', () => {
    localStorage.clear()
    sessionStorage.clear()
    const taco1 = new Satchel('taco', { data: null, expiry: null }, true) // localStorage
    expect(sessionStorage.length).toEqual(0)
    expect(localStorage.length).toEqual(1)
  })

  test('Satchel: instantiate a sessionStorage entry', () => {
    localStorage.clear()
    sessionStorage.clear()
    const taco1 = new Satchel('taco', { data: null, expiry: null }, false) // sessionStorage
    expect(sessionStorage.length).toEqual(1)
    expect(localStorage.length).toEqual(0)
  })

  test('Satchel: instantiate localStore and sessionStore entries.', () => {
    localStorage.clear()
    sessionStorage.clear()
    const localTaco = new Satchel('taco', { data: null, expiry: null }, true) // localStorage
    const sessionTaco = new Satchel('taco', { data: null, expiry: null }, false) // sessionStorage is default

    expect(sessionStorage.length).toEqual(1)
    expect(localStorage.length).toEqual(1)
  })

  test('Satchel.set() thow error when attempting to set a key that already exsists.', () => {
    const ERROR_MESSAGE =
      'Satchel: The key ("stcl.pocket.taco") already exists in SessionStorage, and "data" and "expiry" atributes have not been set, set these or create a new unique key.'

    try {
      const taco1 = new Satchel('taco')
      const taco2 = new Satchel('taco')
    } catch (e) {
      expect(e.message).toBe(ERROR_MESSAGE)
    }
  })

  test('Satchel.set() throw error when trying to set anything other then a string or an object to cargo.data.', () => {
    const ERROR_MESSAGE = 'Satchel: Data must be a string or an object.'

    function badTaco() {
      new Satchel('taco', {
        data: 42,
        expiry: null,
        creation: Date.now()
      })
    }
    expect(() => badTaco()).toThrow(new Error(ERROR_MESSAGE))
  })

  test('Satchel.getSatchel() should throw an error if result does not have data or expiry attributes.', () => {
    const ERROR_MESSAGE =
      'Satchel: The key ("stcl.pocket.taco") already exists in SessionStorage, and "data" and "expiry" atributes have not been set, set these or create a new unique key.'
    sessionStorage.setItem('stcl.pocket.taco', JSON.stringify({}))
    expect(() => Satchel.getSatchel('taco')).toThrow(ERROR_MESSAGE)
  })

  test('Satchel.getSatchel() to create a Satchel object, from a given key, pocket, store', () => {
    let taco = new Satchel(
      'taco',
      { data: 'a tasty treat', expiry: null },
      true
    )
    taco = null
    const retrievedTaco = Satchel.getSatchel('taco', 'pocket', true)
    expect(retrievedTaco).toBeInstanceOf(Satchel)
    expect(retrievedTaco.get()).toHaveProperty('data', 'a tasty treat')
  })

  test('Satchel.getSatchel() to return false if no object in store', () => {
    const notThere = Satchel.getSatchel('burrito')
    expect(notThere).toBe(false)
  })
})
