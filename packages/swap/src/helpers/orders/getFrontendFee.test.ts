import {Balance} from '@yoroi/types'

import {getFrontendFee} from './getFrontendFee'
import {milkHoldersDiscountTiers} from '../../translators/constants'
import {Quantities} from '../../utils/quantities'
import {asQuantity} from '../../utils/asQuantity'

describe('getFrontendFee', () => {
  const primaryTokenInfo: Balance.TokenInfo = {
    id: '',
    decimals: 6,
    description: 'primary',
    fingerprint: '',
    image: '',
    group: '',
    icon: '',
    kind: 'ft',
    name: 'ttADA',
    symbol: 'ttADA',
    ticker: 'ttADA',
    metadatas: {},
  }

  const notPrimaryTokenAmount: Balance.Amount = {
    tokenId: 'not.primary.token',
    quantity: '99',
  }

  describe('selling side is primary token', () => {
    it('< 100 and whatever milk in balance', () => {
      // arrange
      const sellAmount: Balance.Amount = {
        tokenId: primaryTokenInfo.id,
        quantity: asQuantity(99_999_999),
      }
      // act
      const fee = getFrontendFee({
        sellAmount: sellAmount,
        buyAmount: notPrimaryTokenAmount,
        sellInPrimaryTokenValue: sellAmount,
        milkBalance: '999999999999999999',
        buyInPrimaryTokenValue: sellAmount,
        primaryTokenInfo,
        discountTiers: milkHoldersDiscountTiers,
      })
      // assert
      expect(fee).toEqual({
        frontendFee: {
          tokenId: primaryTokenInfo.id,
          quantity: Quantities.zero,
        },
        discountTier: undefined,
      })
    })

    it('>= 100 and milk in balance = 0', () => {
      // arrange
      const sellPrimaryAmountOver99: Balance.Amount = {
        tokenId: primaryTokenInfo.id,
        quantity: asQuantity(100_000_000),
      }
      // act
      const fee = getFrontendFee({
        sellAmount: sellPrimaryAmountOver99,
        buyAmount: notPrimaryTokenAmount,
        sellInPrimaryTokenValue: sellPrimaryAmountOver99,
        milkBalance: Quantities.zero,
        buyInPrimaryTokenValue: sellPrimaryAmountOver99,
        primaryTokenInfo,
        discountTiers: milkHoldersDiscountTiers,
      })
      // assert
      expect(fee).toEqual({
        frontendFee: {
          tokenId: primaryTokenInfo.id,
          quantity: asQuantity(1_050_000), // no milk, 100 ADA * 0.05% + 1 = 1.05 ADA
        },
        discountTier: milkHoldersDiscountTiers[2],
      })
    })

    it('>= 100 and milk in balance >= 100', () => {
      // arrange
      const sellPrimaryAmountOver99: Balance.Amount = {
        tokenId: primaryTokenInfo.id,
        quantity: asQuantity(100_000_000),
      }
      // act
      const fee = getFrontendFee({
        sellAmount: sellPrimaryAmountOver99,
        buyAmount: notPrimaryTokenAmount,
        milkBalance: '499',
        sellInPrimaryTokenValue: sellPrimaryAmountOver99,
        buyInPrimaryTokenValue: sellPrimaryAmountOver99,
        primaryTokenInfo,
        discountTiers: milkHoldersDiscountTiers,
      })
      // assert
      expect(fee).toEqual({
        frontendFee: {
          tokenId: primaryTokenInfo.id,
          quantity: asQuantity(1_025_000), // hold 100-499 milk, 100 ADA * 0.025% + 1 = 1.025 ADA
        },
        discountTier: milkHoldersDiscountTiers[1],
      })
    })

    it('>= 100 and milk in balance >= 500', () => {
      // arrange
      const sellPrimaryAmountOver99: Balance.Amount = {
        tokenId: primaryTokenInfo.id,
        quantity: asQuantity(100_000_000),
      }
      // act
      const fee = getFrontendFee({
        sellAmount: sellPrimaryAmountOver99,
        buyAmount: notPrimaryTokenAmount,
        milkBalance: '500',
        sellInPrimaryTokenValue: sellPrimaryAmountOver99,
        buyInPrimaryTokenValue: sellPrimaryAmountOver99,
        primaryTokenInfo,
        discountTiers: milkHoldersDiscountTiers,
      })
      // assert
      expect(fee).toEqual({
        frontendFee: {
          tokenId: primaryTokenInfo.id,
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
        tokenId: primaryTokenInfo.id,
        quantity: asQuantity(99_999_999),
      }
      // act
      const fee = getFrontendFee({
        sellAmount: notPrimaryTokenAmount,
        buyAmount: buyPrimaryTokenAmount,
        sellInPrimaryTokenValue: buyPrimaryTokenAmount,
        milkBalance: '999999999999999999',
        buyInPrimaryTokenValue: buyPrimaryTokenAmount,
        primaryTokenInfo,
        discountTiers: milkHoldersDiscountTiers,
      })
      // assert
      expect(fee).toEqual({
        frontendFee: {
          tokenId: primaryTokenInfo.id,
          quantity: Quantities.zero,
        },
        discountTier: undefined,
      })
    })

    it('>= 100 and milk in balance = 0', () => {
      // arrange
      const buyPrimaryAmountOver99: Balance.Amount = {
        tokenId: primaryTokenInfo.id,
        quantity: asQuantity(100_000_000),
      }
      // act
      const fee = getFrontendFee({
        sellAmount: notPrimaryTokenAmount,
        buyAmount: buyPrimaryAmountOver99,
        sellInPrimaryTokenValue: buyPrimaryAmountOver99,
        milkBalance: Quantities.zero,
        buyInPrimaryTokenValue: buyPrimaryAmountOver99,
        primaryTokenInfo,
        discountTiers: milkHoldersDiscountTiers,
      })
      // assert
      expect(fee).toEqual({
        frontendFee: {
          tokenId: primaryTokenInfo.id,
          quantity: asQuantity(1_050_000), // no milk, 100 ADA * 0.05% + 1 = 1.05 ADA
        },
        discountTier: milkHoldersDiscountTiers[2],
      })
    })

    it('>= 100 and milk in balance >= 100', () => {
      // arrange
      const buyPrimaryAmountOver99: Balance.Amount = {
        tokenId: primaryTokenInfo.id,
        quantity: asQuantity(100_000_000),
      }
      // act
      const fee = getFrontendFee({
        sellAmount: notPrimaryTokenAmount,
        buyAmount: buyPrimaryAmountOver99,
        milkBalance: '499',
        sellInPrimaryTokenValue: buyPrimaryAmountOver99,
        buyInPrimaryTokenValue: buyPrimaryAmountOver99,
        primaryTokenInfo,
        discountTiers: milkHoldersDiscountTiers,
      })
      // assert
      expect(fee).toEqual({
        frontendFee: {
          tokenId: primaryTokenInfo.id,
          quantity: asQuantity(1_025_000), // hold 100-499 milk, 100 ADA * 0.025% + 1 = 1.025 ADA
        },
        discountTier: milkHoldersDiscountTiers[1],
      })
    })

    it('>= 100 and milk in balance >= 500', () => {
      // arrange
      const buyPrimaryAmountOver99: Balance.Amount = {
        tokenId: primaryTokenInfo.id,
        quantity: asQuantity(100_000_000),
      }
      // act
      const fee = getFrontendFee({
        sellAmount: notPrimaryTokenAmount,
        buyAmount: buyPrimaryAmountOver99,
        milkBalance: '500',
        sellInPrimaryTokenValue: buyPrimaryAmountOver99,
        buyInPrimaryTokenValue: buyPrimaryAmountOver99,
        primaryTokenInfo,
        discountTiers: milkHoldersDiscountTiers,
      })
      // assert
      expect(fee).toEqual({
        frontendFee: {
          tokenId: primaryTokenInfo.id,
          quantity: asQuantity(1_020_000), // hold 500+ milk, 100 ADA * 0.020% + 1= 1.02 ADA
        },
        discountTier: milkHoldersDiscountTiers[0],
      })
    })
  })
  it('should calc 0 fee if no tier', () => {
    // arrange
    const buyPrimaryAmountOver99: Balance.Amount = {
      tokenId: primaryTokenInfo.id,
      quantity: asQuantity(100_000_000),
    }
    // act
    const fee = getFrontendFee({
      sellAmount: notPrimaryTokenAmount,
      buyAmount: buyPrimaryAmountOver99,
      milkBalance: '999999999999999',
      sellInPrimaryTokenValue: buyPrimaryAmountOver99,
      buyInPrimaryTokenValue: buyPrimaryAmountOver99,
      primaryTokenInfo,
      discountTiers: [],
    })
    // assert
    expect(fee).toEqual({
      frontendFee: {
        tokenId: primaryTokenInfo.id,
        quantity: Quantities.zero,
      },
      discountTier: undefined,
    })
  })

  it('should fallback - coverage only', () => {
    // arrange
    const buyPrimaryAmountOver99: Balance.Amount = {
      tokenId: primaryTokenInfo.id,
      quantity: asQuantity(1_000_000),
    }
    // act
    const fee = getFrontendFee({
      sellAmount: notPrimaryTokenAmount,
      buyAmount: buyPrimaryAmountOver99,
      milkBalance: '999999999999999',
      primaryTokenInfo,
    })
    // assert
    expect(fee).toEqual({
      frontendFee: {
        tokenId: primaryTokenInfo.id,
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
        tokenId: primaryTokenInfo.id,
        quantity: asQuantity(99_999_999),
      }
      const buyValueInPrimaryToken: Balance.Amount = {
        tokenId: primaryTokenInfo.id,
        quantity: asQuantity(99_999_998),
      }
      // act
      const fee = getFrontendFee({
        sellAmount: sellNotPrimaryAmount,
        buyAmount: notPrimaryTokenAmount,
        sellInPrimaryTokenValue: sellValueInPrimaryToken,
        milkBalance: '999999999999999999',
        buyInPrimaryTokenValue: buyValueInPrimaryToken,
        primaryTokenInfo,
        discountTiers: milkHoldersDiscountTiers,
      })
      // assert
      expect(fee).toEqual({
        frontendFee: {
          tokenId: primaryTokenInfo.id,
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
        tokenId: primaryTokenInfo.id,
        quantity: asQuantity(100_000_000),
      }
      const buyValueInPrimaryToken: Balance.Amount = {
        tokenId: primaryTokenInfo.id,
        quantity: asQuantity(99_999_998),
      }
      // act
      const fee = getFrontendFee({
        sellAmount: sellNotPrimaryAmountOver99,
        buyAmount: notPrimaryTokenAmount,
        sellInPrimaryTokenValue: sellValueInPrimaryToken,
        milkBalance: Quantities.zero,
        buyInPrimaryTokenValue: buyValueInPrimaryToken,
        primaryTokenInfo,
        discountTiers: milkHoldersDiscountTiers,
      })
      // assert
      expect(fee).toEqual({
        frontendFee: {
          tokenId: primaryTokenInfo.id,
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
        tokenId: primaryTokenInfo.id,
        quantity: asQuantity(99_000_000),
      }
      const buyValueInPrimaryToken: Balance.Amount = {
        tokenId: primaryTokenInfo.id,
        quantity: asQuantity(100_000_000),
      }
      // act
      const fee = getFrontendFee({
        sellAmount: sellNotPrimaryAmountOver99,
        buyAmount: notPrimaryTokenAmount,
        milkBalance: '499',
        sellInPrimaryTokenValue: sellValueInPrimaryToken,
        buyInPrimaryTokenValue: buyValueInPrimaryToken,
        primaryTokenInfo,
        discountTiers: milkHoldersDiscountTiers,
      })
      // assert
      expect(fee).toEqual({
        frontendFee: {
          tokenId: primaryTokenInfo.id,
          quantity: asQuantity(1_025_000), // hold 100-499 milk, 100 ADA * 0.025% + 1= 1.025 ADA
        },
        discountTier: milkHoldersDiscountTiers[1],
      })
    })

    it('>= 100 and milk in balance >= 500 (50/50)', () => {
      // arrange
      const sellNotPrimaryAmountOver99: Balance.Amount = {
        tokenId: primaryTokenInfo.id,
        quantity: asQuantity(100_000_000),
      }
      const sellValueInPrimaryToken: Balance.Amount = {
        tokenId: primaryTokenInfo.id,
        quantity: asQuantity(100_000_000),
      }
      const buyValueInPrimaryToken: Balance.Amount = {
        tokenId: primaryTokenInfo.id,
        quantity: asQuantity(100_000_000),
      }
      // act
      const fee = getFrontendFee({
        sellAmount: sellNotPrimaryAmountOver99,
        buyAmount: notPrimaryTokenAmount,
        milkBalance: '500',
        sellInPrimaryTokenValue: sellValueInPrimaryToken,
        buyInPrimaryTokenValue: buyValueInPrimaryToken,
        primaryTokenInfo,
        discountTiers: milkHoldersDiscountTiers,
      })
      // assert
      expect(fee).toEqual({
        frontendFee: {
          tokenId: primaryTokenInfo.id,
          quantity: asQuantity(1_020_000), // hold 500+ milk, 100 ADA * 0.020% + 1 = 1.02 ADA
        },
        discountTier: milkHoldersDiscountTiers[0],
      })
    })
  })
})
