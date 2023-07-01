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
        '7f53efa3c08093db3824235769079e96ef96b6680fc254f6c021ec420e4d1555b5bafb0b1fc6c8040cc8f69f7c1948dfb4dcadec4acd09730c0efb39c6159362',
      rootKey:
        '9053adfb225e91c0bf2db38e1978907cfeff6e66b9a9c3d8945aa686a9d29851bf83c8e2e556464605afeb9651fab3ef3f0aa205685c8f1e6f818629f843bde9a7e129fd35d072ce79b40a49cefcbc8526a3cb8d4bfa7a47afddaddc31dbb728',
    })
  })
})
