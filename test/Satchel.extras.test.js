import { Satchel } from '../src/Satchel'
import { getAllPocketKeys } from '../src/extras'
import { expect, jest, test, describe } from '@jest/globals'

describe('Satchel: testing pocket cleanup methods exported from extras.js', () => {
  beforeEach(() => {
    sessionStorage.clear()
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
    emptyPocket('taco-truck', false)
    expect(sessionStorage.length).toEqual(10)
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
    tidyPocket('taco-truck', false)
    expect(sessionStorage.length).toEqual(11)
  })

  test('Test tidyPocket() to return null when no items to prune', () => {
    const tidyPocket = tidyPocket()
    expect(tidyPocket).toBe(null)
  })
})
