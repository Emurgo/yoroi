import assert from './assert'
import {Logger, LogLevel} from './logging'

Logger.setLogLevel(LogLevel.Nothing)

function tryAssert() {
  assert.assert(false, 'tryAssert')
}

test('assert shows correct message', () => {
  expect.assertions(1)
  try {
    tryAssert()
  } catch (e) {
    expect((e as Error).message).toMatch(/tryAssert/)
  }
})
