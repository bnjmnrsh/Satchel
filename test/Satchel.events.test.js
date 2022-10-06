/**
 * TODO: Add tests to check for custom events
 *
 * What I would like to to trigger the custom event using Satchel.set() for example,
 * and evaluate event object produced, as captured by a listener.
 *
 * Because #emit is a private method I cant jest.spyOn it, and I cant mock it.
 * https://ilikekillnerds.com/2020/02/testing-event-listeners-in-jest-without-using-a-library/
 * https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.unit_testing_using_jest_patterns
 *
 * Things I've tried: loading jsdom, I believe this may not be working because Jest ships with its own JSDOM
 * so i need to tap into that, and I also need to better understand if this is an async event or not.
 *
 */

import { Satchel } from '../src/Satchel'
import { expect, jest, test, describe } from '@jest/globals'
import { JSDOM } from 'jsdom'

import util from 'util'
// var util = require('util')
const encoder = new util.TextEncoder('utf-8')

describe('Satchel: testing custom events', () => {
  //   let events = {}
  //   let dom

  //   beforeEach(async () => {
  //     sessionStorage.clear()
  //     dom = await JSDOM.fromFile('./test/testable.html', {
  //       resources: 'usable',
  //       runScripts: 'dangerously'
  //     })
  //     await new Promise((resolve) => dom.window.addEventListener('load', resolve))

  //     jest.restoreAllMocks()
  //   })

  //   test('Satchel: Test set() custom event', async () => {
  //     function handelEvent(e) {
  //       return e
  //     }
  //     dom.window.addEventListener('Satchel', handelEvent)
  //     dom.window.taco = await new Satchel('taco', {
  //       data: 'tacos!',
  //       expiry: null
  //     })
  //     await expect(handelEvent).resolves.toBe({})
  //   })
  test('Satchel: Test get() custom event', () => {})
  test('Satchel: Test bin() custom event', () => {})
  test('Satchel: Test tidyPocket() custom event', () => {})
  test('Satchel: Test emptyPocket() custom event', () => {})
})
