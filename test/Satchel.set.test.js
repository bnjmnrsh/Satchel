import { Satchel } from '../src/Satchel'
import { expect, jest, test } from '@jest/globals'

beforeEach(() => {
  localStorage.clear()
})

test('Create a stale sessionStore using set() with a key of "taco" and a data value of "good with guaque"', () => {
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
