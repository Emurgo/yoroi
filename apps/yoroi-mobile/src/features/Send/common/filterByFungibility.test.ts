import {TokenInfo, YoroiNft} from '../../../yoroi-wallets/types'
import {FungibilityFilter} from '../useCases/ListAmountsToSend/AddToken/SelectTokenFromListScreen'
import {filterByFungibility} from './filterByFungibility'

describe('filterByFungibility', () => {
  const fakeToken1: TokenInfo = {
    id: 'fake-token-1',
    name: '',
    decimals: 0,
    description: '',
    ticker: undefined,
    symbol: '',
    logo: '',
    url: '',
    fingerprint: 'fake-fingerprint-1',
    group: '',
  } as const

  const fakeToken2: TokenInfo = {
    id: 'fake-token-2',
    name: '',
    decimals: 0,
    description: '',
    ticker: undefined,
    symbol: '',
    logo: '',
    url: '',
    fingerprint: 'fake-fingerprint-2',
    group: '',
  } as const

  const fakeToken3: TokenInfo = {
    id: 'fake-token-3',
    name: '',
    decimals: 0,
    description: '',
    ticker: undefined,
    symbol: '',
    logo: '',
    url: '',
    fingerprint: 'fake-fingerprint-3',
    group: '',
  } as const

  const fakeToken4: TokenInfo = {
    id: 'fake-token-4',
    name: '',
    decimals: 0,
    description: '',
    ticker: undefined,
    symbol: '',
    logo: '',
    url: '',
    fingerprint: 'fake-fingerprint-4',
    group: '',
  } as const

  const nft1: YoroiNft = {
    id: fakeToken3.id,
    fingerprint: fakeToken3.fingerprint,
    name: '',
    description: '',
    logo: '',
    thumbnail: '',
    metadata: {
      policyId: '',
      assetNameHex: '',
      originalMetadata: {
        name: '',
        description: '',
        image: '',
      },
    },
  }

  const nft2: YoroiNft = {
    id: fakeToken4.id,
    fingerprint: fakeToken4.fingerprint,
    name: '',
    description: '',
    logo: '',
    thumbnail: '',
    metadata: {
      policyId: '',
      assetNameHex: '',
      originalMetadata: {
        name: '',
        description: '',
        image: '',
      },
    },
  }

  const nfts: YoroiNft[] = [nft1, nft2]
  const allTokenInfos: TokenInfo[] = [fakeToken1, fakeToken2, fakeToken3, fakeToken4]
  const nftTokenInfos: TokenInfo[] = [fakeToken3, fakeToken4]
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
    expect(allTokenInfos.filter(filterByFungibility({nfts, fungibilityFilter}))).toEqual(result)
  })
})
