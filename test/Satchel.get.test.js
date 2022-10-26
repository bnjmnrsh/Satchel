import { Satchel } from '../src/Satchel'
import { expect, jest, test, describe } from '@jest/globals'

beforeEach(() => {
  localStorage.clear()
})

describe('Satchel.get()', () => {
  test('Create two entries, one which has expired, and one which hasn\'t. .get() should ony return an object if the "force" flag is set', () => {
    const FUTURE = Date.now() + 15000
    const PAST = Date.now() - 15000

    const notExpired = new Satchel('not-expired', {
      data: 'NOT EXPIRED',
      expiry: FUTURE
    })
    const expired = new Satchel('expired', { data: 'EXPIRED', expiry: PAST })

    expect(notExpired.get().expiry).toBe(FUTURE)
    expect(expired.get().expiry).toBe(undefined)
    expect(expired.get()).toBe(false)
    // force get to return expired store
    expect(expired.get(true).expiry).toBe(PAST)

    expired.bin()
    expect(expired.get()).toBe(null)
  })
})
