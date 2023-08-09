import {Balance, Swap} from '@yoroi/types'
import {
  ceilDivision,
  getQuantityWithSlippage,
  getReceiveAmountbyChangingSell,
  getSellAmountByChangingReceive,
  makeLimitOrder,
  makePossibleMarketOrder,
} from './order'

describe('ceilDivision', () => {
  it('should return the correct ceiling division', () => {
    expect(ceilDivision(BigInt(15), BigInt(4))).toBe(BigInt(4))
    expect(ceilDivision(BigInt(16), BigInt(4))).toBe(BigInt(4))
    expect(ceilDivision(BigInt(17), BigInt(4))).toBe(BigInt(5))
  })

  it('should handle division by zero', () => {
    expect(ceilDivision(BigInt(17), BigInt(0))).toBe(BigInt(0))
  })
})

describe('getQuantityWithSlippage', () => {
  it('should calculate the correct quantity after applying slippage', () => {
    expect(getQuantityWithSlippage(BigInt(1000), BigInt(10))).toBe(BigInt(900))
    expect(getQuantityWithSlippage(BigInt(500), BigInt(50))).toBe(BigInt(250))
  })

  it('should return the original quantity when slippage is zero', () => {
    expect(getQuantityWithSlippage(BigInt(1000), BigInt(0))).toBe(BigInt(1000))
  })

  it('should return zero when the quantity is zero', () => {
    expect(getQuantityWithSlippage(BigInt(0), BigInt(10))).toBe(BigInt(0))
  })

  it('should handle negative slippage as 0%', () => {
    expect(getQuantityWithSlippage(BigInt(1000), BigInt(-10))).toBe(
      BigInt(1000),
    )
  })
})

describe('getReceiveAmountbyChangingSell', () => {
  it('should calculate the correct receive amount when selling tokenA', () => {
    const pool = {
      tokenA: {quantity: '4500000', tokenId: 'tokenA'},
      tokenB: {quantity: '9000000', tokenId: 'tokenB'},
      fee: '0.3', // 0.3%
      provider: 'minswap',
      price: 2,
      batcherFee: {quantity: '1', tokenId: ''},
      deposit: {quantity: '1', tokenId: ''},
      poolId: '0',
      lastUpdate: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    } as Swap.Pool
    const sell = {
      quantity: '100' as Balance.Quantity,
      tokenId: 'tokenA',
    }
    const result = getReceiveAmountbyChangingSell(pool, sell)
    expect(result.sell).toEqual(sell)
    expect(result.buy.quantity).toBe('197')
    expect(result.buy.tokenId).toBe('tokenB')
  })
})

describe('getSellAmountByChangingReceive', () => {
  it('should calculate the correct sell amount when buying tokenA', () => {
    const pool = {
      tokenA: {quantity: '4500000', tokenId: 'tokenA'},
      tokenB: {quantity: '9000000', tokenId: 'tokenB'},
      fee: '0.5', // 0.5%
      provider: 'minswap',
      price: 2,
      batcherFee: {quantity: '1', tokenId: ''},
      deposit: {quantity: '1', tokenId: ''},
      poolId: '0',
      lastUpdate: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    } as Swap.Pool
    const buy = {
      quantity: '100' as Balance.Quantity,
      tokenId: 'tokenA',
    }
    const result = getSellAmountByChangingReceive(pool, buy)
    expect(result.buy).toEqual(buy)
    expect(result.sell.quantity).toBe('204')
    expect(result.sell.tokenId).toBe('tokenB')
  })
})

describe('makeLimitOrder', () => {
  it('should create a limit order with the correct parameters', () => {
    const sell = {
      quantity: '100' as Balance.Quantity,
      tokenId: 'tokenA',
    }
    const buy = {
      quantity: '200' as Balance.Quantity,
      tokenId: 'tokenB',
    }
    const pool: Swap.Pool = {
      tokenA: {quantity: '4500000', tokenId: 'tokenA'},
      tokenB: {quantity: '9000000', tokenId: 'tokenB'},
      fee: '0.3',
      provider: 'minswap',
      price: 2,
      batcherFee: {quantity: '1', tokenId: ''},
      deposit: {quantity: '1', tokenId: ''},
      poolId: '0',
      lastUpdate: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    }
    const slippage = 10
    const address = '0xAddressHere'

    const expectedBuyQuantity = '180'

    const result = makeLimitOrder(sell, buy, pool, slippage, address)
    expect(result.protocol).toEqual(pool.provider)
    expect(result.address).toEqual(address)
    expect(result.slippage).toEqual(slippage)
    expect(result.poolId).toEqual(pool.poolId)
    expect(result.amounts.sell).toEqual(sell)
    expect(result.amounts.buy.tokenId).toEqual(buy.tokenId)
    expect(result.amounts.buy.quantity).toEqual(
      expectedBuyQuantity as Balance.Quantity,
    )
  })
})

describe('makePossibleMarketOrder', () => {
  it('should create a possible market order with the best pool', () => {
    const sell = {
      quantity: '100' as const,
      tokenId: 'tokenA',
    }
    const buy = {
      quantity: '177' as const, // the expected buy quantity becsause makePossibleMarketOrder will ignore the buy quantity
      tokenId: 'tokenB',
    }
    const pool1: Swap.Pool = {
      tokenA: {quantity: '4500000', tokenId: 'tokenA'},
      tokenB: {quantity: '9000000', tokenId: 'tokenB'},
      fee: '0.3',
      provider: 'minswap',
      price: 2,
      batcherFee: {quantity: '1', tokenId: ''},
      deposit: {quantity: '1', tokenId: ''},
      poolId: '0',
      lastUpdate: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    }
    const pool2: Swap.Pool = {
      tokenA: {quantity: '5500000', tokenId: 'tokenA'},
      tokenB: {quantity: '9000000', tokenId: 'tokenB'},
      fee: '0.3',
      provider: 'sundaeswap',
      price: 2,
      batcherFee: {quantity: '10', tokenId: ''},
      deposit: {quantity: '1', tokenId: ''},
      poolId: '0',
      lastUpdate: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    }
    const pools = [pool1, pool2]
    const slippage = 10
    const address = '0xAddressHere'

    const result = makePossibleMarketOrder(sell, buy, pools, slippage, address)

    expect(result?.protocol).toEqual('minswap')
    expect(result?.poolId).toEqual('0')
    expect(result?.slippage).toEqual(slippage)
    expect(result?.address).toEqual(address)
    expect(result?.amounts.buy.quantity).toEqual(buy.quantity)
  })

  it('should return undefined if no pools are provided', () => {
    const sell = {
      quantity: '100' as Balance.Quantity,
      tokenId: 'tokenA',
    }
    const buy = {
      quantity: '200' as Balance.Quantity,
      tokenId: 'tokenB',
    }
    const pools: Swap.Pool[] = []
    const slippage = 10
    const address = '0xAddressHere'

    const result = makePossibleMarketOrder(sell, buy, pools, slippage, address)
    expect(result).toBeUndefined()
  })
})
