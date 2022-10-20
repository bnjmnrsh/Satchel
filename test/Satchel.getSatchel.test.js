import { Satchel } from '../src/Satchel'
import { expect, jest, test, describe } from '@jest/globals'

describe('Satchel: Tests realated to Satchel.getSatchel()', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  test('Satchel.getSatchel() should throw if a key not set.', () => {
    const ERROR_MESSAGE = 'Satchel: a "key" is required.'
    expect(() => Satchel.getSatchel()).toThrow(new Error(ERROR_MESSAGE))
  })

  test('Satchel.getSatchel() should throw if a key not a string.', () => {
    const ERROR_MESSAGE = 'Satchel: "key" must be a string.'
    expect(() => Satchel.getSatchel(42)).toThrow(new Error(ERROR_MESSAGE))
  })

  test('Satchel.getSatchel() should throw if the localStore parameter is not a boolian.', () => {
    const ERROR_MESSAGE = 'Satchel: local must be a boolean.'
    expect(() => Satchel.getSatchel('taco', null)).toThrow(
      new Error(ERROR_MESSAGE)
    )
  })

  test('Satchel.getSatchel() should throw if result does not have data or expiry attributes.', () => {
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
    const retrievedTaco = Satchel.getSatchel('taco', true, 'pocket')
    expect(retrievedTaco).toBeInstanceOf(Satchel)
    expect(retrievedTaco.get()).toHaveProperty('data', 'a tasty treat')
  })

  test('Satchel.getSatchel() to return false if no object in store', () => {
    const notThere = Satchel.getSatchel('burrito')
    expect(notThere).toBe(false)
  })
})
