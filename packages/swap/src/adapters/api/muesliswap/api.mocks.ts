import {Portfolio} from '@yoroi/types'

import {TokensResponse} from './types'

const tokensResponse: TokensResponse = [
  {
    ticker: 'ADA',
    name: null,
    policyId: '',
    hexName: '',
    decimals: 6,
    verified: true,
  },
  {
    ticker: 'PTC',
    name: 'Pocket Change',
    policyId: '007394e3117755fbb0558b93c54ce3bc6c85770920044ade143dc742',
    hexName: '505443',
    decimals: 0,
    verified: false,
  },
  {
    ticker: 'BTN',
    name: 'BTN',
    policyId: '016be5325fd988fea98ad422fcfd53e5352cacfced5c106a932a35a4',
    hexName: '42544e',
    decimals: 6,
    verified: true,
  },
]

export const primaryTokenInfo: Portfolio.Token.Info = {
  id: '.',
  type: Portfolio.Token.Type.FT,
  nature: Portfolio.Token.Nature.Primary,
  decimals: 6,
  ticker: 'ADA',
  name: 'Cardano',
  symbol: 'ADA',
  status: Portfolio.Token.Status.Valid,
  application: Portfolio.Token.Application.Coin,
  tag: '',
  reference: '',
  fingerprint: '',
  description: '',
  website: '',
  originalImage: '',
}

const tokensResult: Array<Portfolio.Token.Info> = [
  primaryTokenInfo,
  {
    application: Portfolio.Token.Application.General,
    decimals: 0,
    description: '',
    fingerprint: '',
    id: '007394e3117755fbb0558b93c54ce3bc6c85770920044ade143dc742.505443',
    name: 'Pocket Change',
    nature: Portfolio.Token.Nature.Secondary,
    originalImage: '',
    reference: '',
    status: Portfolio.Token.Status.Invalid,
    symbol: '',
    tag: '',
    ticker: 'PTC',
    type: Portfolio.Token.Type.FT,
    website: '',
  },
  {
    application: Portfolio.Token.Application.General,
    decimals: 6,
    description: '',
    fingerprint: '',
    id: '016be5325fd988fea98ad422fcfd53e5352cacfced5c106a932a35a4.42544e',
    name: 'BTN',
    nature: Portfolio.Token.Nature.Secondary,
    originalImage: '',
    reference: '',
    status: Portfolio.Token.Status.Valid,
    symbol: '',
    tag: '',
    ticker: 'BTN',
    type: Portfolio.Token.Type.FT,
    website: '',
  },
]

export const api = {
  responses: {
    tokens: tokensResponse,
  },
  results: {
    tokens: tokensResult,
  },
}
