import {primaryTokenId} from '@yoroi/portfolio'
import {Address, Balance, TokenId, TransactionHash} from '@yoroi/types'

import {BigNumber} from 'bignumber.js'

import {ModernUtxo} from '../utxo/models'
import {
  getAdaAmount,
  getTokenIds,
  getUtxoValue,
  hasEnoughAmounts,
  subtractAmounts,
  sumAmounts,
  utxoHasRelevantAssets,
} from './utils'

describe('utxo-selection utils', () => {
  const createMockUtxo = (
    balance: Balance.Amounts,
    txHash = 'hash1',
    txIndex = 0,
  ): ModernUtxo => ({
    receiver: 'addr_test1' as Address,
    txHash: txHash as TransactionHash,
    txIndex,
    balance,
    toTransactionUnspentOutputHex: jest.fn(() => 'hex'),
    toTransactionUnspentOutput: jest.fn(),
  })

  describe('sumAmounts', () => {
    it('should sum amounts from multiple objects', () => {
      const token1 = 'token1' as TokenId
      const amounts1: Balance.Amounts = {
        [primaryTokenId]: '1000000',
        [token1]: '100',
      } as Balance.Amounts
      const amounts2: Balance.Amounts = {
        [primaryTokenId]: '2000000',
        [token1]: '50',
      } as Balance.Amounts
      const result = sumAmounts([amounts1, amounts2])
      const primaryTokenIdStr = primaryTokenId as string
      expect(result[primaryTokenIdStr as TokenId]).toBe('3000000')
      expect(result[token1]).toBe('150')
    })

    it('should handle empty array', () => {
      const result = sumAmounts([])
      expect(result).toEqual({})
    })

    it('should handle single amount object', () => {
      const amounts: Balance.Amounts = {
        [primaryTokenId]: '1000000' as Balance.Quantity,
      }
      const result = sumAmounts([amounts])
      expect(result).toEqual(amounts)
    })
  })

  describe('subtractAmounts', () => {
    it('should subtract amounts2 from amounts1', () => {
      const token1 = 'token1' as TokenId
      const amounts1: Balance.Amounts = {
        [primaryTokenId]: '3000000',
        [token1]: '150',
      } as Balance.Amounts
      const amounts2: Balance.Amounts = {
        [primaryTokenId]: '1000000',
        [token1]: '50',
      } as Balance.Amounts
      const result = subtractAmounts(amounts1, amounts2)
      const primaryTokenIdStr = primaryTokenId as string
      expect(result[primaryTokenIdStr as TokenId]).toBe('2000000')
      expect(result[token1]).toBe('100')
    })

    it('should remove token when result is zero or negative', () => {
      const token1 = 'token1' as TokenId
      const amounts1: Balance.Amounts = {
        [primaryTokenId]: '1000000',
        [token1]: '50',
      } as Balance.Amounts
      const amounts2: Balance.Amounts = {
        [primaryTokenId]: '1000000',
        [token1]: '100',
      } as Balance.Amounts
      const result = subtractAmounts(amounts1, amounts2)
      const primaryTokenIdStr = primaryTokenId as string
      expect(result[primaryTokenIdStr as TokenId]).toBeUndefined()
      expect(result[token1]).toBeUndefined()
    })

    it('should handle amounts2 with tokens not in amounts1', () => {
      const token1 = 'token1' as TokenId
      const amounts1: Balance.Amounts = {
        [primaryTokenId]: '1000000' as Balance.Quantity,
      }
      const amounts2: Balance.Amounts = {
        [primaryTokenId]: '500000',
        [token1]: '100',
      } as Balance.Amounts
      const result = subtractAmounts(amounts1, amounts2)
      const primaryTokenIdStr = primaryTokenId as string
      expect(result[primaryTokenIdStr as TokenId]).toBe('500000')
      expect(result[token1]).toBeUndefined()
    })
  })

  describe('hasEnoughAmounts', () => {
    it('should return true when amounts1 has enough', () => {
      const token1 = 'token1' as TokenId
      const amounts1: Balance.Amounts = {
        [primaryTokenId]: '3000000',
        [token1]: '150',
      } as Balance.Amounts
      const amounts2: Balance.Amounts = {
        [primaryTokenId]: '2000000',
        [token1]: '100',
      } as Balance.Amounts
      expect(hasEnoughAmounts(amounts1, amounts2)).toBe(true)
    })

    it('should return false when amounts1 has insufficient ADA', () => {
      const amounts1: Balance.Amounts = {
        [primaryTokenId]: '1000000' as Balance.Quantity,
      }
      const amounts2: Balance.Amounts = {
        [primaryTokenId]: '2000000' as Balance.Quantity,
      }
      expect(hasEnoughAmounts(amounts1, amounts2)).toBe(false)
    })

    it('should return false when amounts1 has insufficient token', () => {
      const token1 = 'token1' as TokenId
      const amounts1: Balance.Amounts = {
        [primaryTokenId]: '3000000',
        [token1]: '50',
      } as Balance.Amounts
      const amounts2: Balance.Amounts = {
        [primaryTokenId]: '2000000',
        [token1]: '100',
      } as Balance.Amounts
      expect(hasEnoughAmounts(amounts1, amounts2)).toBe(false)
    })

    it('should return true when amounts1 has exactly enough', () => {
      const amounts1: Balance.Amounts = {
        [primaryTokenId]: '2000000' as Balance.Quantity,
      }
      const amounts2: Balance.Amounts = {
        [primaryTokenId]: '2000000' as Balance.Quantity,
      }
      expect(hasEnoughAmounts(amounts1, amounts2)).toBe(true)
    })

    it('should handle empty amounts2', () => {
      const amounts1: Balance.Amounts = {
        [primaryTokenId]: '1000000' as Balance.Quantity,
      }
      const amounts2: Balance.Amounts = {}
      expect(hasEnoughAmounts(amounts1, amounts2)).toBe(true)
    })
  })

  describe('getAdaAmount', () => {
    it('should get ADA amount from amounts', () => {
      const token1 = 'token1' as TokenId
      const amounts: Balance.Amounts = {
        [primaryTokenId]: '1000000',
        [token1]: '100',
      } as Balance.Amounts
      const result = getAdaAmount(amounts)
      expect(result).toEqual(new BigNumber('1000000'))
    })

    it('should return zero when ADA not present', () => {
      const token1 = 'token1' as TokenId
      const amounts: Balance.Amounts = {[token1]: '100'} as Balance.Amounts
      const result = getAdaAmount(amounts)
      expect(result).toEqual(new BigNumber('0'))
    })

    it('should use custom primaryTokenId', () => {
      const customTokenId = 'custom' as TokenId
      const amounts: Balance.Amounts = {
        [customTokenId]: '5000000',
      } as Balance.Amounts
      const result = getAdaAmount(amounts, customTokenId)
      expect(result).toEqual(new BigNumber('5000000'))
    })
  })

  describe('getUtxoValue', () => {
    it('should get UTXO value in ADA', () => {
      const token1 = 'token1' as TokenId
      const utxo = createMockUtxo({
        [primaryTokenId]: '1000000',
        [token1]: '100',
      } as Balance.Amounts)
      const result = getUtxoValue(utxo)
      expect(result).toEqual(new BigNumber('1000000'))
    })

    it('should use custom primaryTokenId', () => {
      const customTokenId = 'custom' as TokenId
      const utxo = createMockUtxo({
        [customTokenId]: '5000000',
      } as Balance.Amounts)
      const result = getUtxoValue(utxo, customTokenId)
      expect(result).toEqual(new BigNumber('5000000'))
    })
  })

  describe('utxoHasRelevantAssets', () => {
    it('should return true when UTXO has required asset', () => {
      const token1 = 'token1' as TokenId
      const utxo = createMockUtxo({
        [primaryTokenId]: '1000000',
        [token1]: '100',
      } as Balance.Amounts)
      const required: Balance.Amounts = {[token1]: '50'} as Balance.Amounts
      expect(utxoHasRelevantAssets(utxo, required)).toBe(true)
    })

    it('should return true when UTXO has required ADA', () => {
      const utxo = createMockUtxo({
        [primaryTokenId]: '1000000' as Balance.Quantity,
      })
      const required: Balance.Amounts = {
        [primaryTokenId]: '500000' as Balance.Quantity,
      }
      expect(utxoHasRelevantAssets(utxo, required)).toBe(true)
    })

    it('should return false when UTXO does not have required asset', () => {
      const token1 = 'token1' as TokenId
      const token2 = 'token2' as TokenId
      const utxo = createMockUtxo({
        [primaryTokenId]: '1000000',
        [token1]: '100',
      } as Balance.Amounts)
      const required: Balance.Amounts = {[token2]: '50'} as Balance.Amounts
      expect(utxoHasRelevantAssets(utxo, required)).toBe(false)
    })

    it('should return false when required amounts is empty', () => {
      const utxo = createMockUtxo({
        [primaryTokenId]: '1000000' as Balance.Quantity,
      })
      const required: Balance.Amounts = {}
      expect(utxoHasRelevantAssets(utxo, required)).toBe(false)
    })
  })

  describe('getTokenIds', () => {
    it('should get all token IDs except empty string', () => {
      const token1 = 'token1' as TokenId
      const token2 = 'token2' as TokenId
      const amounts: Balance.Amounts = {
        [primaryTokenId]: '1000000',
        [token1]: '100',
        [token2]: '200',
      } as Balance.Amounts
      const result = getTokenIds(amounts)
      expect(result).toEqual([primaryTokenId, token1, token2])
    })

    it('should filter out empty string', () => {
      const emptyTokenId = '' as TokenId
      const token1 = 'token1' as TokenId
      const amounts: Balance.Amounts = {
        [emptyTokenId]: '100',
        [token1]: '100',
      } as Balance.Amounts
      const result = getTokenIds(amounts)
      expect(result).toEqual([token1])
    })

    it('should return empty array for empty amounts', () => {
      const amounts: Balance.Amounts = {}
      const result = getTokenIds(amounts)
      expect(result).toEqual([])
    })
  })
})
