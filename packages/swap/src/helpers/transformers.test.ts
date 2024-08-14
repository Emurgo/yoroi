import {Balance, Portfolio, Swap} from '@yoroi/types'
import {tokenInfoMocks} from '@yoroi/portfolio'

import {asTokenFingerprint, transformersMaker} from './transformers'
import {openswapMocks} from '../adapters/openswap-api/openswap.mocks'
import {apiMocks} from '../adapters/openswap-api/api.mocks'
import {PriceAddress, TokenAddress} from '../adapters/openswap-api/types'

const primaryTokenInfo = tokenInfoMocks.primaryETH
const transformers = transformersMaker(primaryTokenInfo)

describe('asOpenswapAmount', () => {
  it('success', () => {
    const yoroiAmount = {
      tokenId: 'policyid.assetname',
      quantity: 100n,
    } as const

    const result = transformers.asOpenswapAmount(yoroiAmount)

    expect(result).toEqual({
      amount: '100',
      assetName: 'assetname',
      policyId: 'policyid',
    })
  })

  it('success (empty token) primary token', () => {
    const yoroiAmount = {
      tokenId: '.',
      quantity: 50n,
    } as const

    const result = transformers.asOpenswapAmount(yoroiAmount)

    expect(result).toEqual({
      amount: '50',
      assetName: '',
      policyId: '',
    })
  })

  it('success nameless token', () => {
    const yoroiAmount = {
      tokenId: 'policyId.',
      quantity: 75n,
    } as const

    const result = transformers.asOpenswapAmount(yoroiAmount)

    expect(result).toEqual({
      amount: '75',
      assetName: '',
      policyId: 'policyId',
    })
  })
})

describe('asYoroiOpenOrder', () => {
  it('success', () => {
    const result = transformers.asYoroiOpenOrder(
      openswapMocks.getOpenOrders[0]!,
    )

    expect(result).toEqual<Swap.OpenOrder>(apiMocks.getOpenOrders[0]!)
  })

  it('success (pt without .) coverage should not happen', () => {
    const transformer = transformersMaker({
      ...primaryTokenInfo,
      id: '.' as any,
    })
    const result = transformer.asYoroiOpenOrder(openswapMocks.getOpenOrders[0]!)

    expect(result).toEqual<Swap.OpenOrder>({
      ...apiMocks.getOpenOrders[0]!,
      deposit: {
        quantity: 1700000n,
        tokenId: '.' as any,
      },
      from: {
        quantity: 1000000n,
        tokenId: '.' as any,
      },
    })
  })
})

describe('asYoroiCompletedOrder', () => {
  it('success', () => {
    const result = transformers.asYoroiCompletedOrder(
      openswapMocks.getCompletedOrders[0]!,
    )

    expect(result).toEqual<Swap.CompletedOrder>(apiMocks.getCompletedOrders[0]!)

    const missingDex = {...openswapMocks.getCompletedOrders[0]!}
    missingDex.dex = undefined as any
    const defaultedProviderToMuesliswap = {
      ...apiMocks.getCompletedOrders[0]!,
      provider: 'muesliswap' as Swap.PoolProvider,
    }

    const result2 = transformers.asYoroiCompletedOrder(missingDex)
    expect(result2).toEqual<Swap.CompletedOrder>(defaultedProviderToMuesliswap)
  })
})

describe('asYoroiTokenId', () => {
  it('success (empty policyId) should not happen', () => {
    const result = transformers.asYoroiTokenId({policyId: '', name: 'someName'})
    expect(result).toBe(primaryTokenInfo.id)
  })

  it('success', () => {
    const result = transformers.asYoroiTokenId({
      policyId: 'somePolicyId',
      name: 'someName',
    })
    expect(result).toBe('somePolicyId.someName')
  })

  it('success nameless token', () => {
    const result = transformers.asYoroiTokenId({
      policyId: 'somePolicyId',
      name: '',
    })
    expect(result).toBe('somePolicyId.')
  })
})

