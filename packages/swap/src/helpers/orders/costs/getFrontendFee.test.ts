import {App, Balance} from '@yoroi/types'
import {AppApi} from '@yoroi/api'

import {getFrontendFee} from './getFrontendFee'
import {Quantities} from '../../../utils/quantities'
import {asQuantity} from '../../../utils/asQuantity'

describe('getFrontendFee', () => {
  const primaryTokenId = 'primary.token'

  const milkHoldersDiscountTiers: ReadonlyArray<App.FrontendFeeTier> =
    AppApi.mockGetFrontendFees.withFees.muesliswap!

  describe('selling side is primary token', () => {
    it('< 100 and whatever milk in balance', () => {
      // arrange
      const sell: Balance.Amount = {
        tokenId: primaryTokenId,
        quantity: asQuantity(99_999_999),
      }
      // act
      const fee = getFrontendFee({
        lpTokenHeld: {tokenId: 'lp.token', quantity: '999999999999999999'},
        ptAmount: sell,
        feeTiers: milkHoldersDiscountTiers,
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
        ptAmount: sellPrimaryAmountOver99,
        lpTokenHeld: {tokenId: 'lp.token', quantity: Quantities.zero},
        feeTiers: milkHoldersDiscountTiers,
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
        lpTokenHeld: {tokenId: 'lp.token', quantity: '499'},
        ptAmount: sellPrimaryAmountOver99,
        feeTiers: milkHoldersDiscountTiers,
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
        lpTokenHeld: {tokenId: 'lp.token', quantity: '500'},
        ptAmount: sellPrimaryAmountOver99,
        feeTiers: milkHoldersDiscountTiers,
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
        ptAmount: buyPrimaryTokenAmount,
        lpTokenHeld: {tokenId: 'lp.token', quantity: '999999999999999999'},
        feeTiers: milkHoldersDiscountTiers,
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
        ptAmount: buyPrimaryAmountOver99,
        lpTokenHeld: {tokenId: 'lp.token', quantity: Quantities.zero},
        feeTiers: milkHoldersDiscountTiers,
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
        lpTokenHeld: {tokenId: 'lp.token', quantity: '499'},
        ptAmount: buyPrimaryAmountOver99,
        feeTiers: milkHoldersDiscountTiers,
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
        lpTokenHeld: {tokenId: 'lp.token', quantity: '500'},
        ptAmount: buyPrimaryAmountOver99,
        feeTiers: milkHoldersDiscountTiers,
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
      lpTokenHeld: {tokenId: 'lp.token', quantity: '999999999999999'},
      ptAmount: buyPrimaryAmountOver99,
      feeTiers: [],
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

  it('should add only the fixedFee when no variable', () => {
    // arrange
    const buyPrimaryAmountOver99: Balance.Amount = {
      tokenId: primaryTokenId,
      quantity: asQuantity(100_000_000),
    }
    // act
    const fee = getFrontendFee({
      lpTokenHeld: {tokenId: 'lp.token', quantity: '999999999999999'},
      ptAmount: buyPrimaryAmountOver99,
      feeTiers: [
        {
          fixedFee: asQuantity(3_000_000),
          primaryTokenValueThreshold: Quantities.zero,
          secondaryTokenBalanceThreshold: Quantities.zero,
          variableFeeMultiplier: 0,
        },
      ],
    })
    // assert
    expect(fee).toEqual({
      fee: {
        tokenId: primaryTokenId,
        quantity: asQuantity(3_000_000),
      },
      discountTier: {
        fixedFee: asQuantity(3_000_000),
        primaryTokenValueThreshold: Quantities.zero,
        secondaryTokenBalanceThreshold: Quantities.zero,
        variableFeeMultiplier: 0,
      },
    })
  })

  describe('neither sell nor buy are primary token, it should use the value in ADA (paired) of selling side', () => {
    it('< 100 and whatever milk in balance', () => {
      // arrange
      const sellValueInPrimaryToken: Balance.Amount = {
        tokenId: primaryTokenId,
        quantity: asQuantity(99_999_999),
      }
      // act
      const fee = getFrontendFee({
        ptAmount: sellValueInPrimaryToken,
        lpTokenHeld: {tokenId: 'lp.token', quantity: '999999999999999999'},
        feeTiers: milkHoldersDiscountTiers,
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
      const sellValueInPrimaryToken: Balance.Amount = {
        tokenId: primaryTokenId,
        quantity: asQuantity(100_000_000),
      }
      // act
      const fee = getFrontendFee({
        ptAmount: sellValueInPrimaryToken,
        lpTokenHeld: {tokenId: 'lp.token', quantity: Quantities.zero},
        feeTiers: milkHoldersDiscountTiers,
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
      const sellValueInPrimaryToken: Balance.Amount = {
        tokenId: primaryTokenId,
        quantity: asQuantity(100_000_000),
      }
      // act
      const fee = getFrontendFee({
        lpTokenHeld: {tokenId: 'lp.token', quantity: '499'},
        ptAmount: sellValueInPrimaryToken,
        feeTiers: milkHoldersDiscountTiers,
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
      const sellValueInPrimaryToken: Balance.Amount = {
        tokenId: primaryTokenId,
        quantity: asQuantity(100_000_000),
      }
      // act
      const fee = getFrontendFee({
        lpTokenHeld: {tokenId: 'lp.token', quantity: '500'},
        ptAmount: sellValueInPrimaryToken,
        feeTiers: milkHoldersDiscountTiers,
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
