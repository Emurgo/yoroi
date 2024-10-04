import {traitValueExpander} from './trait-value-expander'

describe('traitValueExpander', () => {
  it('should correctly handle a regular string', () => {
    const input = 'Hello Cardano'
    const expected = {
      originalValue: input,
      transformedValue: input,
      type: 'string',
    }

    expect(traitValueExpander(input)).toEqual(expected)
  })

  it('should correctly handle a valid URL (not IPFS)', () => {
    const input = 'https://example.com/resource'
    const expected = {
      originalValue: input,
      transformedValue: input,
      type: 'link',
    }

    expect(traitValueExpander(input)).toEqual(expected)
  })

  it('should correctly transform an IPFS URL', () => {
    const input = 'ipfs://QmXkzSgR7YK8h'
    const expected = {
      originalValue: input,
      transformedValue: 'https://ipfs.io/ipfs/QmXkzSgR7YK8h',
      type: 'link',
    }

    expect(traitValueExpander(input)).toEqual(expected)
  })

  it('should correctly handle a number (integer)', () => {
    const input = 42
    const expected = {
      originalValue: input,
      transformedValue: input,
      type: 'number',
    }

    expect(traitValueExpander(input)).toEqual(expected)
  })

  it('should correctly handle a number (float)', () => {
    const input = 3.14159
    const expected = {
      originalValue: input,
      transformedValue: input,
      type: 'number',
    }

    expect(traitValueExpander(input)).toEqual(expected)
  })

  it('should correctly handle an empty array', () => {
    const input: unknown[] = []
    const expected = {
      originalValue: input,
      transformedValue: input,
      type: 'array',
    }

    expect(traitValueExpander(input)).toEqual(expected)
  })

  it('should correctly handle an array with elements', () => {
    const input = ['trait1', 'trait2', 'trait3']
    const expected = {
      originalValue: input,
      transformedValue: input,
      type: 'array',
    }

    expect(traitValueExpander(input)).toEqual(expected)
  })

  it('should correctly handle null', () => {
    const input = null
    const expected = {
      originalValue: input,
      transformedValue: input,
      type: 'unknown',
    }

    expect(traitValueExpander(input)).toEqual(expected)
  })

  it('should correctly handle undefined', () => {
    const input = undefined
    const expected = {
      originalValue: input,
      transformedValue: input,
      type: 'unknown',
    }

    expect(traitValueExpander(input)).toEqual(expected)
  })

  it('should correctly handle an object', () => {
    const input = {key: 'value'}
    const expected = {
      originalValue: input,
      transformedValue: input,
      type: 'record',
    }

    expect(traitValueExpander(input)).toEqual(expected)
  })

  it('should correctly handle a boolean', () => {
    const input = true

    const adjustedExpected = {
      originalValue: input,
      transformedValue: input,
      type: 'unknown',
    }

    expect(traitValueExpander(input)).toEqual(adjustedExpected)
  })

  // Test for symbol
  it('should correctly handle a symbol', () => {
    const input = Symbol('sym')
    const expected = {
      originalValue: input,
      transformedValue: input,
      type: 'unknown',
    }

    expect(traitValueExpander(input)).toEqual(expected)
  })

  it('should correctly handle a function', () => {
    const input = () => 'I am a function'
    const expected = {
      originalValue: input,
      transformedValue: input,
      type: 'unknown',
    }

    expect(traitValueExpander(input)).toEqual(expected)
  })

  it('should correctly handle an invalid URL string', () => {
    const input = 'ht!tp://invalid-url'
    const expected = {
      originalValue: input,
      transformedValue: input,
      type: 'string',
    }

    expect(traitValueExpander(input)).toEqual(expected)
  })
})
