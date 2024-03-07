import {storageSerializer} from '@yoroi/common'
import {tokenBalanceMocks} from '../adapters/token-balance.mocks'
import {tokenInfoMocks} from '../adapters/token-info.mocks'
import {
  alpha,
  sortTokenBalances,
  sortTokenInfos,
  toEnd,
  toStart,
} from './sorting'

describe('sorting', () => {
  it('sorts alphabetically', () => {
    const sortedItems = [...items].sort(
      alpha((name) => name.toLocaleLowerCase()),
    )
    // prettier-ignore
    expect(sortedItems).toEqual([
      '', 
      'a', 
      'a', 
      'b', 
      'c'
    ])
  })

  it('moves items to the start', () => {
    const sortedItems = [...items].sort(toStart((name) => name === 'c'))
    // prettier-ignore
    expect(sortedItems).toEqual([
      'c', 
      'a', 
      '', 
      'b', 
      'a'
    ])
  })

  it('moves items to the end', () => {
    const sortedItems = [...items].sort(toEnd((name) => name === 'c'))
    // prettier-ignore
    expect(sortedItems).toEqual([
      'a', 
      '', 
      'b', 
      'a', 
      'c'
    ])
  })

  it('sort token infos', () => {
    const primaryTokenInfo = tokenInfoMocks.primaryETH
    const secondaryTokenInfos = [
      tokenInfoMocks.ftNoTicker,
      tokenInfoMocks.ftNameless,
      tokenInfoMocks.nftCryptoKitty,
      tokenInfoMocks.rnftWhatever,
      primaryTokenInfo,
    ]

    const sortedTokenInfos = sortTokenInfos({
      primaryTokenInfo,
      secondaryTokenInfos,
    })

    expect(sortedTokenInfos).toEqual([
      primaryTokenInfo,
      tokenInfoMocks.nftCryptoKitty,
      tokenInfoMocks.rnftWhatever,
      tokenInfoMocks.ftNameless,
      tokenInfoMocks.ftNoTicker,
    ])
  })

  it('sort token balances', () => {
    const primaryTokenInfo = tokenInfoMocks.primaryETH
    const tokenBalances = [
      tokenBalanceMocks.ftNoTicker,
      tokenBalanceMocks.nftCryptoKitty,
      tokenBalanceMocks.ftNameless,
      tokenBalanceMocks.rnftWhatever,
      tokenBalanceMocks.primaryETH,
    ]

    const sortedTokenBalances = sortTokenBalances({
      primaryTokenInfo,
      tokenBalances,
    })

    const serialized = sortedTokenBalances.map(storageSerializer)
    expect(serialized).toEqual(
      [
        tokenBalanceMocks.primaryETH,
        tokenBalanceMocks.nftCryptoKitty,
        tokenBalanceMocks.rnftWhatever,
        tokenBalanceMocks.ftNameless,
        tokenBalanceMocks.ftNoTicker,
      ].map(storageSerializer),
    )
  })
})

// prettier-ignore
const items = [
  'a', 
  '', 
  'c', 
  'b', 
  'a'
]
