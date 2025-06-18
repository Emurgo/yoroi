import {wrappedCsl} from '../wrappedCsl'
import {generateAdaMnemonic, generateWalletRootKey} from './mnemonic'

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
    const {csl, release} = wrappedCsl()
    const rootKey = await generateWalletRootKey(mnemonic, csl)
    expect(Buffer.from(await rootKey.asBytes()).toString('hex')).toEqual(expectedKey)
    release()
  })
})
