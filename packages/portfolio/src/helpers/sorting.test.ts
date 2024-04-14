import {Portfolio} from '@yoroi/types'
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
      {...tokenInfoMocks.ftNoTicker, status: Portfolio.Token.Status.Unknown},
      {...tokenInfoMocks.ftNoTicker, status: Portfolio.Token.Status.Invalid},
      {...tokenInfoMocks.ftNoTicker, status: Portfolio.Token.Status.Scam},
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
      {...tokenInfoMocks.ftNoTicker, status: Portfolio.Token.Status.Unknown},
      {...tokenInfoMocks.ftNoTicker, status: Portfolio.Token.Status.Invalid},
      {...tokenInfoMocks.ftNoTicker, status: Portfolio.Token.Status.Scam},
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
      {
        ...tokenBalanceMocks.ftNoTicker,
        info: {
          ...tokenBalanceMocks.ftNoTicker.info,
          status: Portfolio.Token.Status.Unknown,
        },
      },
      {
        ...tokenBalanceMocks.ftNoTicker,
        info: {
          ...tokenBalanceMocks.ftNoTicker.info,
          status: Portfolio.Token.Status.Invalid,
        },
      },
      {
        ...tokenBalanceMocks.ftNoTicker,
        info: {
          ...tokenBalanceMocks.ftNoTicker.info,
          status: Portfolio.Token.Status.Scam,
        },
      },
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
        {
          ...tokenBalanceMocks.ftNoTicker,
          info: {
            ...tokenBalanceMocks.ftNoTicker.info,
            status: Portfolio.Token.Status.Unknown,
          },
        },
        {
          ...tokenBalanceMocks.ftNoTicker,
          info: {
            ...tokenBalanceMocks.ftNoTicker.info,
            status: Portfolio.Token.Status.Invalid,
          },
        },
        {
          ...tokenBalanceMocks.ftNoTicker,
          info: {
            ...tokenBalanceMocks.ftNoTicker.info,
            status: Portfolio.Token.Status.Scam,
          },
        },
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
