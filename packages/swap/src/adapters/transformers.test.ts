import {Balance, Swap} from '@yoroi/types'
import {
  asOpenswapAmount,
  asYoroiBalanceToken,
  asYoroiCompletedOrder,
  asYoroiOpenOrder,
  asYoroiPool,
  asYoroiTokenId,
} from './transformers'
import {CompletedOrder, OpenOrder, Pool, Token} from '@yoroi/openswap'

describe('asOpenswapAmount', () => {
  it('should return the correct result when a valid yoroiAmount is provided', () => {
    const yoroiAmount: Balance.Amount = {
      tokenId: 'policyid.assetname',
      quantity: '100',
    }

    const result = asOpenswapAmount(yoroiAmount)

    expect(result).toEqual({
      amount: '100',
      assetName: 'assetname',
      policyId: 'policyid',
    })
  })

  it('should handle primarty assetName and policyId correctly (empty)', () => {
    const yoroiAmount: Balance.Amount = {
      tokenId: '',
      quantity: '50',
    }

    const result = asOpenswapAmount(yoroiAmount)

    expect(result).toEqual({
      amount: '50',
      assetName: '',
      policyId: '',
    })
  })

  it('should handle yoroiAmount input correctly for nameless assets', () => {
    // Here, the tokenId does not contain a dot, so it's an invalid format
    const yoroiAmount: Balance.Amount = {
      tokenId: 'policyId',
      quantity: '75',
    }

    const result = asOpenswapAmount(yoroiAmount)

    expect(result).toEqual({
      amount: '75',
      assetName: '',
      policyId: 'policyId',
    })
  })
})

describe('asYoroiOpenOrder', () => {
  it('should handle empty/filled tokenId correctly', () => {
    const openswapOrder: OpenOrder = {
      from: {token: '', amount: '75'},
      to: {token: '656565.tokenE', amount: '150'},
      deposit: '100',
      utxo: 'utxo',
      provider: 'minswap',
      owner:
        'addr1q9ndnrwz52yeex4j04kggp0ul5632qmxqx22ugtukkytjysw86pdygc6zarl2kks6fvg8um447uvv679sfdtzkwf2kuq673wke',
    }

    const result = asYoroiOpenOrder(openswapOrder, 'primaryTokenId.1')

    expect(result).toEqual<Swap.OpenOrder>({
      from: {
        quantity: '75',
        tokenId: '',
      },
      to: {
        quantity: '150',
        tokenId: '656565.tokenE',
      },
      deposit: {quantity: '100', tokenId: 'primaryTokenId.1'},
      provider: 'minswap',
      utxo: 'utxo',
      owner:
        'addr1q9ndnrwz52yeex4j04kggp0ul5632qmxqx22ugtukkytjysw86pdygc6zarl2kks6fvg8um447uvv679sfdtzkwf2kuq673wke',
    })
  })
})

describe('asYoroiCompletedOrder', () => {
  it('should populate amounts and quantities', () => {
    const openswapOrder: CompletedOrder = {
      from: {token: '', amount: '75'},
      to: {token: '656565.tokenE', amount: '150'},
      utxo: 'utxo',
    }

    const result = asYoroiCompletedOrder(openswapOrder)

    expect(result).toEqual<Swap.CompletedOrder>({
      from: {
        quantity: '75',
        tokenId: '',
      },
      to: {
        quantity: '150',
        tokenId: '656565.tokenE',
      },
      utxo: 'utxo',
    })
  })
})

describe('asYoroiTokenId', () => {
  it('should return an empty string for an empty policyId', () => {
    const result = asYoroiTokenId({policyId: '', name: 'someName'})
    expect(result).toBe('')
  })

  it('should concatenate policyId and name when both are provided', () => {
    const result = asYoroiTokenId({policyId: 'somePolicyId', name: 'someName'})
    expect(result).toBe('somePolicyId.someName')
  })

  it('should return an empty string when name is an empty string', () => {
    const result = asYoroiTokenId({policyId: 'somePolicyId', name: ''})
    expect(result).toBe('somePolicyId.')
  })
})

