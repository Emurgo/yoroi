import {asConcatenedString} from './strings'

describe('asConcatenedString', () => {
  it('should return undefined for null input', () => {
    expect(asConcatenedString(null)).toBeUndefined()
  })

  it('should return anything else', () => {
    expect(asConcatenedString({} as any)).toBeUndefined()
    expect(asConcatenedString(['1', 1] as any)).toBeUndefined()
    expect(asConcatenedString(1 as any)).toBeUndefined()
  })

  it('should return undefined for undefined input', () => {
    expect(asConcatenedString(undefined)).toBeUndefined()
  })

  it('should return the original string for string input', () => {
    expect(asConcatenedString('hello')).toBe('hello')
  })

  it('should join array of strings into a single string', () => {
    expect(asConcatenedString(['h', 'e', 'l', 'l', 'o'])).toBe('hello')
  })
})
