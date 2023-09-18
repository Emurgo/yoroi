import {Portfolio, Swap} from '@yoroi/types'
import {OpenSwap} from '@yoroi/openswap'

import {asTokenFingerprint, transformersMaker} from './transformers'
import {openswapMocks} from '../adapters/openswap-api/openswap.mocks'
import {apiMocks} from '../adapters/openswap-api/api.mocks'

const primaryTokenId = ''
const transformers = transformersMaker(primaryTokenId)

describe('asOpenswapAmount', () => {
  it('success', () => {
    const yoroiAmount: Portfolio.Amount = {
      tokenId: 'policyid.assetname',
      quantity: '100',
    }

    const result = transformers.asOpenswapAmount(yoroiAmount)

    expect(result).toEqual({
      amount: '100',
      assetName: 'assetname',
      policyId: 'policyid',
    })
  })

  it('success (empty token) primary token', () => {
    const yoroiAmount: Portfolio.Amount = {
      tokenId: '',
      quantity: '50',
    }

    const result = transformers.asOpenswapAmount(yoroiAmount)

    expect(result).toEqual({
      amount: '50',
      assetName: '',
      policyId: '',
    })
  })

  it('success nameless token', () => {
    const yoroiAmount: Portfolio.Amount = {
      tokenId: 'policyId',
      quantity: '75',
    }

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
})

describe('asYoroiCompletedOrder', () => {
  it('success', () => {
    const result = transformers.asYoroiCompletedOrder(
      openswapMocks.getCompletedOrders[0]!,
    )

    expect(result).toEqual<Swap.CompletedOrder>(apiMocks.getCompletedOrders[0]!)
  })
})

describe('asYoroiTokenId', () => {
  it('success (empty policyId) should not happen', () => {
    const result = transformers.asYoroiTokenId({policyId: '', name: 'someName'})
    expect(result).toBe('')
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
    expect(result).toEqual<Portfolio.Amount>({quantity: '0', tokenId: ''})
  })

  it('success', () => {
    const result = transformers.asYoroiAmount({
      amount: '100',
      token: 'c04f4200502a998e9eebafac0291a1f38008de3fe146d136946d8f4b.30',
    })
    expect(result).toEqual<Portfolio.Amount>({
      quantity: '100',
      tokenId: 'c04f4200502a998e9eebafac0291a1f38008de3fe146d136946d8f4b.30',
    })
  })

  it('success (lovelace) primary token', () => {
    const result = transformers.asYoroiAmount({
      amount: '1000000',
      token: 'lovelace',
    })
    expect(result).toEqual<Portfolio.Amount>({quantity: '1000000', tokenId: ''})
  })

  it('success (period) primary token', () => {
    const result = transformers.asYoroiAmount({
      amount: '1000000',
      token: '.',
    })
    expect(result).toEqual<Portfolio.Amount>({quantity: '1000000', tokenId: ''})
  })
})

describe('asOpensawpTokenId (TokenAddress)', () => {
  it('success', () => {
    const result = transformers.asOpenswapTokenId(
      '1f7a58a1aa1e6b047a42109ade331ce26c9c2cce027d043ff264fb1f.425249434b53',
    )
    expect(result).toEqual<OpenSwap.TokenAddress>({
      policyId: '1f7a58a1aa1e6b047a42109ade331ce26c9c2cce027d043ff264fb1f',
      assetName: '425249434b53',
    })
  })
  it('success primary token (empty values)', () => {
    const result = transformers.asOpenswapTokenId('' as any)
    expect(result).toEqual<OpenSwap.TokenAddress>({
      policyId: '',
      assetName: '',
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

  it('success', () => {
    const result = transformers.asYoroiPools(openswapMocks.getPools)

    expect(result).toEqual<Array<Swap.Pool>>(apiMocks.getPools)
  })
})

describe('asYoroiPool', () => {
  it('success', () => {
    const result = transformers.asYoroiPool(openswapMocks.getPools[0]!)

    expect(result).toEqual<Swap.Pool>(apiMocks.getPools[0]!)
  })
})

describe('asYoroiBalanceToken', () => {
  it('success', () => {
    const result = transformers.asYoroiBalanceToken(openswapMocks.getTokens[0]!)

    expect(result).toEqual<Portfolio.Token>(apiMocks.getTokens[0]!)
  })
})

describe('asYoroiBalanceTokens', () => {
  it('success', () => {
    const result = transformers.asYoroiBalanceTokens(openswapMocks.getTokens)

    expect(result).toEqual<Array<Portfolio.Token>>(apiMocks.getTokens)
  })
})
