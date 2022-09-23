import {WALLET_IMPLEMENTATION_REGISTRY} from '../yoroi-wallets/types/other'
import {decryptData, encryptData, formatPath, generateAdaMnemonic, generateWalletRootKey} from './commonUtils'
import {CardanoError} from './errors'

const mnemonic = [
  'dry balcony arctic what garbage sort',
  'cart shine egg lamp manual bottom',
  'slide assault bus',
].join(' ')

describe('BIP39', () => {
  const expectedKey =
    '9053adfb225e91c0bf2db38e1978907cfeff6e66b9a9c3d8945aa686a9d' +
    '29851bf83c8e2e556464605afeb9651fab3ef3f0aa205685c8f1e6f818629f843bde9' +
    'a7e129fd35d072ce79b40a49cefcbc8526a3cb8d4bfa7a47afddaddc31dbb728'

  it('correctly generates mnemonics', () => {
    const recoverPhrase = generateAdaMnemonic()
    expect(recoverPhrase.split(' ').length).toEqual(15)
  })

  it('correctly derives wallet root key', async () => {
    const rootKey = await generateWalletRootKey(mnemonic)
    expect(Buffer.from(await rootKey.asBytes()).toString('hex')).toEqual(expectedKey)
  })
})

describe('encryption/decryption', () => {
  it('Can encrypt / decrypt masterKey', async () => {
    expect.assertions(1)
    const masterKeyPtr = await generateWalletRootKey(mnemonic)
    const masterKey = Buffer.from(await masterKeyPtr.asBytes()).toString('hex')
    const encryptedKey = await encryptData(masterKey, 'password')
    const decryptedKey = await decryptData(encryptedKey, 'password')
    expect(masterKey).toEqual(decryptedKey)
  })

  it('Throws on wrong password', async () => {
    expect.assertions(1)
    const encryptedData = await encryptData('308f9977d04e7f3a45abd148905c628e2bb2621360a585f352', 'password')
    await expect(decryptData(encryptedData, 'wrong-password')).rejects.toThrow(CardanoError)
  })

  it('Can decrypt data encrypted with rust v2 library', async () => {
    expect.assertions(1)

    // the following ciphertext has been generated by encrypting the utf8 string
    // "masterkey" with this rust function:
    /* eslint-disable-next-line  */
    // https://github.com/Emurgo/cardano-serialization-lib/blob/0e89deadf9183a129b9a25c0568eed177d6c6d7c/rust/src/emip3.rs#L34
    // and the following salt, nonce and password
    let ciphertextHex = ''
    const salt = '50515253c0c1c2c3c4c5c6c750515253c0c1c2c3c4c5c6c750515253c0c1c2c3'
    const nonce = '50515253c0c1c2c3c4c5c6c7'
    const payload = '308f9977d04e7f3a45abd148905c628e2bb2621360a585f352'
    const password = 'password'
    ciphertextHex = ciphertextHex.concat(salt, nonce, payload)

    const decryptedHex = await decryptData(ciphertextHex, password)
    expect(Buffer.from(decryptedHex, 'hex').toString('utf8')).toBe('masterkey')
  })
})

test('Can format address', () => {
  expect(formatPath(42, 'Internal', 47, WALLET_IMPLEMENTATION_REGISTRY.HASKELL_BYRON)).toBe("m/44'/1815'/42'/1/47")
  expect(formatPath(42, 'Internal', 47, WALLET_IMPLEMENTATION_REGISTRY.HASKELL_SHELLEY)).toBe("m/1852'/1815'/42'/1/47")
  expect(formatPath(42, 'Internal', 47, WALLET_IMPLEMENTATION_REGISTRY.HASKELL_SHELLEY_24)).toBe(
    "m/1852'/1815'/42'/1/47",
  )
})
