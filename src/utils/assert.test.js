import {assertTrue} from './assert'

function tryAssert() {
  assertTrue(false)
}

test('assert shows correct location', () => {
  expect.assertions(1)
  try {
    tryAssert()
  } catch (e) {
    expect(e.message).toMatch(/tryAssert/)
  }
})
