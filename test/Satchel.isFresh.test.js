import { Satchel } from '../src/Satchel'
import {expect, jest, test} from '@jest/globals';

beforeEach(() => {
  // to fully reset the state between tests, clear the storage
    localStorage.clear( );
});


test('Retrieving values from an  expired key.', () => {
  const KEY = 'test'
  const VALUE = 'expired'
  const EXP = Date.now()

  const satchel = new Satchel(KEY)
  satchel.set({data: VALUE, expiry: EXP})

  expect(satchel.get()).toEqual(false)
  expect(satchel.isFresh()).toEqual(false)
  expect(satchel.get(true)).toHaveProperty('data')
  expect(satchel.get(true)).toHaveProperty('expiry', EXP)
  expect(satchel.get(true)).toHaveProperty('creation')
})


test('Satchel.isFresh() by creating two entries, one fresh, and one expired."', () => {
  const FUTURE = Date.now() + 15000
  const PAST = Date.now() - 15000
  const notExpired = new Satchel('not-expired', { data: "NOT EXPIRED", expiry: FUTURE })
  const expired = new Satchel('expired', { data: "EXPIRED", expiry: PAST })

  expect(notExpired.isFresh()).toBe(true)
  expect(expired.isFresh()).toBe(false)
})
