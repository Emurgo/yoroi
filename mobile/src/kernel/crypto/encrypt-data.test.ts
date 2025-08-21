import {randomNonce, randomSalt} from './encrypt-data'

describe('randomSalt', () => {
  it.each`
    description
    ${'generates a 64-character hex string'}
    ${'generates different salts on each call'}
  `('$description', () => {
    const salt = randomSalt()
    expect(salt.value.length).toBe(64)
    expect(salt).toMatch(/^[0-9a-f]+$/)
  })

  it('generates different salts on each call', () => {
    const salt1 = randomSalt()
    const salt2 = randomSalt()
    expect(salt1).not.toBe(salt2)
  })
})

describe('randomNonce', () => {
  it.each`
    description
    ${'generates a 24-character hex string'}
    ${'generates different nonces on each call'}
  `('$description', () => {
    const nonce = randomNonce()
    expect(nonce.value.length).toBe(24)
    expect(nonce).toMatch(/^[0-9a-f]+$/)
  })

  it('generates different nonces on each call', () => {
    const nonce1 = randomNonce()
    const nonce2 = randomNonce()
    expect(nonce1).not.toBe(nonce2)
  })
})
