import BigNumber from 'bignumber.js'
import {storageSerializer} from './storage-serializer'

describe('storageSerializer', () => {
  it('should stringify numbers correctly', () => {
    const input = 123
    const expected = '123'
    const result = storageSerializer(input)
    expect(result).toEqual(expected)
  })

  it('should stringify strings correctly', () => {
    const input = 'hello world'
    const expected = '"hello world"'
    const result = storageSerializer(input)
    expect(result).toEqual(expected)
  })

  it('should stringify objects correctly', () => {
    const input = {name: 'John', age: 30}
    const expected = '{"name":"John","age":30}'
    const result = storageSerializer(input)
    expect(result).toEqual(expected)
  })

  it('should stringify arrays correctly', () => {
    const input = {a: [1, 2n, 3]}
    const expected = '{"a":[1,"2",3]}'
    const result = storageSerializer(input)
    expect(result).toEqual(expected)
  })

  it('should stringify big numbers correctly', () => {
    const input = new BigNumber('12345678901234567890')
    const expected = '"12345678901234567890"'
    const result = storageSerializer(input)
    expect(result).toEqual(expected)
  })

  it('should handle undefined correctly', () => {
    const input = undefined
    const result = storageSerializer(input)
    expect(result).toBeUndefined()
  })

  it('should handle null correctly', () => {
    const input = null
    const expected = 'null'
    const result = storageSerializer(input)
    expect(result).toEqual(expected)
  })
})
