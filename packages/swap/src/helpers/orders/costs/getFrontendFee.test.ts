import {App, Portfolio} from '@yoroi/types'
import {AppApi} from '@yoroi/api'

import {getFrontendFee} from './getFrontendFee'
import {Quantities} from '../../../utils/quantities'
import {tokenInfoMocks} from '../../../tokenInfo.mocks'

describe('getFrontendFee', () => {
  const milkHoldersDiscountTiers: ReadonlyArray<App.FrontendFeeTier> =
    AppApi.mockGetFrontendFees.withFees.muesliswap!

  describe('selling side is primary token', () => {
    it('< 100 and whatever milk in balance', () => {
      // arrange
      const sell: Portfolio.Token.Amount = {
        info: tokenInfoMocks.pt,
        quantity: 99_999_999n,
      }
      // act
      const fee = getFrontendFee({
        lpTokenHeld: {info: tokenInfoMocks.lp, quantity: 999999999999999999n},
        ptAmount: sell,
        feeTiers: milkHoldersDiscountTiers,
      })
      // assert
      expect(fee).toEqual({
        fee: {
          info: tokenInfoMocks.pt,
          quantity: 0n,
        },
        discountTier: undefined,
      })
    })

    it('>= 100 and milk in balance = 0', () => {
      // arrange
      const sellPrimaryAmountOver99: Portfolio.Token.Amount = {
        info: tokenInfoMocks.pt,
        quantity: 100_000_000n,
      }
      // act
      const fee = getFrontendFee({
        ptAmount: sellPrimaryAmountOver99,
        lpTokenHeld: {info: tokenInfoMocks.lp, quantity: 0n},
        feeTiers: milkHoldersDiscountTiers,
      })
      // assert
      expect(fee).toEqual({
        fee: {
          info: tokenInfoMocks.pt,
          quantity: 1_050_000n, // no milk, 100 ADA * 0.05% + 1 = 1.05 ADA
        },
        discountTier: milkHoldersDiscountTiers[2],
      })
    })

    it('>= 100 and milk in balance >= 100', () => {
      // arrange
      const sellPrimaryAmountOver99: Portfolio.Token.Amount = {
        info: tokenInfoMocks.pt,
        quantity: 100_000_000n,
      }
      // act
      const fee = getFrontendFee({
        lpTokenHeld: {info: tokenInfoMocks.lp, quantity: 499n},
        ptAmount: sellPrimaryAmountOver99,
        feeTiers: milkHoldersDiscountTiers,
      })
      // assert
      expect(fee).toEqual({
        fee: {
          info: tokenInfoMocks.pt,
          quantity: 1_025_000n, // hold 100-499 milk, 100 ADA * 0.025% + 1 = 1.025 ADA
        },
        discountTier: milkHoldersDiscountTiers[1],
      })
    })

    it('>= 100 and milk in balance >= 500', () => {
      // arrange
      const sellPrimaryAmountOver99: Portfolio.Token.Amount = {
        info: tokenInfoMocks.pt,
        quantity: 100_000_000n,
      }
      // act
      const fee = getFrontendFee({
        lpTokenHeld: {info: tokenInfoMocks.lp, quantity: 500n},
        ptAmount: sellPrimaryAmountOver99,
        feeTiers: milkHoldersDiscountTiers,
      })
      // assert
      expect(fee).toEqual({
        fee: {
          info: tokenInfoMocks.pt,
          quantity: 1_020_000n, // hold 500+ milk, 100 ADA * 0.020% + 1 = 1.02 ADA
        },
        discountTier: milkHoldersDiscountTiers[0],
      })
    })
  })

  describe('buying side is primary token', () => {
    it('< 100 and whatever milk in balance', () => {
      // arrange
      const buyPrimaryTokenAmount: Portfolio.Token.Amount = {
        info: tokenInfoMocks.pt,
        quantity: 99_999_999n,
      }
      // act
      const fee = getFrontendFee({
        ptAmount: buyPrimaryTokenAmount,
        lpTokenHeld: {info: tokenInfoMocks.lp, quantity: 999999999999999999n},
        feeTiers: milkHoldersDiscountTiers,
      })
      // assert
      expect(fee).toEqual({
        fee: {
          info: tokenInfoMocks.pt,
          quantity: 0n,
        },
        discountTier: undefined,
      })
    })

    it('>= 100 and milk in balance = 0', () => {
      // arrange
      const buyPrimaryAmountOver99: Portfolio.Token.Amount = {
        info: tokenInfoMocks.pt,
        quantity: 100_000_000n,
      }
      // act
      const fee = getFrontendFee({
        ptAmount: buyPrimaryAmountOver99,
        lpTokenHeld: {info: tokenInfoMocks.lp, quantity: 0n},
        feeTiers: milkHoldersDiscountTiers,
      })
      // assert
      expect(fee).toEqual({
        fee: {
          info: tokenInfoMocks.pt,
          quantity: 1_050_000n, // no milk, 100 ADA * 0.05% + 1 = 1.05 ADA
        },
        discountTier: milkHoldersDiscountTiers[2],
      })
    })

    it('>= 100 and milk in balance >= 100', () => {
      // arrange
      const buyPrimaryAmountOver99: Portfolio.Token.Amount = {
        info: tokenInfoMocks.pt,
        quantity: 100_000_000n,
      }
      // act
      const fee = getFrontendFee({
        lpTokenHeld: {info: tokenInfoMocks.lp, quantity: 499n},
        ptAmount: buyPrimaryAmountOver99,
        feeTiers: milkHoldersDiscountTiers,
      })
      // assert
      expect(fee).toEqual({
        fee: {
          info: tokenInfoMocks.pt,
          quantity: 1_025_000n, // hold 100-499 milk, 100 ADA * 0.025% + 1 = 1.025 ADA
        },
        discountTier: milkHoldersDiscountTiers[1],
      })
    })

    it('>= 100 and milk in balance >= 500', () => {
      // arrange
      const buyPrimaryAmountOver99: Portfolio.Token.Amount = {
        info: tokenInfoMocks.pt,
        quantity: 100_000_000n,
      }
      // act
      const fee = getFrontendFee({
        lpTokenHeld: {info: tokenInfoMocks.lp, quantity: 500n},
        ptAmount: buyPrimaryAmountOver99,
        feeTiers: milkHoldersDiscountTiers,
      })
      // assert
      expect(fee).toEqual({
        fee: {
          info: tokenInfoMocks.pt,
          quantity: 1_020_000n, // hold 500+ milk, 100 ADA * 0.020% + 1= 1.02 ADA
        },
        discountTier: milkHoldersDiscountTiers[0],
      })
    })
  })
  it('should calc 0 fee if no tier', () => {
    // arrange
    const buyPrimaryAmountOver99: Portfolio.Token.Amount = {
      info: tokenInfoMocks.pt,
      quantity: 100_000_000n,
    }
    // act
    const fee = getFrontendFee({
      lpTokenHeld: {info: tokenInfoMocks.lp, quantity: 999999999999999n},
      ptAmount: buyPrimaryAmountOver99,
      feeTiers: [],
    })
    // assert
    expect(fee).toEqual({
      fee: {
        info: tokenInfoMocks.pt,
        quantity: 0n,
      },
      discountTier: undefined,
    })
  })

  it('should add only the fixedFee when no variable', () => {
    // arrange
    const buyPrimaryAmountOver99: Portfolio.Token.Amount = {
      info: tokenInfoMocks.pt,
      quantity: 100_000_000n,
    }
    // act
    const fee = getFrontendFee({
      lpTokenHeld: {info: tokenInfoMocks.lp, quantity: 999999999999999n},
      ptAmount: buyPrimaryAmountOver99,
      feeTiers: [
        {
          fixedFee: '3000000',
          primaryTokenValueThreshold: Quantities.zero,
          secondaryTokenBalanceThreshold: Quantities.zero,
          variableFeeMultiplier: 0,
        },
      ],
    })
    // assert
    expect(fee).toEqual({
      fee: {
        info: tokenInfoMocks.pt,
        quantity: 3_000_000n,
      },
      discountTier: {
        fixedFee: '3000000',
        primaryTokenValueThreshold: Quantities.zero,
        secondaryTokenBalanceThreshold: Quantities.zero,
        variableFeeMultiplier: 0,
      },
    })
  })

  describe('neither sell nor buy are primary token, it should use the value in ADA (paired) of selling side', () => {
    it('< 100 and whatever milk in balance', () => {
      // arrange
      const sellValueInPrimaryToken: Portfolio.Token.Amount = {
        info: tokenInfoMocks.pt,
        quantity: 99_999_999n,
      }
      // act
      const fee = getFrontendFee({
        ptAmount: sellValueInPrimaryToken,
        lpTokenHeld: {info: tokenInfoMocks.lp, quantity: 999999999999999999n},
        feeTiers: milkHoldersDiscountTiers,
      })
      // assert
      expect(fee).toEqual({
        fee: {
          info: tokenInfoMocks.pt,
          quantity: 0n,
        },
        discountTier: undefined,
      })
    })
    it('>= 100 and milk in balance = 0', () => {
      // arrange
      const sellValueInPrimaryToken: Portfolio.Token.Amount = {
        info: tokenInfoMocks.pt,
        quantity: 100_000_000n,
      }
      // act
      const fee = getFrontendFee({
        ptAmount: sellValueInPrimaryToken,
        lpTokenHeld: {info: tokenInfoMocks.lp, quantity: 0n},
        feeTiers: milkHoldersDiscountTiers,
      })
      // assert
      expect(fee).toEqual({
        fee: {
          info: tokenInfoMocks.pt,
          quantity: 1_050_000n, // no milk, 100 ADA * 0.05% + 1 = 1.05 ADA
        },
        discountTier: milkHoldersDiscountTiers[2],
      })
    })

    it('>= 100 and milk in balance >= 100 (buy side higher)', () => {
      // arrange
      const sellValueInPrimaryToken: Portfolio.Token.Amount = {
        info: tokenInfoMocks.pt,
        quantity: 100_000_000n,
      }
      // act
      const fee = getFrontendFee({
        lpTokenHeld: {info: tokenInfoMocks.lp, quantity: 499n},
        ptAmount: sellValueInPrimaryToken,
        feeTiers: milkHoldersDiscountTiers,
      })
      // assert
      expect(fee).toEqual({
        fee: {
          info: tokenInfoMocks.pt,
          quantity: 1_025_000n, // hold 100-499 milk, 100 ADA * 0.025% + 1= 1.025 ADA
        },
        discountTier: milkHoldersDiscountTiers[1],
      })
    })

    it('>= 100 and milk in balance >= 500 (50/50)', () => {
      // arrange
      const sellValueInPrimaryToken: Portfolio.Token.Amount = {
        info: tokenInfoMocks.pt,
        quantity: 100_000_000n,
      }
      // act
      const fee = getFrontendFee({
        lpTokenHeld: {info: tokenInfoMocks.lp, quantity: 500n},
        ptAmount: sellValueInPrimaryToken,
        feeTiers: milkHoldersDiscountTiers,
      })
      // assert
      expect(fee).toEqual({
        fee: {
          info: tokenInfoMocks.pt,
          quantity: 1_020_000n, // hold 500+ milk, 100 ADA * 0.020% + 1 = 1.02 ADA
        },
        discountTier: milkHoldersDiscountTiers[0],
      })
    })
  })
})
