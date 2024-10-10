import {asConcatenedString, truncateString} from './strings'

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

describe('truncateString', () => {
  it('should return the original string if its length is less than or equal to maxLength', () => {
    const value = 'hello'
    const maxLength = 10
    const result = truncateString({value, maxLength})
    expect(result).toBe(value)
  })

  it('should truncate the string and add separator if its length is greater than maxLength', () => {
    const value = 'This is a long string'
    const maxLength = 10
    const separator = '-'
    const result = truncateString({value, maxLength, separator})
    expect(result).toBe('This-ring')
  })

  it('should truncate the string and add separator at the correct position', () => {
    const value = 'This is a long string'
    const maxLength = 15
    const separator = '...'
    const result = truncateString({value, maxLength, separator})
    expect(result).toBe('This i...string')
  })
})
