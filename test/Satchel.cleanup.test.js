import { Satchel } from '../src/Satchel'
import { expect, jest, test } from '@jest/globals'

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

test('Satchel: Test bin() to remove an entry from Storage', () => {
  // localStorage
  const tacoLocal = new Satchel('taco', { data: null, expiry: null }, true)
  expect(window.localStorage.length).toEqual(1)
  tacoLocal.bin()
  expect(window.localStorage.length).toEqual(0)
  expect(tacoLocal.get(true)).toBe(false)

  // sessionStorage
  const tacoSession = new Satchel('taco', { data: null, expiry: null }, false)
  expect(window.sessionStorage.length).toEqual(1)
  tacoSession.bin()
  expect(window.sessionStorage.length).toEqual(0)
  expect(tacoSession.get(true)).toBe(false)
})

test('Satchel: Test getAllPocketKeys()', () => {
  // create pocket entries
  ;[...Array(10)].forEach(
    (element, i) => new Satchel(`test-${i}`, {}, false, 'taco-truck')
  )
  expect(sessionStorage.length).toEqual(10)
  const pocketKeys = Satchel.getAllPocketKeys('taco-truck')
  expect(pocketKeys.length).toEqual(10)
})

test('Satchel: Test emptyPocket() to remove all entries from a "pocket"', () => {
  // create non pocket entries
  ;[...Array(10)].forEach((element, i) =>
    sessionStorage.setItem(`test-${i}`, 'test')
  )
  // create pocket entries
  ;[...Array(10)].forEach(
    (element, i) => new Satchel(`test-${i}`, {}, false, 'taco-truck')
  )

  expect(sessionStorage.length).toEqual(20)
  Satchel.emptyPocket('taco-truck', false)
  expect(sessionStorage.length).toEqual(10)
})

test('Satchel: Test tidyPocket() to remove a stale entries from a "pocket"', () => {
  sessionStorage.clear()

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
  Satchel.tidyPocket('taco-truck', false)
  expect(sessionStorage.length).toEqual(11)
})
