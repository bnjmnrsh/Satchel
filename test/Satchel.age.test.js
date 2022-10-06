import { Satchel } from '../src/Satchel'
import { expect, jest, test, describe } from '@jest/globals'

beforeEach(() => {
  localStorage.clear()
})

describe('Satchel: age() should return {age:(ms), creation:(ms), expiry:(ms), fresh: boolean }', () => {
  const timeStamp = Date.now()

  test('a "fresh" record', () => {
    const taco = new Satchel('taco', { data: null, expiry: null })
    const tacoAge = taco.age()

    expect(tacoAge.age).toBeGreaterThanOrEqual(0)
    expect(tacoAge.creation).toBeLessThanOrEqual(Date.now())
    expect(tacoAge).toHaveProperty('expiry', null)
    expect(tacoAge).toHaveProperty('fresh', true)
  })

  test('an expired record', () => {
    const oldTaco = new Satchel('oldTaco', { data: null, expiry: timeStamp })
    const oldTacoAge = oldTaco.age()

    expect(oldTacoAge.creation).toBeLessThanOrEqual(Date.now())
    expect(oldTacoAge.expiry).toBe(timeStamp)
    expect(oldTacoAge).toHaveProperty('fresh', false)
  })
})
