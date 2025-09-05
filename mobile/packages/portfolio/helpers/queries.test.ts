import {Portfolio} from '@yoroi/types'

import {queryTokenInfo} from './queries'

describe('queryTokenInfo', () => {
  const primaryTokenInfo: Portfolio.Token.Info = {
    id: '.',
    name: 'Cardano',
    decimals: 6,
    symbol: 'ADA',
    description: '',
    fingerprint: '',
    ticker: 'ADA',
    tag: '',
    reference: '',
    website: '',
    originalImage: '',
    status: Portfolio.Token.Status.Valid,
    application: Portfolio.Token.Application.General,
    nature: Portfolio.Token.Nature.Primary,
    type: Portfolio.Token.Type.FT,
  }

  const mockTokenInfo: Portfolio.Token.Info = {
    id: 'policy.assetName',
    name: 'Test Token',
    decimals: 6,
    symbol: 'TEST',
    description: '',
    fingerprint: '',
    ticker: 'TEST',
    tag: '',
    reference: '',
    website: '',
    originalImage: '',
    status: Portfolio.Token.Status.Valid,
    application: Portfolio.Token.Application.General,
    nature: Portfolio.Token.Nature.Secondary,
    type: Portfolio.Token.Type.FT,
  }

  const unknownTokenInfo: Portfolio.Token.Info = {
    id: 'policy.unknown',
    name: 'unknown',
    decimals: 0,
    symbol: '',
    description: '',
    fingerprint: '',
    ticker: '',
    tag: '',
    reference: '',
    website: '',
    originalImage: '',
    status: Portfolio.Token.Status.Unknown,
    application: Portfolio.Token.Application.General,
    nature: Portfolio.Token.Nature.Secondary,
    type: Portfolio.Token.Type.FT,
  }

  const resp = (success: boolean, data?: Portfolio.Token.Info) => {
    return () =>
      Promise.resolve({
        tag: success ? 'right' : 'left',
        value: success ? {data} : undefined,
        left: !success ? {error: new Error('Not found')} : undefined,
        isLeft: !success,
        isRight: success,
      })
  }

  it.each`
    description                | id                    | getTokenInfoResult           | expected
    ${'returns primary token'} | ${'.'}                | ${resp(true)}                | ${primaryTokenInfo}
    ${'returns token info'}    | ${'policy.assetName'} | ${resp(true, mockTokenInfo)} | ${mockTokenInfo}
    ${'returns unknown token'} | ${'policy.unknown'}   | ${resp(false)}               | ${unknownTokenInfo}
  `('$description', async ({id, getTokenInfoResult, expected}) => {
    const result = await queryTokenInfo({
      id,
      getTokenInfo: getTokenInfoResult,
      primaryTokenInfo,
    })

    expect(result).toEqual(expected)
  })
})
