import BigNumber from 'bignumber.js'
import {storageStringify} from './storage-stringify'

describe('storageStringify', () => {
  it('should stringify numbers correctly', () => {
    const input = 123
    const expected = '123'
    const result = storageStringify(input)
    expect(result).toEqual(expected)
  })

  it('should stringify strings correctly', () => {
    const input = 'hello world'
    const expected = '"hello world"'
    const result = storageStringify(input)
    expect(result).toEqual(expected)
  })

  it('should stringify objects correctly', () => {
    const input = {name: 'John', age: 30}
    const expected = '{"name":"John","age":30}'
    const result = storageStringify(input)
    expect(result).toEqual(expected)
  })

  it('should stringify arrays correctly', () => {
    const input = [1, 2n, 3]
    const expected = '[1,"2",3]'
    const result = storageStringify(input)
    expect(result).toEqual(expected)
  })

  it('should stringify big numbers correctly', () => {
    const input = new BigNumber('12345678901234567890')
    const expected = '"12345678901234567890"'
    const result = storageStringify(input)
    expect(result).toEqual(expected)
  })

  it('should handle undefined correctly', () => {
    const input = undefined
    const result = storageStringify(input)
    expect(result).toBeUndefined()
  })

  it('should handle null correctly', () => {
    const input = null
    const expected = 'null'
    const result = storageStringify(input)
    expect(result).toEqual(expected)
  })
})
