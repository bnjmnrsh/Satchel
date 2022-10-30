import { Satchel } from '../src/Satchel'
import { getAllPocketKeys } from '../src/bindle'
import { expect, test, describe, beforeEach } from '@jest/globals'

describe('Satchel: Test Satchel.setKey()', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  test('Satchel.setKey() to create an entry in sessionStorage but not return a Satchel instance.', () => {
    expect(Satchel.setKey('taco')).toBe(undefined)
    expect(getAllPocketKeys()).toEqual(['stcl.pocket.taco'])
  })
})
