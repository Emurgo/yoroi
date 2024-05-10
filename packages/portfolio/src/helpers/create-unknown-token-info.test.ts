import {Portfolio} from '@yoroi/types'

import {createUnknownTokenInfo} from './create-unknown-token-info'

describe('createPrimaryTokenInfo', () => {
  it('should create secondary token info with additional properties', () => {
    const cardanoUnknownToken: Pick<Portfolio.Token.Info, 'name' | 'id'> = {
      id: '14696a4676909f4e3cb1f2e60e2e08e5abed70caf5c02699be971139.35',
      name: '35 (unknown)',
    }

    const expectedTokenInfo: Readonly<Portfolio.Token.Info> = {
      nature: Portfolio.Token.Nature.Secondary,
      type: Portfolio.Token.Type.FT,
      application: Portfolio.Token.Application.General,
      status: Portfolio.Token.Status.Unknown,
      fingerprint: '',
      symbol: '',
      decimals: 0,
      reference: '',
      tag: '',
      ticker: '',
      website: '',
      originalImage: '',
      description: '',
      icon: '',
      mediaType: '',
      ...cardanoUnknownToken,
    }

    const result = createUnknownTokenInfo(cardanoUnknownToken)

    expect(result).toEqual(expectedTokenInfo)
    expect(Object.isFrozen(result)).toBe(true)
  })
})
