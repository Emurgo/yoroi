import {randomHexString} from './random-hex-string'

describe('randomHexString', () => {
  it.each`
    length | description
    ${32}  | ${'generates hex strings of correct length'}
    ${32}  | ${'generates different strings on each call'}
  `('$description', ({length}) => {
    const result = randomHexString(length)
    expect(result.value.length).toBe(length)
    expect(result).toMatch(/^[0-9a-f]+$/)
  })

  it('generates different strings on each call', () => {
    const length = 32
    const result1 = randomHexString(length)
    const result2 = randomHexString(length)
    expect(result1).not.toBe(result2)
  })

  it.each`
    length | description
    ${31}  | ${'throws error for odd length'}
    ${1}   | ${'throws error for length < 2'}
  `('$description', ({length}) => {
    expect(() => randomHexString(length)).toThrow(
      'Length must be even since each byte is 2 hex chars',
    )
  })
})
