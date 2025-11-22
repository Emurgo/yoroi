import {Balance} from '@yoroi/types'

import {ModernUtxo} from '../utxo/models'
import {largestFirstMultiAsset} from './multi-asset'

describe('largestFirstMultiAsset', () => {
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

  it('should prioritize UTXOs with required assets', () => {
    const utxos = [
      createMockUtxo({'.': '1000000'}, 'hash1', 0),
      createMockUtxo({'.': '2000000', 'token1': '100'}, 'hash2', 1),
      createMockUtxo({'.': '5000000'}, 'hash3', 2),
    ]
    const required: Balance.Amounts = {'.': '1000000', 'token1': '50'}

    const result = largestFirstMultiAsset(required, utxos)

    expect(result.selected.some((u) => u.txHash === 'hash2')).toBe(true)
    expect(hasEnoughAmounts(result.selectedAmounts, required)).toBe(true)
  })

  it('should sort relevant UTXOs by value', () => {
    const utxos = [
      createMockUtxo({'.': '1000000', 'token1': '50'}, 'hash1', 0),
      createMockUtxo({'.': '5000000', 'token1': '100'}, 'hash2', 1),
      createMockUtxo({'.': '2000000', 'token1': '75'}, 'hash3', 2),
    ]
    const required: Balance.Amounts = {'.': '3000000', 'token1': '100'}

    const result = largestFirstMultiAsset(required, utxos)

    // Should select hash2 first (largest value with token1)
    expect(result.selected[0]?.txHash).toBe('hash2')
  })

  it('should fill remaining requirements with largest first', () => {
    const utxos = [
      createMockUtxo({'.': '1000000', 'token1': '50'}, 'hash1', 0),
      createMockUtxo({'.': '5000000'}, 'hash2', 1),
      createMockUtxo({'.': '2000000'}, 'hash3', 2),
    ]
    const required: Balance.Amounts = {'.': '3000000', 'token1': '50'}

    const result = largestFirstMultiAsset(required, utxos)

    // Should select hash1 (has token1) and hash2 (largest for remaining ADA)
    expect(result.selected.some((u) => u.txHash === 'hash1')).toBe(true)
    expect(result.selected.some((u) => u.txHash === 'hash2')).toBe(true)
    expect(hasEnoughAmounts(result.selectedAmounts, required)).toBe(true)
  })

  it('should handle ADA-only requirements', () => {
    const utxos = [
      createMockUtxo({'.': '1000000'}, 'hash1', 0),
      createMockUtxo({'.': '5000000'}, 'hash2', 1),
      createMockUtxo({'.': '2000000'}, 'hash3', 2),
    ]
    const required: Balance.Amounts = {'.': '3000000'}

    const result = largestFirstMultiAsset(required, utxos)

    // Should use largest first when no assets required
    expect(result.selected.length).toBeGreaterThan(0)
    expect(result.selected[0]?.txHash).toBe('hash2')
  })

  it('should respect maxUtxos option', () => {
    const utxos = [
      createMockUtxo({'.': '1000000', 'token1': '100'}, 'hash1', 0),
      createMockUtxo({'.': '2000000', 'token1': '50'}, 'hash2', 1),
      createMockUtxo({'.': '1500000'}, 'hash3', 2),
    ]
    const required: Balance.Amounts = {'.': '5000000', 'token1': '150'}

    const result = largestFirstMultiAsset(required, utxos, '.', {maxUtxos: 2})

    expect(result.selected.length).toBeLessThanOrEqual(2)
  })

  it('should stop when requirements are met', () => {
    const utxos = [
      createMockUtxo({'.': '1000000', 'token1': '100'}, 'hash1', 0),
      createMockUtxo({'.': '2000000'}, 'hash2', 1),
      createMockUtxo({'.': '5000000'}, 'hash3', 2),
    ]
    const required: Balance.Amounts = {'.': '1000000', 'token1': '50'}

    const result = largestFirstMultiAsset(required, utxos)

    // Should have enough amounts
    expect(hasEnoughAmounts(result.selectedAmounts, required)).toBe(true)
    // Should include hash1 (has token1)
    expect(result.selected.some((u) => u.txHash === 'hash1')).toBe(true)
  })

  it('should calculate missing amounts when insufficient', () => {
    const utxos = [
      createMockUtxo({'.': '1000000'}, 'hash1', 0),
      createMockUtxo({'.': '2000000'}, 'hash2', 1),
    ]
    const required: Balance.Amounts = {'.': '5000000'}

    const result = largestFirstMultiAsset(required, utxos)

    expect(result.missingAmounts['.']).toBeDefined()
    expect(parseInt(result.missingAmounts['.'] || '0', 10)).toBeGreaterThan(0)
  })

  it('should handle empty UTXO list', () => {
    const utxos: ModernUtxo[] = []
    const required: Balance.Amounts = {'.': '1000000', 'token1': '50'}

    const result = largestFirstMultiAsset(required, utxos)

    expect(result.selected).toHaveLength(0)
    expect(result.missingAmounts['.']).toBe('1000000')
  })
})

function hasEnoughAmounts(
  amounts1: Balance.Amounts,
  amounts2: Balance.Amounts,
): boolean {
  for (const [tokenId, requiredQuantity] of Object.entries(amounts2)) {
    const available = amounts1[tokenId] || '0'
    if (parseInt(available, 10) < parseInt(requiredQuantity, 10)) {
      return false
    }
  }
  return true
}