describe('asYoroiPool', () => {
  it('should correctly convert the openswap pool to yoroi pool format', () => {
    const openswapPool: Pool = {
      batcherFee: {amount: '100', token: '.'},
      fee: '0.3',
      deposit: 300,
      lpToken: {amount: '400', token: 'policyId.assetNameHex'},
      tokenA: {amount: '500', token: 'policyId'},
      tokenB: {amount: '600', token: 'policyId.assetNameHex'},
      timestamp: '1627759180',
      provider: 'minswap',
      price: 1.045,
      poolId: 'poolId',
      utxo: 'utxo',
    }

    const result = asYoroiPool(openswapPool)

    expect(result).toEqual<Swap.PoolPair>({
      batcherFee: {quantity: '100', tokenId: ''},
      fee: '0.3',
      deposit: {quantity: '300', tokenId: ''},
      lpToken: {quantity: '400', tokenId: 'policyId.assetNameHex'},
      tokenA: {quantity: '500', tokenId: 'policyId.'},
      tokenB: {quantity: '600', tokenId: 'policyId.assetNameHex'},
      lastUpdate: '1627759180',
      provider: 'minswap',
      price: 1.045,
      poolId: 'poolId',
    })
  })
})

describe('asYoroiBalanceToken', () => {
  it('should correctly convert the openswap token to yoroi token format', () => {
    const openswapToken: Token = {
      info: {
        supply: {
          circulating: '1234567890',
          total: '9876543210',
        },
        address: {
          policyId: 'e68f1cea19752d1292b4be71b7f5d2b3219a15859c028f7454f66cdf',
          name: '74544555524f',
        },
        decimalPlaces: 6,
        description: 'Some token description',
        image: 'https://example.com/token-image.png',
        website: 'https://example.com/token-image.png',
        symbol: 'tTEURO',
        status: 'unverified',
        categories: [],
      },
      price: {
        volume: {
          base: 1234.56,
          quote: 7890.12,
        },
        volumeChange: {
          base: 12.34,
          quote: 56.78,
        },
        price: 123.45,
        askPrice: 123.67,
        bidPrice: 122.98,
        priceChange: {
          '24h': 0.1234,
          '7d': -0.5678,
        },
        quoteDecimalPlaces: 2,
        baseDecimalPlaces: 4,
        price10d: [
          120.0, 121.0, 119.0, 122.0, 125.0, 124.0, 123.0, 126.0, 127.0, 125.0,
        ],
      },
    }

    const result = asYoroiBalanceToken(openswapToken)

    expect(result).toEqual<Balance.Token>({
      info: {
        id: 'e68f1cea19752d1292b4be71b7f5d2b3219a15859c028f7454f66cdf.74544555524f',
        group: 'e68f1cea19752d1292b4be71b7f5d2b3219a15859c028f7454f66cdf',
        fingerprint: 'asset1azw6h7l3zmwrpmuhuny0u3k70hk3qxyjkcq4du',
        name: 'tTEURO',
        decimals: 6,
        description: 'Some token description',
        image: 'https://example.com/token-image.png',
        kind: 'ft',
        symbol: 'tTEURO',
        icon: undefined,
        ticker: undefined,
        metadatas: {},
      },
      status: 'unverified',
      supply: {
        circulating: '1234567890',
        total: '9876543210',
      },
      price: {
        volume: {
          base: 1234.56,
          quote: 7890.12,
        },
        volumeChange: {
          base: 12.34,
          quote: 56.78,
        },
        price: 123.45,
        askPrice: 123.67,
        bidPrice: 122.98,
        priceChange: {
          '24h': 0.1234,
          '7d': -0.5678,
        },
        quoteDecimalPlaces: 2,
        baseDecimalPlaces: 4,
        price10d: [
          120.0, 121.0, 119.0, 122.0, 125.0, 124.0, 123.0, 126.0, 127.0, 125.0,
        ],
      },
    })
  })
})
