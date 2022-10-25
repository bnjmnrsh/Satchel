import { Satchel } from '../src/Satchel'
import { expect, jest, test } from '@jest/globals'

beforeEach(() => {
  localStorage.clear()
})

test('Satchel: Set a key which is expired.', () => {
  const KEY = 'test'
  const VALUE = 'expired'
  const EXP = Date.now()

  const satchel = new Satchel(KEY)
  satchel.set({ data: VALUE, expiry: EXP })

  expect(satchel.get()).toEqual(false)
  expect(satchel.isFresh()).toEqual(false)
  expect(satchel.get(true)).toHaveProperty('data')
  expect(satchel.get(true)).toHaveProperty('expiry', EXP)
  expect(satchel.get(true)).toHaveProperty('_creation')
})
