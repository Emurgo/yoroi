import {randomHexString, randomSalt, randomNonce} from './random'

describe('randomHexString', () => {
  it('generates hex strings of correct length', () => {
    const length = 32
    const result = randomHexString(length)
    expect(result.length).toBe(length)
    expect(result).toMatch(/^[0-9a-f]+$/)
  })

  it('generates different strings on each call', () => {
    const length = 32
    const result1 = randomHexString(length)
    const result2 = randomHexString(length)
    expect(result1).not.toBe(result2)
  })

  it('throws error for odd length', () => {
    expect(() => randomHexString(31)).toThrow(
      'Length must be even since each byte is 2 hex chars',
    )
  })
})

describe('salt', () => {
  it('generates a 64-character hex string', () => {
    const salt = randomSalt()
    expect(salt.length).toBe(64)
    expect(salt).toMatch(/^[0-9a-f]+$/)
  })

  it('generates different salts on each call', () => {
    const salt1 = randomSalt()
    const salt2 = randomSalt()
    expect(salt1).not.toBe(salt2)
  })
})

describe('', () => {
  it('generates a 24-character hex string', () => {
    const nonce = randomNonce()
    expect(nonce.length).toBe(24)
    expect(nonce).toMatch(/^[0-9a-f]+$/)
  })

  it('generates different nonces on each call', () => {
    const nonce1 = randomNonce()
    const nonce2 = randomNonce()
    expect(nonce1).not.toBe(nonce2)
  })
})
