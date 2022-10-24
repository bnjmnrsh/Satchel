import { Satchel } from '../src/Satchel'
import { emptyPocket, tidyPocket, getAllPocketKeys } from '../src/bindle'
import { expect, jest, test, describe } from '@jest/globals'

describe('Satchel: testing pocket cleanup methods exported from extras.js', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  test('Test getAllPocketKeys() to retrieve all keys in a "pocket"', () => {
    // create non pocket entries
    ;[...Array(10)].forEach((element, i) =>
      sessionStorage.setItem(`test-${i}`, 'test')
    )
    // create pocket entries
    ;[...Array(10)].forEach(
      (element, i) => new Satchel(`test-${i}`, {}, false, 'taco-truck')
    )
    const pocketKeys = getAllPocketKeys(false, 'taco-truck')
    expect(pocketKeys.length).toEqual(10)
  })

  test('Test getAllPocketKeys() to for custom "pocket" and Satchel.stcl in localStore', () => {
    Satchel.stcl = 'test'

    // create pocket entries
    ;[...Array(10)].forEach(
      (element, i) => new Satchel(`test-${i}`, {}, true, 'taco-truck')
    )
    const pocketKeys = getAllPocketKeys(true, 'taco-truck', 'test')
    expect(pocketKeys.length).toEqual(10)
    Satchel.stcl = 'stcl'
  })

  test('Test getAllPocketKeys to return 0 when no items in pocket', () => {
    const pocketKeys = getAllPocketKeys(false, 'false-pocket')
    expect(pocketKeys.length).toEqual(0)
  })

  test('Test emptyPocket() to remove all entries from a "pocket"', () => {
    // create non pocket entries
    ;[...Array(10)].forEach((element, i) =>
      sessionStorage.setItem(`test-${i}`, 'test')
    )
    // create pocket entries
    ;[...Array(10)].forEach(
      (element, i) => new Satchel(`test-${i}`, {}, false, 'taco-truck')
    )

    expect(sessionStorage.length).toEqual(20)
    const empty = emptyPocket(false, 'taco-truck')
    expect(empty).toEqual([0, 10])
    expect(sessionStorage.length).toEqual(10)
  })

  test('Test emptyPocket() to return null when no items found for a "pocket"', () => {
    expect(emptyPocket()).toBe(null)
  })

  test('Test tidyPocket() to remove a stale entry from a "pocket"', () => {
    // create non pocket entries
    ;[...Array(10)].forEach((element, i) =>
      sessionStorage.setItem(`test-${i}`, 'test')
    )
    // create expired pocket entries
    ;[...Array(9)].forEach(
      (element, i) =>
        new Satchel(
          `test-${i}`,
          { expiry: Date.now() - 1000 },
          false,
          'taco-truck'
        )
    )
    // create one that is not expired
    new Satchel(
      'not expired!',
      { data: 'some data', expiry: null },
      false,
      'taco-truck'
    )
    expect(sessionStorage.length).toEqual(20)
    const tidy = tidyPocket(false, 'taco-truck')
    expect(sessionStorage.length).toEqual(11)
    expect(tidy).toStrictEqual([1, 11])
  })

  test('Test tidyPocket() to return null when no items to prune', () => {
    expect(tidyPocket()).toBe(null)
  })
})
