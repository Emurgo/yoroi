import {
  convertObjectToSearchParams,
  convertSearchParamsToObject,
} from './helpers'

describe('convertSearchParamsToObject', () => {
  it('should convert URLSearchParams to object', () => {
    const params = new URLSearchParams()
    params.append('key1', 'value1')
    params.append('key2', 'value2')
    params.append('key3[0]', 'value3')
    params.append('key3[1]', 'value4')

    const result = convertSearchParamsToObject(params)

    expect(result).toEqual({
      key1: 'value1',
      key2: 'value2',
      key3: ['value3', 'value4'],
    })
  })

  it('should handle JSON values', () => {
    const params = new URLSearchParams()
    params.append('key1', JSON.stringify({nestedKey: 'nestedValue'}))
    params.append('key2', JSON.stringify([1, 2, 3]))

    const result = convertSearchParamsToObject(params)

    expect(result).toEqual({
      key1: {nestedKey: 'nestedValue'},
      key2: [1, 2, 3],
    })
  })

  it('should handle non-JSON values', () => {
    const params = new URLSearchParams()
    params.append('key1', 'value1')
    params.append('key2', 'value2')

    const result = convertSearchParamsToObject(params)

    expect(result).toEqual({
      key1: 'value1',
      key2: 'value2',
    })
  })

  it('should handle array indices', () => {
    const params = new URLSearchParams()
    params.append('key[0]', 'value1')
    params.append('key[1]', 'value2')

    const result = convertSearchParamsToObject(params)

    expect(result).toEqual({
      key: ['value1', 'value2'],
    })
  })
})

describe('convertObjectToSearchParams', () => {
  it('should convert object to URLSearchParams', () => {
    const obj = {
      key1: 'value1',
      key2: 'value2',
      key3: ['value3', 'value4'],
    }

    const result = convertObjectToSearchParams(obj)

    expect(result.get('key1')).toBe('value1')
    expect(result.get('key2')).toBe('value2')
    expect(result.get('key3[0]')).toBe('value3')
    expect(result.get('key3[1]')).toBe('value4')
  })

  it('should handle nested objects', () => {
    const obj = {
      key1: {nestedKey: 'nestedValue'},
      key2: [1, 2, 3],
    }

    const result = convertObjectToSearchParams(obj)

    expect(result.get('key1')).toBe(JSON.stringify({nestedKey: 'nestedValue'}))
    expect(result.get('key2[0]')).toBe('1')
    expect(result.get('key2[1]')).toBe('2')
    expect(result.get('key2[2]')).toBe('3')
  })

  it('should handle non-string values', () => {
    const obj = {
      key1: 123,
      key2: true,
      key3: null,
    }

    const result = convertObjectToSearchParams(obj)

    expect(result.get('key1')).toBe('123')
    expect(result.get('key2')).toBe('true')
    expect(result.get('key3')).toBe('null')
  })
})
