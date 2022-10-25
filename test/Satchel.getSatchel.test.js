import { Satchel } from '../src/Satchel'
import { expect, jest, test, describe } from '@jest/globals'

describe('Satchel: Tests realated to Satchel.getSatchel()', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  test('Satchel.getSatchel() should throw if a key not set.', () => {
    const ERROR_MESSAGE = 'Satchel.getSatchel(key): a "key" is required.'
    expect(() => Satchel.getSatchel()).toThrow(new Error(ERROR_MESSAGE))
  })

  test('Satchel.getSatchel() should throw if a key not a string.', () => {
    const ERROR_MESSAGE = 'Satchel.getSatchel(key): "key" must be a string.'
    expect(() => Satchel.getSatchel(42)).toThrow(new Error(ERROR_MESSAGE))
  })

  test('Satchel.getSatchel() should throw if the localStore parameter is not a boolian.', () => {
    const ERROR_MESSAGE =
      'Satchel.getSatchel(key, local): "local" must be a boolean.'
    expect(() => Satchel.getSatchel('taco', null)).toThrow(
      new Error(ERROR_MESSAGE)
    )
  })

  test('Satchel.getSatchel() should throw if the the pocket parameter is not a string.', () => {
    const ERROR_MESSAGE =
      'Satchel.getSatchel(key, local, pocket): "pocket" must be an string.'
    expect(() => Satchel.getSatchel('taco', true, 42)).toThrow(
      new Error(ERROR_MESSAGE)
    )
  })

  test('Satchel.getSatchel() to create a Satchel object, from a given key, pocket, store', () => {
    let taco = new Satchel('taco', { data: 'a tasty treat' })
    const retrievedTaco = Satchel.getSatchel('taco')
    expect(retrievedTaco).toBeInstanceOf(Satchel)
    expect(retrievedTaco.get()).toHaveProperty('data', 'a tasty treat')
  })

  test('Satchel.getSatchel() to return null if no object in store', () => {
    const notThere = Satchel.getSatchel('burrito')
    expect(notThere).toBe(null)
  })
})
