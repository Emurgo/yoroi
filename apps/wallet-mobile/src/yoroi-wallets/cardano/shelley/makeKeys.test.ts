import {makeKeys} from './makeKeys'

describe('makeKeys', () => {
  it('makes root key and accountPubKeyHex', async () => {
    const mnemonic = [
      'dry balcony arctic what garbage sort',
      'cart shine egg lamp manual bottom',
      'slide assault bus',
    ].join(' ')

    const keys = await makeKeys({mnemonic})

    expect(keys).toEqual({
      accountPubKeyHex:
        '7cc9d816f272eb78a2db936a839d3bf53fa960dd470ddbaadabb6a7bf2019b837d20b2cd13cbb22b6f6938abea40d425f5539b6bb1fe0813ccb4c21676a7fd6b',
      rootKey:
        '9053adfb225e91c0bf2db38e1978907cfeff6e66b9a9c3d8945aa686a9d29851bf83c8e2e556464605afeb9651fab3ef3f0aa205685c8f1e6f818629f843bde9a7e129fd35d072ce79b40a49cefcbc8526a3cb8d4bfa7a47afddaddc31dbb728',
    })
  })
})
