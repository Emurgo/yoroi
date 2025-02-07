import {Portfolio} from '@yoroi/types'

import {TokensResponse} from './types'

const tokensResponse: TokensResponse = [
  {
    token_id:
      '885742cd7e0dad321622b5d3ad186797bd50c44cbde8b48be1583fbd534b554c4c',
    token_decimals: 0,
    token_policy: '885742cd7e0dad321622b5d3ad186797bd50c44cbde8b48be1583fbd',
    token_ascii: 'SKULL',
    ticker: 'SKULL',
    is_verified: false,
    supply: 1_000,
    creation_date: '0001-01-01T00:00:00Z',
    price: 0,
  },
  {
    token_id:
      '8d7cc34c1a44ef419cf1560cbb84e7720ca6c03ab99f8745ab61d19d50414e4441',
    token_decimals: 0,
    token_policy: '8d7cc34c1a44ef419cf1560cbb84e7720ca6c03ab99f8745ab61d19d',
    token_ascii: 'PANDA Token',
    ticker: 'PANDA',
    is_verified: true,
    supply: 0,
    creation_date: '0001-01-01T00:00:00Z',
    price: 0,
  },
  {
    token_id:
      '000000000000000000000000000000000000000000000000000000006c6f76656c616365',
    token_decimals: 6,
    token_policy: '00000000000000000000000000000000000000000000000000000000',
    token_ascii: 'ADA',
    ticker: 'ADA',
    is_verified: true,
    supply: 45_000_000_000,
    creation_date: '0001-01-01T00:00:00Z',
    price: 0,
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
  {
    application: Portfolio.Token.Application.General,
    decimals: 0,
    description: '',
    fingerprint: '',
    id: '885742cd7e0dad321622b5d3ad186797bd50c44cbde8b48be1583fbd.534b554c4c',
    name: 'SKULL',
    nature: Portfolio.Token.Nature.Secondary,
    originalImage: '',
    reference: '',
    status: Portfolio.Token.Status.Invalid,
    symbol: '',
    tag: '',
    ticker: 'SKULL',
    type: Portfolio.Token.Type.FT,
    website: '',
  },
  {
    application: Portfolio.Token.Application.General,
    decimals: 0,
    description: '',
    fingerprint: '',
    id: '8d7cc34c1a44ef419cf1560cbb84e7720ca6c03ab99f8745ab61d19d.50414e4441',
    name: 'PANDA Token',
    nature: Portfolio.Token.Nature.Secondary,
    originalImage: '',
    reference: '',
    status: Portfolio.Token.Status.Valid,
    symbol: '',
    tag: '',
    ticker: 'PANDA',
    type: Portfolio.Token.Type.FT,
    website: '',
  },
  {
    application: Portfolio.Token.Application.Coin,
    decimals: 6,
    description: '',
    fingerprint: '',
    id: '.',
    name: 'Cardano',
    nature: Portfolio.Token.Nature.Primary,
    originalImage: '',
    reference: '',
    status: Portfolio.Token.Status.Valid,
    symbol: 'ADA',
    tag: '',
    ticker: 'ADA',
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