describe('asYoroiAmount', () => {
  it('empty when null', () => {
    const result = transformers.asYoroiAmount(null as any)
    expect(result).toEqual<Balance.Amount>({
      quantity: '0',
      tokenId: primaryTokenInfo.id,
    })
  })

  it('success', () => {
    const result = transformers.asYoroiAmount({
      amount: '100',
      address: {
        policyId: 'c04f4200502a998e9eebafac0291a1f38008de3fe146d136946d8f4b',
        name: '30',
      },
    })
    expect(result).toEqual<Balance.Amount>({
      quantity: '100',
      tokenId: 'c04f4200502a998e9eebafac0291a1f38008de3fe146d136946d8f4b.30',
    })
  })

  it('success nameless token', () => {
    const result = transformers.asYoroiAmount({
      token: 'c04f4200502a998e9eebafac0291a1f38008de3fe146d136946d8f4b',
    })
    expect(result).toEqual<Balance.Amount>({
      quantity: '0',
      tokenId: 'c04f4200502a998e9eebafac0291a1f38008de3fe146d136946d8f4b.',
    })
  })

  it('success (lovelace) primary token', () => {
    const result = transformers.asYoroiAmount({
      amount: '1000000',
      address: {
        policyId: '',
        name: '',
      },
    })
    expect(result).toEqual<Balance.Amount>({
      quantity: '1000000',
      tokenId: primaryTokenInfo.id,
    })
  })

  it('success (period) primary token', () => {
    const result = transformers.asYoroiAmount({
      amount: '1000000',
      address: {
        policyId: '',
        name: '.',
      },
    })
    expect(result).toEqual<Balance.Amount>({
      quantity: '1000000',
      tokenId: primaryTokenInfo.id,
    })
  })
})

describe('asOpensawpTokenId (TokenAddress)', () => {
  it('success', () => {
    const result = transformers.asOpenswapTokenId(
      '1f7a58a1aa1e6b047a42109ade331ce26c9c2cce027d043ff264fb1f.425249434b53',
    )
    expect(result).toEqual<TokenAddress>({
      policyId: '1f7a58a1aa1e6b047a42109ade331ce26c9c2cce027d043ff264fb1f',
      assetName: '425249434b53',
    })
  })
  it('success primary token (empty values)', () => {
    const result = transformers.asOpenswapTokenId('.' as any)
    expect(result).toEqual<TokenAddress>({
      policyId: '',
      assetName: '',
    })
  })
})

describe('asOpensawpPriceTokenAddress (PriceAddress)', () => {
  it('success', () => {
    const result = transformers.asOpenswapPriceTokenAddress(
      '1f7a58a1aa1e6b047a42109ade331ce26c9c2cce027d043ff264fb1f.425249434b53',
    )
    expect(result).toEqual<PriceAddress>({
      policyId: '1f7a58a1aa1e6b047a42109ade331ce26c9c2cce027d043ff264fb1f',
      name: '425249434b53',
    })
  })
  it('success primary token (empty values)', () => {
    const result = transformers.asOpenswapPriceTokenAddress('.' as any)
    expect(result).toEqual<PriceAddress>({
      policyId: '',
      name: '',
    })
  })
})

describe('asTokenFingerprint', () => {
  it('success', () => {
    const full = asTokenFingerprint({
      policyId: '1f7a58a1aa1e6b047a42109ade331ce26c9c2cce027d043ff264fb1f',
      assetNameHex: '425249434b53',
    })
    expect(full).toBe('asset1kmp6nmdx5ptmjnt30vq2m2606nz35ae4xfx588')
    const unamed = asTokenFingerprint({
      policyId: '1f7a58a1aa1e6b047a42109ade331ce26c9c2cce027d043ff264fb1f',
      assetNameHex: undefined,
    })
    expect(unamed).toBe('asset1ge674djk0wu352lv8mck4tfpuxuul8uu8s775x')
  })
})

