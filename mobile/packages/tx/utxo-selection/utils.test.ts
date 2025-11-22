import {Balance} from '@yoroi/types'

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
    receiver: 'addr_test1',
    txHash,
    txIndex,
    balance,
    toTransactionUnspentOutputHex: jest.fn(() => 'hex'),
    toTransactionUnspentOutput: jest.fn(),
  })

  describe('sumAmounts', () => {
    it('should sum amounts from multiple objects', () => {
      const amounts1: Balance.Amounts = {'.': '1000000', 'token1': '100'}
      const amounts2: Balance.Amounts = {'.': '2000000', 'token1': '50'}
      const result = sumAmounts([amounts1, amounts2])
      expect(result['.']).toBe('3000000')
      expect(result.token1).toBe('150')
    })

    it('should handle empty array', () => {
      const result = sumAmounts([])
      expect(result).toEqual({})
    })

    it('should handle single amount object', () => {
      const amounts: Balance.Amounts = {'.': '1000000'}
      const result = sumAmounts([amounts])
      expect(result).toEqual(amounts)
    })
  })

  describe('subtractAmounts', () => {
    it('should subtract amounts2 from amounts1', () => {
      const amounts1: Balance.Amounts = {'.': '3000000', 'token1': '150'}
      const amounts2: Balance.Amounts = {'.': '1000000', 'token1': '50'}
      const result = subtractAmounts(amounts1, amounts2)
      expect(result['.']).toBe('2000000')
      expect(result.token1).toBe('100')
    })

    it('should remove token when result is zero or negative', () => {
      const amounts1: Balance.Amounts = {'.': '1000000', 'token1': '50'}
      const amounts2: Balance.Amounts = {'.': '1000000', 'token1': '100'}
      const result = subtractAmounts(amounts1, amounts2)
      expect(result['.']).toBeUndefined()
      expect(result.token1).toBeUndefined()
    })

    it('should handle amounts2 with tokens not in amounts1', () => {
      const amounts1: Balance.Amounts = {'.': '1000000'}
      const amounts2: Balance.Amounts = {'.': '500000', 'token1': '100'}
      const result = subtractAmounts(amounts1, amounts2)
      expect(result['.']).toBe('500000')
      expect(result.token1).toBeUndefined()
    })
  })

  describe('hasEnoughAmounts', () => {
    it('should return true when amounts1 has enough', () => {
      const amounts1: Balance.Amounts = {'.': '3000000', 'token1': '150'}
      const amounts2: Balance.Amounts = {'.': '2000000', 'token1': '100'}
      expect(hasEnoughAmounts(amounts1, amounts2)).toBe(true)
    })

    it('should return false when amounts1 has insufficient ADA', () => {
      const amounts1: Balance.Amounts = {'.': '1000000'}
      const amounts2: Balance.Amounts = {'.': '2000000'}
      expect(hasEnoughAmounts(amounts1, amounts2)).toBe(false)
    })

    it('should return false when amounts1 has insufficient token', () => {
      const amounts1: Balance.Amounts = {'.': '3000000', 'token1': '50'}
      const amounts2: Balance.Amounts = {'.': '2000000', 'token1': '100'}
      expect(hasEnoughAmounts(amounts1, amounts2)).toBe(false)
    })

    it('should return true when amounts1 has exactly enough', () => {
      const amounts1: Balance.Amounts = {'.': '2000000'}
      const amounts2: Balance.Amounts = {'.': '2000000'}
      expect(hasEnoughAmounts(amounts1, amounts2)).toBe(true)
    })

    it('should handle empty amounts2', () => {
      const amounts1: Balance.Amounts = {'.': '1000000'}
      const amounts2: Balance.Amounts = {}
      expect(hasEnoughAmounts(amounts1, amounts2)).toBe(true)
    })
  })

  describe('getAdaAmount', () => {
    it('should get ADA amount from amounts', () => {
      const amounts: Balance.Amounts = {'.': '1000000', 'token1': '100'}
      const result = getAdaAmount(amounts)
      expect(result).toEqual(new BigNumber('1000000'))
    })

    it('should return zero when ADA not present', () => {
      const amounts: Balance.Amounts = {token1: '100'}
      const result = getAdaAmount(amounts)
      expect(result).toEqual(new BigNumber('0'))
    })

    it('should use custom primaryTokenId', () => {
      const amounts: Balance.Amounts = {custom: '5000000'}
      const result = getAdaAmount(amounts, 'custom')
      expect(result).toEqual(new BigNumber('5000000'))
    })
  })

  describe('getUtxoValue', () => {
    it('should get UTXO value in ADA', () => {
      const utxo = createMockUtxo({'.': '1000000', 'token1': '100'})
      const result = getUtxoValue(utxo)
      expect(result).toEqual(new BigNumber('1000000'))
    })

    it('should use custom primaryTokenId', () => {
      const utxo = createMockUtxo({custom: '5000000'})
      const result = getUtxoValue(utxo, 'custom')
      expect(result).toEqual(new BigNumber('5000000'))
    })
  })

  describe('utxoHasRelevantAssets', () => {
    it('should return true when UTXO has required asset', () => {
      const utxo = createMockUtxo({'.': '1000000', 'token1': '100'})
      const required: Balance.Amounts = {token1: '50'}
      expect(utxoHasRelevantAssets(utxo, required)).toBe(true)
    })

    it('should return true when UTXO has required ADA', () => {
      const utxo = createMockUtxo({'.': '1000000'})
      const required: Balance.Amounts = {'.': '500000'}
      expect(utxoHasRelevantAssets(utxo, required)).toBe(true)
    })

    it('should return false when UTXO does not have required asset', () => {
      const utxo = createMockUtxo({'.': '1000000', 'token1': '100'})
      const required: Balance.Amounts = {token2: '50'}
      expect(utxoHasRelevantAssets(utxo, required)).toBe(false)
    })

    it('should return false when required amounts is empty', () => {
      const utxo = createMockUtxo({'.': '1000000'})
      const required: Balance.Amounts = {}
      expect(utxoHasRelevantAssets(utxo, required)).toBe(false)
    })
  })

  describe('getTokenIds', () => {
    it('should get all token IDs except empty string', () => {
      const amounts: Balance.Amounts = {
        '.': '1000000',
        'token1': '100',
        'token2': '200',
      }
      const result = getTokenIds(amounts)
      expect(result).toEqual(['.', 'token1', 'token2'])
    })

    it('should filter out empty string', () => {
      const amounts: Balance.Amounts = {'': '100', 'token1': '100'}
      const result = getTokenIds(amounts)
      expect(result).toEqual(['token1'])
    })

    it('should return empty array for empty amounts', () => {
      const amounts: Balance.Amounts = {}
      const result = getTokenIds(amounts)
      expect(result).toEqual([])
    })
  })
})
