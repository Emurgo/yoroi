import {tokenBalanceMocks} from '../adapters/token-balance.mocks'
import {AmountsCalcultor} from './amounts-calculator'

describe('AmountsCalculator', () => {
  const records = Object.fromEntries(tokenBalanceMocks.storage.entries1)
  it('should negate the amounts', () => {
    const amounts = AmountsCalcultor(records).negate().build()

    Object.entries(amounts).forEach(([_, amount]) => {
      expect(amount.quantity).toBeLessThanOrEqual(0n)
    })
  })

  it('should drop specified tokens', () => {
    const amounts = AmountsCalcultor().plus(records).build()

    expect(Object.keys(amounts)).toHaveLength(4)

    const newAmounts = AmountsCalcultor(amounts)
      .drop([
        // primary does not exist in the storage
        tokenBalanceMocks.primaryETH.info.id,
        tokenBalanceMocks.nftCryptoKitty.info.id,
      ])
      .build()

    expect(Object.keys(newAmounts)).toHaveLength(3)
  })

  it('should add new amounts', () => {
    const amounts = AmountsCalcultor(records).plus(records).build()

    expect(Object.keys(amounts)).toHaveLength(4)

    Object.entries(amounts).forEach(([_, amount]) => {
      expect(amount.quantity).toBe(
        (records[amount.info.id]?.quantity ?? 0n) * 2n,
      )
    })
  })

  it('should calculate the difference between two amounts', () => {
    const amounts = AmountsCalcultor(records).minus(records).build()

    expect(Object.keys(amounts)).toHaveLength(4)

    Object.entries(amounts).forEach(([_, amount]) => {
      expect(amount.quantity).toBe(
        (records[amount.info.id]?.quantity ?? 0n) * 0n,
      )
    })
  })
})
