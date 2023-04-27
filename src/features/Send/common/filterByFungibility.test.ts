import {TokenInfo} from '../../../yoroi-wallets'
import {FungibilityFilter} from '../useCases/ListAmountsToSend/AddToken/SelectTokenFromListScreen'
import {filterByFungibility} from './filterByFungibility'

describe('filterByFungibility', () => {
  const fakeToken1: TokenInfo<'ft'> = {
    id: 'fake-token-1',
    kind: 'ft',
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
    id: 'fake-token-2',
    kind: 'ft',
    description: '',
    name: '',
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

  const fakeToken3: TokenInfo = {
    id: 'fake-token-3',
    kind: 'nft',
    name: '',
    fingerprint: 'fake-fingerprint-3',
    description: '',
    metadata: {
      image: '',
      thumbnail: '',
      policyId: '',
      assetNameHex: '',
    },
  } as const

  const fakeToken4: TokenInfo = {
    id: 'fake-token-4',
    kind: 'nft',
    name: '',
    description: '',
    fingerprint: 'fake-fingerprint-4',
    metadata: {
      image: '',
      thumbnail: '',
      policyId: '',
      assetNameHex: '',
    },
  } as const

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
    expect(allTokenInfos.filter(filterByFungibility({fungibilityFilter}))).toEqual(result)
  })
})
