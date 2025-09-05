import {Portfolio} from '@yoroi/types'

import {createUnknownTokenInfo} from './create-unknown-token-info'

describe('createPrimaryTokenInfo', () => {
  it('should create secondary token info with additional properties', () => {
    const cardanoUnknownToken: Pick<Portfolio.Token.Info, 'name' | 'id'> = {
      id: '14696a4676909f4e3cb1f2e60e2e08e5abed70caf5c02699be971139.6964',
      name: 'id (unknown)',
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
      ...cardanoUnknownToken,
    }

    const result = createUnknownTokenInfo(cardanoUnknownToken)

    expect(result).toEqual(expectedTokenInfo)
    expect(Object.isFrozen(result)).toBe(true)

    const badId =
      '14696a4676909f4e3cb1f2e60e2e08e5abed70caf5c02699be971139' as Portfolio.Token.Id
    const badResult = createUnknownTokenInfo({
      id: badId,
    })

    expect(badResult).toEqual({
      ...expectedTokenInfo,
      id: badId,
      name: ' (unknown)',
    })
    expect(Object.isFrozen(badResult)).toBe(true)
  })
})
