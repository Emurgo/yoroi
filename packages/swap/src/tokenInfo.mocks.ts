import {createPrimaryTokenInfo} from '@yoroi/portfolio'
import {Portfolio} from '@yoroi/types'
import {freeze} from 'immer'

const tokenInfoA: Portfolio.Token.Info = {
  id: 'tokenA.',
  decimals: 6,

  name: '',
  description: '',
  symbol: '',
  ticker: '',
  website: '',
  tag: '',
  reference: '',
  fingerprint: '',
  originalImage: '',

  nature: Portfolio.Token.Nature.Secondary,
  type: Portfolio.Token.Type.FT,
  application: Portfolio.Token.Application.General,
  status: Portfolio.Token.Status.Valid,
}

const tokenInfoB: Portfolio.Token.Info = {
  id: 'tokenB.',
  decimals: 6,

  name: '',
  description: '',
  symbol: '',
  ticker: '',
  website: '',
  tag: '',
  reference: '',
  fingerprint: '',
  originalImage: '',

  nature: Portfolio.Token.Nature.Secondary,
  type: Portfolio.Token.Type.FT,
  application: Portfolio.Token.Application.General,
  status: Portfolio.Token.Status.Valid,
}

const tokenInfoLP: Portfolio.Token.Info = {
  id: 'lp.',
  decimals: 6,

  name: '',
  description: '',
  symbol: '',
  ticker: '',
  website: '',
  tag: '',
  reference: '',
  fingerprint: '',
  originalImage: '',

  nature: Portfolio.Token.Nature.Secondary,
  type: Portfolio.Token.Type.FT,
  application: Portfolio.Token.Application.General,
  status: Portfolio.Token.Status.Valid,
}

const tokenInfoC: Portfolio.Token.Info = {
  id: 'tokenC.',
  decimals: 2,

  name: '',
  description: '',
  symbol: '',
  ticker: '',
  website: '',
  tag: '',
  reference: '',
  fingerprint: '',
  originalImage: '',

  nature: Portfolio.Token.Nature.Secondary,
  type: Portfolio.Token.Type.FT,
  application: Portfolio.Token.Application.General,
  status: Portfolio.Token.Status.Valid,
}

const tokenInfoPT = createPrimaryTokenInfo({
  decimals: 6,

  description: '',
  name: '',
  originalImage: '',
  reference: '',
  symbol: '',
  tag: '',
  ticker: '',
  website: '',
})

export const tokenInfoMocks = freeze(
  {
    a: tokenInfoA,
    b: tokenInfoB,
    c: tokenInfoC,
    pt: tokenInfoPT,
    lp: tokenInfoLP,
  },
  true,
)
