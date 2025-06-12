import {decryptData} from './decrypt-data'

describe('decryptData', () => {
  it('can decrypt data', () => {
    const salt =
      '50515253c0c1c2c3c4c5c6c750515253c0c1c2c3c4c5c6c750515253c0c1c2c3'
    const nonce = '50515253c0c1c2c3c4c5c6c7'
    const payload = '308f9977d04e7f3a45abd148905c628e2bb2621360a585f352'
    const password = 'password'
    const ciphertextHex = ''.concat(salt, nonce, payload)

    const decryptedHex = decryptData(ciphertextHex, password)
    expect(Buffer.from(decryptedHex, 'hex').toString('utf8')).toBe('masterkey')
  })
})
