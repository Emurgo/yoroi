import {Balance} from '@yoroi/types'

import {ModernUtxo} from '../utxo/models'
import {largestFirst} from './largest-first'

describe('largestFirst', () => {
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

  it('should select largest UTXOs first', () => {
    const utxos = [
      createMockUtxo({'.': '1000000'}, 'hash1', 0),
      createMockUtxo({'.': '5000000'}, 'hash2', 1),
      createMockUtxo({'.': '2000000'}, 'hash3', 2),
    ]
    const required: Balance.Amounts = {'.': '3000000'}

    const result = largestFirst(required, utxos)

    expect(result.selected).toHaveLength(1)
    expect(result.selected[0]?.txHash).toBe('hash2') // Largest first
    expect(result.selectedAmounts['.']).toBe('5000000')
    expect(result.missingAmounts['.']).toBeUndefined()
  })

  it('should select multiple UTXOs when needed', () => {
    const utxos = [
      createMockUtxo({'.': '1000000'}, 'hash1', 0),
      createMockUtxo({'.': '2000000'}, 'hash2', 1),
      createMockUtxo({'.': '1500000'}, 'hash3', 2),
    ]
    const required: Balance.Amounts = {'.': '2500000'}

    const result = largestFirst(required, utxos)

    expect(result.selected.length).toBeGreaterThan(1)
    expect(hasEnoughAmounts(result.selectedAmounts, required)).toBe(true)
  })

  it('should respect maxUtxos option', () => {
    const utxos = [
      createMockUtxo({'.': '1000000'}, 'hash1', 0),
      createMockUtxo({'.': '2000000'}, 'hash2', 1),
      createMockUtxo({'.': '1500000'}, 'hash3', 2),
    ]
    const required: Balance.Amounts = {'.': '5000000'}

    const result = largestFirst(required, utxos, '.', {maxUtxos: 2})

    expect(result.selected.length).toBeLessThanOrEqual(2)
  })

  it('should calculate missing amounts when insufficient', () => {
    const utxos = [
      createMockUtxo({'.': '1000000'}, 'hash1', 0),
      createMockUtxo({'.': '2000000'}, 'hash2', 1),
    ]
    const required: Balance.Amounts = {'.': '5000000'}

    const result = largestFirst(required, utxos)

    expect(result.missingAmounts['.']).toBeDefined()
    expect(parseInt(result.missingAmounts['.'] || '0', 10)).toBeGreaterThan(0)
  })

  it('should handle empty UTXO list', () => {
    const utxos: ModernUtxo[] = []
    const required: Balance.Amounts = {'.': '1000000'}

    const result = largestFirst(required, utxos)

    expect(result.selected).toHaveLength(0)
    expect(result.missingAmounts['.']).toBe('1000000')
  })

  it('should handle multi-asset requirements', () => {
    const utxos = [
      createMockUtxo({'.': '5000000', 'token1': '100'}, 'hash1', 0),
      createMockUtxo({'.': '3000000', 'token2': '200'}, 'hash2', 1),
    ]
    const required: Balance.Amounts = {'.': '4000000', 'token1': '50'}

    const result = largestFirst(required, utxos)

    expect(result.selected.length).toBeGreaterThan(0)
    expect(hasEnoughAmounts(result.selectedAmounts, required)).toBe(true)
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
