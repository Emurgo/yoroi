import {
  AssetName,
  Balance,
  PolicyId,
  TokenFingerprint,
  TokenId,
} from '@yoroi/types'

import {filterByFungibility} from './filterByFungibility'

describe('filterByFungibility', () => {
  const fakeToken1: Balance.TokenInfo = {
    kind: 'ft',
    id: 'fake-token-1' as TokenId,
    fingerprint: 'fake-fingerprint-1' as TokenFingerprint,
    name: '' as AssetName,
    description: '',
    image: '',
    group: '' as PolicyId,
    metadatas: {},
    icon: '',
    ticker: '',
    decimals: 0,
    symbol: undefined,
  } as const

  const fakeToken2: Balance.TokenInfo = {
    kind: 'ft',
    id: 'fake-token-2' as TokenId,
    fingerprint: 'fake-fingerprint-2' as TokenFingerprint,
    name: '' as AssetName,
    description: '',
    image: '',
    group: '' as PolicyId,
    metadatas: {},
    icon: '',
    ticker: '',
    decimals: 0,
    symbol: undefined,
  } as const

  const nft1: Balance.TokenInfo = {
    kind: 'nft',
    id: 'fake-token-3' as TokenId,
    fingerprint: 'fake-fingerprint-3' as TokenFingerprint,
    name: '' as AssetName,
    description: '',
    image: '',
    group: '' as PolicyId,
    metadatas: {},
    icon: '',
    ticker: '',
    decimals: 0,
    symbol: undefined,
  } as const

  const nft2: Balance.TokenInfo = {
    kind: 'nft',
    id: 'fake-token-4' as TokenId,
    fingerprint: 'fake-fingerprint-4' as TokenFingerprint,
    name: '' as AssetName,
    description: '',
    image: '',
    group: '' as PolicyId,
    metadatas: {},
    icon: '',
    ticker: '',
    decimals: 0,
    symbol: undefined,
  } as const

  const allTokenInfos: Balance.TokenInfo[] = [
    fakeToken1,
    fakeToken2,
    nft1,
    nft2,
  ]
  const nftTokenInfos: Balance.TokenInfo[] = [nft1, nft2]
  const ftTokenInfos: Balance.TokenInfo[] = [fakeToken1, fakeToken2]

  it.each<{
    fungibilityFilter: 'all' | 'ft' | 'nft'
    result: Balance.TokenInfo[]
  }>([
    {
      fungibilityFilter: 'all',
      result: allTokenInfos,
    },
    {
      fungibilityFilter: 'nft',
      result: nftTokenInfos,
    },
    {
      fungibilityFilter: 'ft',
      result: ftTokenInfos,
    },
    {
      fungibilityFilter: 'random-value' as never,
      result: allTokenInfos,
    },
  ])(
    'should return correct tokenInfos if fungibility is "$fungibility"',
    ({fungibilityFilter, result}) => {
      expect(
        allTokenInfos.filter(filterByFungibility({fungibilityFilter})),
      ).toEqual(result)
    },
  )
})
