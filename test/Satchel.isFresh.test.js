import { Satchel } from '../src/Satchel'
import { expect, jest, test } from '@jest/globals'

beforeEach(() => {
  // to fully reset the state between tests, clear the storage
  localStorage.clear()
})

test('Retrieving values from an  expired key.', () => {
  const EXP = Date.now() - 3000

  const satchel = new Satchel('test')
  satchel.set({ data: 'expired', expiry: EXP })

  expect(satchel.get()).toEqual(false)
  expect(satchel.isFresh()).toEqual(false)
  expect(satchel.get(true)).toHaveProperty('data')
  expect(satchel.get(true)).toHaveProperty('expiry', EXP)
  expect(satchel.get(true)).toHaveProperty('_creation')
})

test('Satchel.isFresh() by creating two entries, one fresh, and one expired."', () => {
  const FUTURE = Date.now() + 15000
  const PAST = Date.now() - 15000
  const notExpired = new Satchel('not-expired', {
    data: 'NOT EXPIRED',
    expiry: FUTURE
  })
  const expired = new Satchel('expired', { data: 'EXPIRED', expiry: PAST })

  expect(notExpired.isFresh()).toBe(true)
  expect(expired.isFresh()).toBe(false)
})

test('Satchel.isFresh() against a missing record"', () => {
  const notThere = new Satchel('notThere')
  notThere.bin()
  expect(notThere.isFresh()).toBe(null)
})
