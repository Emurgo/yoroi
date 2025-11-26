import BigNumber from 'bignumber.js'

import {numberReplacer} from './number-replacer'

describe('numberReplacer', () => {
  it('should convert bigint to string', () => {
    expect(numberReplacer('key', 123n)).toBe('123')
  })

  it('should convert BigNumber to string', () => {
    const bn = new BigNumber('123.456')
    expect(numberReplacer('key', bn)).toBe('123.456')
  })

  it('should return value as-is for other types', () => {
    expect(numberReplacer('key', 'string')).toBe('string')
    expect(numberReplacer('key', 123)).toBe(123)
    expect(numberReplacer('key', null)).toBe(null)
    expect(numberReplacer('key', undefined)).toBe(undefined)
  })
})
