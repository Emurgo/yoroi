import {TokenInfo} from '../../../yoroi-wallets/types'
import {FungibilityFilter} from '../useCases/ListAmountsToSend/AddToken/SelectTokenFromListScreen'
import {filterByFungibility} from './filterByFungibility'

describe('filterByFungibility', () => {
  const fakeToken1: TokenInfo<'ft'> = {
    kind: 'ft',
    id: 'fake-token-1',
    name: '',
    description: '',
    fingerprint: 'fake-fingerprint-1',
    metadata: {
      decimals: 0,
      ticker: undefined,
      symbol: '',
      logo: '',
      url: '',
      group: '',
    },
  } as const

  const fakeToken2: TokenInfo<'ft'> = {
    kind: 'ft',
    id: 'fake-token-2',
    name: '',
    description: '',
    fingerprint: 'fake-fingerprint-2',
    metadata: {
      decimals: 0,
      ticker: undefined,
      symbol: '',
      logo: '',
      url: '',
      group: '',
    },
  } as const

  const nft1: TokenInfo<'nft'> = {
    kind: 'nft',
    id: 'fake-token-3',
    fingerprint: 'fake-fingerprint-3',
    name: '',
    description: '',
    metadata: {
      image: '',
      thumbnail: '',
      policyId: '',
      assetNameHex: '',
      originalMetadata: {
        name: '',
        description: '',
        image: '',
      },
    },
  } as const

  const nft2: TokenInfo<'nft'> = {
    kind: 'nft',
    id: 'fake-token-4',
    fingerprint: 'fake-fingerprint-4',
    name: '',
    description: '',
    metadata: {
      image: '',
      thumbnail: '',
      policyId: '',
      assetNameHex: '',
      originalMetadata: {
        name: '',
        description: '',
        image: '',
      },
    },
  } as const

  const allTokenInfos: TokenInfo[] = [fakeToken1, fakeToken2, nft1, nft2]
  const nftTokenInfos: TokenInfo[] = [nft1, nft2]
  const ftTokenInfos: TokenInfo[] = [fakeToken1, fakeToken2]

  it.each<{fungibilityFilter: FungibilityFilter; result: TokenInfo[]}>([
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
      fungibilityFilter: 'random-value' as FungibilityFilter,
      result: allTokenInfos,
    },
  ])('should return correct tokenInfos if fungibility is "$fungibility"', ({fungibilityFilter, result}) => {
    expect(allTokenInfos.filter(filterByFungibility({fungibilityFilter}))).toEqual(result)
  })
})
