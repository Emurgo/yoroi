import {decryptWithPassword, encryptWithPassword} from './catalystCipher'

test('valid encryption and decryption', () => {
  const data =
    '4820f7ce221e177c8eae2b2ee5c1f1581a0d88ca5c14329d8f2389e77a465' +
    '655c27662621bfb99cb9445bf8114cc2a630afd2dd53bc88c08c5f2aed8e9c7cb89'
  const dataBuff = Buffer.from(data, 'hex')
  const pin = '1234'
  const pinBuff = Buffer.from(pin.split('').map(Number))
  const ciphertext = encryptWithPassword(pinBuff, dataBuff)
  const decryptedDataHex = decryptWithPassword(pinBuff, ciphertext)
  expect(decryptedDataHex).toEqual(data)
})

describe('invalid decryption', () => {
  const data =
    '4820f7ce221e177c8eae2b2ee5c1f1581a0d88ca5c14329d8f2389e77a465' +
    '655c27662621bfb99cb9445bf8114cc2a630afd2dd53bc88c08c5f2aed8e9c7cb89'
  const dataBuff = Buffer.from(data, 'hex')
  const pin = '1234'
  const pinBuff = Buffer.from(pin.split('').map(Number))

  it('should throw on invalid password', () => {
    const ciphertext = encryptWithPassword(pinBuff, dataBuff)
    const wrongPin = '4321'
    const wrongPinBuff = Buffer.from(wrongPin.split('').map(Number))

    expect(() => {
      decryptWithPassword(wrongPinBuff, ciphertext)
    }).toThrow('invalid tag')
  })

  it('should throw on corrupted cyphertext', () => {
    const ciphertext = encryptWithPassword(pinBuff, dataBuff)
    const corruptedCiphertext = ciphertext.slice(0, ciphertext.length - 1)

    expect(() => {
      decryptWithPassword(pinBuff, corruptedCiphertext)
    }).toThrow('invalid tag')
  })

  it('should throw on insufficient input', () => {
    const ciphertext = encryptWithPassword(pinBuff, dataBuff)
    const corruptedCiphertext = ciphertext.slice(0, 32 + 12 + 16) // includes only metadata

    expect(() => {
      decryptWithPassword(pinBuff, corruptedCiphertext)
    }).toThrow('invalid ciphertext length: smaller than tagLength=16')
  })
})
