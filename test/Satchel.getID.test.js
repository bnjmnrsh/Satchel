import { Satchel } from '../src/Satchel'
import { expect, jest, test } from '@jest/globals'

beforeEach(() => {
  localStorage.clear()
})

test('Create new instance of Satchel, and then retrieve the key\'s full namespace."', () => {
  const KEY = 'taco'
  const DEFAULT_NAMESPACE = 'stcl.pocket'
  const satchel = new Satchel(KEY)
  expect(satchel.getKey()).toBe(`${DEFAULT_NAMESPACE}.${KEY}`)
})

test('Create new instance of Satchel with a custom Pocket, and then retrieve the key\'s full namespace."', () => {
  const SATCHEL = 'stcl'
  const POCKET = 'taco'
  const KEY = 'chicken'
  const chickenTaco = new Satchel(
    KEY,
    { data: null, expiry: null },
    false,
    POCKET
  )
  expect(chickenTaco.getKey()).toBe(`${SATCHEL}.${POCKET}.${KEY}`)
})
