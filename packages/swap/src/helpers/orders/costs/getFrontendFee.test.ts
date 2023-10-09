import {Balance} from '@yoroi/types'

import {getFrontendFee} from './getFrontendFee'
import {milkHoldersDiscountTiers} from '../../../translators/constants'
import {Quantities} from '../../../utils/quantities'
import {asQuantity} from '../../../utils/asQuantity'

describe('getFrontendFee', () => {
  const primaryTokenId = 'primary.token'

  const notPrimaryTokenAmount: Balance.Amount = {
    tokenId: 'not.primary.token',
    quantity: '99',
  }

  describe('selling side is primary token', () => {
    it('< 100 and whatever milk in balance', () => {
      // arrange
      const sell: Balance.Amount = {
        tokenId: primaryTokenId,
        quantity: asQuantity(99_999_999),
      }
      // act
      const fee = getFrontendFee({
        sell: sell,
        buy: notPrimaryTokenAmount,
        sellInPrimaryTokenValue: sell,
        lpTokenHeld: {tokenId: 'lp.token', quantity: '999999999999999999'},
        buyInPrimaryTokenValue: sell,
        primaryTokenId,
        discountTiers: milkHoldersDiscountTiers,
      })
      // assert
      expect(fee).toEqual({
        fee: {
          tokenId: primaryTokenId,
          quantity: Quantities.zero,
        },
        discountTier: undefined,
      })
    })

    it('>= 100 and milk in balance = 0', () => {
      // arrange
      const sellPrimaryAmountOver99: Balance.Amount = {
        tokenId: primaryTokenId,
        quantity: asQuantity(100_000_000),
      }
      // act
      const fee = getFrontendFee({
        sell: sellPrimaryAmountOver99,
        buy: notPrimaryTokenAmount,
        sellInPrimaryTokenValue: sellPrimaryAmountOver99,
        lpTokenHeld: {tokenId: 'lp.token', quantity: Quantities.zero},
        buyInPrimaryTokenValue: sellPrimaryAmountOver99,
        primaryTokenId,
        discountTiers: milkHoldersDiscountTiers,
      })
      // assert
      expect(fee).toEqual({
        fee: {
          tokenId: primaryTokenId,
          quantity: asQuantity(1_050_000), // no milk, 100 ADA * 0.05% + 1 = 1.05 ADA
        },
        discountTier: milkHoldersDiscountTiers[2],
      })
    })

    it('>= 100 and milk in balance >= 100', () => {
      // arrange
      const sellPrimaryAmountOver99: Balance.Amount = {
        tokenId: primaryTokenId,
        quantity: asQuantity(100_000_000),
      }
      // act
      const fee = getFrontendFee({
        sell: sellPrimaryAmountOver99,
        buy: notPrimaryTokenAmount,
        lpTokenHeld: {tokenId: 'lp.token', quantity: '499'},
        sellInPrimaryTokenValue: sellPrimaryAmountOver99,
        buyInPrimaryTokenValue: sellPrimaryAmountOver99,
        primaryTokenId,
        discountTiers: milkHoldersDiscountTiers,
      })
      // assert
      expect(fee).toEqual({
        fee: {
          tokenId: primaryTokenId,
          quantity: asQuantity(1_025_000), // hold 100-499 milk, 100 ADA * 0.025% + 1 = 1.025 ADA
        },
        discountTier: milkHoldersDiscountTiers[1],
      })
    })

    it('>= 100 and milk in balance >= 500', () => {
      // arrange
      const sellPrimaryAmountOver99: Balance.Amount = {
        tokenId: primaryTokenId,
        quantity: asQuantity(100_000_000),
      }
      // act
      const fee = getFrontendFee({
        sell: sellPrimaryAmountOver99,
        buy: notPrimaryTokenAmount,
        lpTokenHeld: {tokenId: 'lp.token', quantity: '500'},
        sellInPrimaryTokenValue: sellPrimaryAmountOver99,
        buyInPrimaryTokenValue: sellPrimaryAmountOver99,
        primaryTokenId,
        discountTiers: milkHoldersDiscountTiers,
      })
      // assert
      expect(fee).toEqual({
        fee: {
          tokenId: primaryTokenId,
          quantity: asQuantity(1_020_000), // hold 500+ milk, 100 ADA * 0.020% + 1 = 1.02 ADA
        },
        discountTier: milkHoldersDiscountTiers[0],
      })
    })
  })

  describe('buying side is primary token', () => {
    it('< 100 and whatever milk in balance', () => {
      // arrange
      const buyPrimaryTokenAmount: Balance.Amount = {
        tokenId: primaryTokenId,
        quantity: asQuantity(99_999_999),
      }
      // act
      const fee = getFrontendFee({
        sell: notPrimaryTokenAmount,
        buy: buyPrimaryTokenAmount,
        sellInPrimaryTokenValue: buyPrimaryTokenAmount,
        lpTokenHeld: {tokenId: 'lp.token', quantity: '999999999999999999'},
        buyInPrimaryTokenValue: buyPrimaryTokenAmount,
        primaryTokenId,
        discountTiers: milkHoldersDiscountTiers,
      })
      // assert
      expect(fee).toEqual({
        fee: {
          tokenId: primaryTokenId,
          quantity: Quantities.zero,
        },
        discountTier: undefined,
      })
    })

    it('>= 100 and milk in balance = 0', () => {
      // arrange
      const buyPrimaryAmountOver99: Balance.Amount = {
        tokenId: primaryTokenId,
        quantity: asQuantity(100_000_000),
      }
      // act
      const fee = getFrontendFee({
        sell: notPrimaryTokenAmount,
        buy: buyPrimaryAmountOver99,
        sellInPrimaryTokenValue: buyPrimaryAmountOver99,
        lpTokenHeld: {tokenId: 'lp.token', quantity: Quantities.zero},
        buyInPrimaryTokenValue: buyPrimaryAmountOver99,
        primaryTokenId,
        discountTiers: milkHoldersDiscountTiers,
      })
      // assert
      expect(fee).toEqual({
        fee: {
          tokenId: primaryTokenId,
          quantity: asQuantity(1_050_000), // no milk, 100 ADA * 0.05% + 1 = 1.05 ADA
        },
        discountTier: milkHoldersDiscountTiers[2],
      })
    })

    it('>= 100 and milk in balance >= 100', () => {
      // arrange
      const buyPrimaryAmountOver99: Balance.Amount = {
        tokenId: primaryTokenId,
        quantity: asQuantity(100_000_000),
      }
      // act
      const fee = getFrontendFee({
        sell: notPrimaryTokenAmount,
        buy: buyPrimaryAmountOver99,
        lpTokenHeld: {tokenId: 'lp.token', quantity: '499'},
        sellInPrimaryTokenValue: buyPrimaryAmountOver99,
        buyInPrimaryTokenValue: buyPrimaryAmountOver99,
        primaryTokenId,
        discountTiers: milkHoldersDiscountTiers,
      })
      // assert
      expect(fee).toEqual({
        fee: {
          tokenId: primaryTokenId,
          quantity: asQuantity(1_025_000), // hold 100-499 milk, 100 ADA * 0.025% + 1 = 1.025 ADA
        },
        discountTier: milkHoldersDiscountTiers[1],
      })
    })

    it('>= 100 and milk in balance >= 500', () => {
      // arrange
      const buyPrimaryAmountOver99: Balance.Amount = {
        tokenId: primaryTokenId,
        quantity: asQuantity(100_000_000),
      }
      // act
      const fee = getFrontendFee({
        sell: notPrimaryTokenAmount,
        buy: buyPrimaryAmountOver99,
        lpTokenHeld: {tokenId: 'lp.token', quantity: '500'},
        sellInPrimaryTokenValue: buyPrimaryAmountOver99,
        buyInPrimaryTokenValue: buyPrimaryAmountOver99,
        primaryTokenId,
        discountTiers: milkHoldersDiscountTiers,
      })
      // assert
      expect(fee).toEqual({
        fee: {
          tokenId: primaryTokenId,
          quantity: asQuantity(1_020_000), // hold 500+ milk, 100 ADA * 0.020% + 1= 1.02 ADA
        },
        discountTier: milkHoldersDiscountTiers[0],
      })
    })
  })
  it('should calc 0 fee if no tier', () => {
    // arrange
    const buyPrimaryAmountOver99: Balance.Amount = {
      tokenId: primaryTokenId,
      quantity: asQuantity(100_000_000),
    }
    // act
    const fee = getFrontendFee({
      sell: notPrimaryTokenAmount,
      buy: buyPrimaryAmountOver99,
      lpTokenHeld: {tokenId: 'lp.token', quantity: '999999999999999'},
      sellInPrimaryTokenValue: buyPrimaryAmountOver99,
      buyInPrimaryTokenValue: buyPrimaryAmountOver99,
      primaryTokenId,
      discountTiers: [],
    })
    // assert
    expect(fee).toEqual({
      fee: {
        tokenId: primaryTokenId,
        quantity: Quantities.zero,
      },
      discountTier: undefined,
    })
  })

  it('should fallback - coverage only', () => {
    // arrange
    const buyPrimaryAmountOver99: Balance.Amount = {
      tokenId: primaryTokenId,
      quantity: asQuantity(1_000_000),
    }
    // act
    const fee = getFrontendFee({
      sell: notPrimaryTokenAmount,
      buy: buyPrimaryAmountOver99,
      lpTokenHeld: {tokenId: 'lp.token', quantity: '999999999999999'},
      primaryTokenId,
    })
    // assert
    expect(fee).toEqual({
      fee: {
        tokenId: primaryTokenId,
        quantity: Quantities.zero,
      },
      discountTier: undefined,
    })
  })

  // TODO: check with openswap
  describe('neither sell nor buy are primary token, it should use the value in ADA (paired)', () => {
    it('< 100 and whatever milk in balance', () => {
      // arrange
      const sellNotPrimaryAmount: Balance.Amount = {
        tokenId: 'not.primary.token',
        quantity: asQuantity(99_999_999),
      }
      const sellValueInPrimaryToken: Balance.Amount = {
        tokenId: primaryTokenId,
        quantity: asQuantity(99_999_999),
      }
      const buyValueInPrimaryToken: Balance.Amount = {
        tokenId: primaryTokenId,
        quantity: asQuantity(99_999_998),
      }
      // act
      const fee = getFrontendFee({
        sell: sellNotPrimaryAmount,
        buy: notPrimaryTokenAmount,
        sellInPrimaryTokenValue: sellValueInPrimaryToken,
        lpTokenHeld: {tokenId: 'lp.token', quantity: '999999999999999999'},
        buyInPrimaryTokenValue: buyValueInPrimaryToken,
        primaryTokenId,
        discountTiers: milkHoldersDiscountTiers,
      })
      // assert
      expect(fee).toEqual({
        fee: {
          tokenId: primaryTokenId,
          quantity: Quantities.zero,
        },
        discountTier: undefined,
      })
    })

    it('>= 100 and milk in balance = 0', () => {
      // arrange
      const sellNotPrimaryAmountOver99: Balance.Amount = {
        tokenId: 'not.primary.token',
        quantity: asQuantity(100_000_000),
      }
      const sellValueInPrimaryToken: Balance.Amount = {
        tokenId: primaryTokenId,
        quantity: asQuantity(100_000_000),
      }
      const buyValueInPrimaryToken: Balance.Amount = {
        tokenId: primaryTokenId,
        quantity: asQuantity(99_999_998),
      }
      // act
      const fee = getFrontendFee({
        sell: sellNotPrimaryAmountOver99,
        buy: notPrimaryTokenAmount,
        sellInPrimaryTokenValue: sellValueInPrimaryToken,
        lpTokenHeld: {tokenId: 'lp.token', quantity: Quantities.zero},
        buyInPrimaryTokenValue: buyValueInPrimaryToken,
        primaryTokenId,
        discountTiers: milkHoldersDiscountTiers,
      })
      // assert
      expect(fee).toEqual({
        fee: {
          tokenId: primaryTokenId,
          quantity: asQuantity(1_050_000), // no milk, 100 ADA * 0.05% + 1 = 1.05 ADA
        },
        discountTier: milkHoldersDiscountTiers[2],
      })
    })

    it('>= 100 and milk in balance >= 100 (buy side higher)', () => {
      // arrange
      const sellNotPrimaryAmountOver99: Balance.Amount = {
        tokenId: 'not.primary.token',
        quantity: asQuantity(100_000_000),
      }
      const sellValueInPrimaryToken: Balance.Amount = {
        tokenId: primaryTokenId,
        quantity: asQuantity(99_000_000),
      }
      const buyValueInPrimaryToken: Balance.Amount = {
        tokenId: primaryTokenId,
        quantity: asQuantity(100_000_000),
      }
      // act
      const fee = getFrontendFee({
        sell: sellNotPrimaryAmountOver99,
        buy: notPrimaryTokenAmount,
        lpTokenHeld: {tokenId: 'lp.token', quantity: '499'},
        sellInPrimaryTokenValue: sellValueInPrimaryToken,
        buyInPrimaryTokenValue: buyValueInPrimaryToken,
        primaryTokenId,
        discountTiers: milkHoldersDiscountTiers,
      })
      // assert
      expect(fee).toEqual({
        fee: {
          tokenId: primaryTokenId,
          quantity: asQuantity(1_025_000), // hold 100-499 milk, 100 ADA * 0.025% + 1= 1.025 ADA
        },
        discountTier: milkHoldersDiscountTiers[1],
      })
    })

    it('>= 100 and milk in balance >= 500 (50/50)', () => {
      // arrange
      const sellNotPrimaryAmountOver99: Balance.Amount = {
        tokenId: primaryTokenId,
        quantity: asQuantity(100_000_000),
      }
      const sellValueInPrimaryToken: Balance.Amount = {
        tokenId: primaryTokenId,
        quantity: asQuantity(100_000_000),
      }
      const buyValueInPrimaryToken: Balance.Amount = {
        tokenId: primaryTokenId,
        quantity: asQuantity(100_000_000),
      }
      // act
      const fee = getFrontendFee({
        sell: sellNotPrimaryAmountOver99,
        buy: notPrimaryTokenAmount,
        lpTokenHeld: {tokenId: 'lp.token', quantity: '500'},
        sellInPrimaryTokenValue: sellValueInPrimaryToken,
        buyInPrimaryTokenValue: buyValueInPrimaryToken,
        primaryTokenId,
        discountTiers: milkHoldersDiscountTiers,
      })
      // assert
      expect(fee).toEqual({
        fee: {
          tokenId: primaryTokenId,
          quantity: asQuantity(1_020_000), // hold 500+ milk, 100 ADA * 0.020% + 1 = 1.02 ADA
        },
        discountTier: milkHoldersDiscountTiers[0],
      })
    })
  })
})