describe('asYoroiPools', () => {
  it('success empty array', () => {
    const result = transformers.asYoroiPools([])
    expect(result).toEqual<Array<Swap.Pool>>([])
  })

  it('success when undefined', () => {
    const result = transformers.asYoroiPools(undefined as any)
    expect(result).toEqual<Array<Swap.Pool>>([])
  })

  it('success (filter out unsupported pools)', () => {
    const result = transformers.asYoroiPools(openswapMocks.getLiquidityPools)

    expect(result).toEqual<Array<Swap.Pool>>(apiMocks.getPools)

    // should filter out unsupported pools
    expect(result.length).toBe(openswapMocks.getLiquidityPools.length - 1)
  })
})

describe('asYoroiPool', () => {
  it('success (supported pool)', () => {
    const result = transformers.asYoroiPool(openswapMocks.getLiquidityPools[0]!)

    expect(result).toEqual<Swap.Pool>(apiMocks.getPools[0]!)
  })

  it('success (unsupported pool)', () => {
    const result = transformers.asYoroiPool(openswapMocks.getLiquidityPools[3]!)

    expect(result).toBeNull()
  })
})

describe('asYoroiPortfolioTokenInfos', () => {
  it('success', () => {
    const result = transformers.asYoroiPortfolioTokenInfos(
      openswapMocks.getTokens,
    )

    expect(result).toEqual<Array<Portfolio.Token.Info>>(apiMocks.getTokens)
  })

  it('success (empty)', () => {
    const result = transformers.asYoroiPortfolioTokenInfos([])

    expect(result).toEqual<Array<Portfolio.Token.Info>>([])
  })
})

describe('asYoroiPortfolioTokenInfosFromPairs', () => {
  it('success', () => {
    const result = transformers.asYoroiPortfolioTokenInfosFromPairs(
      openswapMocks.getTokenPairs,
    )

    expect(result).toEqual<Array<Portfolio.Token.Info>>(apiMocks.getTokenPairs)
  })

  it('success (empty)', () => {
    const result = transformers.asYoroiPortfolioTokenInfosFromPairs([])

    expect(result).toEqual<Array<Portfolio.Token.Info>>([])
  })
})

describe('asYoroiPortfolioTokenInfo', () => {
  it('success', () => {
    const result = transformers.asYoroiPortfolioTokenInfo(
      openswapMocks.getTokens[0]!,
    )

    expect(result).toEqual<Portfolio.Token.Info>({
      application: Portfolio.Token.Application.General,
      decimals: 0,
      description: 'Eggscape Club Utility Token',
      fingerprint: 'asset126v2sm79r8uxvk4ju64mr6srxrvm2x75fpg6w3',
      id: '1c1e38cfcc815d2015dbda6bee668b2e707ee3f9d038d96668fcf63c.4567677363617065436c75624561737465725a656e6e79',
      name: 'EggscapeClubEasterZenny',
      nature: Portfolio.Token.Nature.Secondary,
      originalImage: 'ipfs://QmNYibJoiTWRiMmWn4yXwvoakEPgq9WmaukmRXHF1VGbAU',
      reference: '',
      status: Portfolio.Token.Status.Valid,
      symbol: '',
      tag: '',
      ticker: 'EZY',
      type: Portfolio.Token.Type.FT,
      website: 'https://eggscape.io/',
    })
  })

  it('success (primary token)', () => {
    const result = transformers.asYoroiPortfolioTokenInfo({
      address: {
        policyId: '',
        name: '',
      },
      categories: [],
      decimalPlaces: 6,
      description: 'Cardano',
      status: 'verified',
      symbol: '₳',
      website: 'https://www.cardano.org/',
      supply: {
        circulating: '1000000000000',
        total: '45000000000000',
      },
    })

    expect(result).toEqual<Portfolio.Token.Info>(primaryTokenInfo)
  })
})

describe('asYoroiTokenIdAndQuantity', () => {
  it('missing token, returns as primary token', () => {
    const result = transformers.asYoroiTokenIdAndQuantity({token: ''})
    expect(result).toEqual({
      tokenId: primaryTokenInfo.id,
      quantity: 0n,
    })
  })
})
