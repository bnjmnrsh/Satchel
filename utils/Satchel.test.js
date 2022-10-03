import { Satchel } from '../src/Satchel'

test('Should create an object', () => {
  const satchel = new Satchel()
  expect(satchel).toEqual({})
  expect(satchel).toEqual([satchel])
})
