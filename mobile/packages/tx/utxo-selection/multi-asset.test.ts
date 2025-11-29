import {primaryTokenId} from '@yoroi/portfolio'
import {Address, Balance, TokenId, TransactionHash} from '@yoroi/types'

import {ModernUtxo} from '../utxo/models'
import {largestFirstMultiAsset} from './multi-asset'

describe('largestFirstMultiAsset', () => {
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

  it('should prioritize UTXOs with required assets', () => {
    const token1 = 'token1' as TokenId
    const utxos = [
      createMockUtxo(
        {[primaryTokenId]: '1000000' as Balance.Quantity},
        'hash1',
        0,
      ),
      createMockUtxo(
        {[primaryTokenId]: '2000000', [token1]: '100'} as Balance.Amounts,
        'hash2',
        1,
      ),
      createMockUtxo(
        {[primaryTokenId]: '5000000' as Balance.Quantity},
        'hash3',
        2,
      ),
    ]
    const required: Balance.Amounts = {
      [primaryTokenId]: '1000000',
      [token1]: '50',
    } as Balance.Amounts

    const result = largestFirstMultiAsset(required, utxos)

    expect(result.selected.some((u) => u.txHash === 'hash2')).toBe(true)
    expect(hasEnoughAmounts(result.selectedAmounts, required)).toBe(true)
  })

  it('should sort relevant UTXOs by value', () => {
    const token1 = 'token1' as TokenId
    const utxos = [
      createMockUtxo(
        {[primaryTokenId]: '1000000', [token1]: '50'} as Balance.Amounts,
        'hash1',
        0,
      ),
      createMockUtxo(
        {[primaryTokenId]: '5000000', [token1]: '100'} as Balance.Amounts,
        'hash2',
        1,
      ),
      createMockUtxo(
        {[primaryTokenId]: '2000000', [token1]: '75'} as Balance.Amounts,
        'hash3',
        2,
      ),
    ]
    const required: Balance.Amounts = {
      [primaryTokenId]: '3000000',
      [token1]: '100',
    } as Balance.Amounts

    const result = largestFirstMultiAsset(required, utxos)

    // Should select hash2 first (largest value with token1)
    expect(result.selected[0]?.txHash).toBe('hash2')
  })

  it('should fill remaining requirements with largest first', () => {
    const token1 = 'token1' as TokenId
    const utxos = [
      createMockUtxo(
        {[primaryTokenId]: '1000000', [token1]: '50'} as Balance.Amounts,
        'hash1',
        0,
      ),
      createMockUtxo(
        {[primaryTokenId]: '5000000' as Balance.Quantity},
        'hash2',
        1,
      ),
      createMockUtxo(
        {[primaryTokenId]: '2000000' as Balance.Quantity},
        'hash3',
        2,
      ),
    ]
    const required: Balance.Amounts = {
      [primaryTokenId]: '3000000',
      [token1]: '50',
    } as Balance.Amounts

    const result = largestFirstMultiAsset(required, utxos)

    // Should select hash1 (has token1) and hash2 (largest for remaining ADA)
    expect(result.selected.some((u) => u.txHash === 'hash1')).toBe(true)
    expect(result.selected.some((u) => u.txHash === 'hash2')).toBe(true)
    expect(hasEnoughAmounts(result.selectedAmounts, required)).toBe(true)
  })

  it('should handle ADA-only requirements', () => {
    const utxos = [
      createMockUtxo(
        {[primaryTokenId]: '1000000' as Balance.Quantity},
        'hash1',
        0,
      ),
      createMockUtxo(
        {[primaryTokenId]: '5000000' as Balance.Quantity},
        'hash2',
        1,
      ),
      createMockUtxo(
        {[primaryTokenId]: '2000000' as Balance.Quantity},
        'hash3',
        2,
      ),
    ]
    const required: Balance.Amounts = {
      [primaryTokenId]: '3000000' as Balance.Quantity,
    }

    const result = largestFirstMultiAsset(required, utxos)

    // Should use largest first when no assets required
    expect(result.selected.length).toBeGreaterThan(0)
    expect(result.selected[0]?.txHash).toBe('hash2')
  })

  it('should respect maxUtxos option', () => {
    const token1 = 'token1' as TokenId
    const utxos = [
      createMockUtxo(
        {[primaryTokenId]: '1000000', [token1]: '100'} as Balance.Amounts,
        'hash1',
        0,
      ),
      createMockUtxo(
        {[primaryTokenId]: '2000000', [token1]: '50'} as Balance.Amounts,
        'hash2',
        1,
      ),
      createMockUtxo(
        {[primaryTokenId]: '1500000' as Balance.Quantity},
        'hash3',
        2,
      ),
    ]
    const required: Balance.Amounts = {
      [primaryTokenId]: '5000000',
      [token1]: '150',
    } as Balance.Amounts

    const result = largestFirstMultiAsset(required, utxos, primaryTokenId, {
      maxUtxos: 2,
    })

    expect(result.selected.length).toBeLessThanOrEqual(2)
  })

  it('should stop when requirements are met', () => {
    const token1 = 'token1' as TokenId
    const utxos = [
      createMockUtxo(
        {[primaryTokenId]: '1000000', [token1]: '100'} as Balance.Amounts,
        'hash1',
        0,
      ),
      createMockUtxo(
        {[primaryTokenId]: '2000000' as Balance.Quantity},
        'hash2',
        1,
      ),
      createMockUtxo(
        {[primaryTokenId]: '5000000' as Balance.Quantity},
        'hash3',
        2,
      ),
    ]
    const required: Balance.Amounts = {
      [primaryTokenId]: '1000000',
      [token1]: '50',
    } as Balance.Amounts

    const result = largestFirstMultiAsset(required, utxos)

    // Should have enough amounts
    expect(hasEnoughAmounts(result.selectedAmounts, required)).toBe(true)
    // Should include hash1 (has token1)
    expect(result.selected.some((u) => u.txHash === 'hash1')).toBe(true)
  })

  it('should calculate missing amounts when insufficient', () => {
    const utxos = [
      createMockUtxo(
        {[primaryTokenId]: '1000000' as Balance.Quantity},
        'hash1',
        0,
      ),
      createMockUtxo(
        {[primaryTokenId]: '2000000' as Balance.Quantity},
        'hash2',
        1,
      ),
    ]
    const required: Balance.Amounts = {
      [primaryTokenId]: '5000000' as Balance.Quantity,
    }

    const result = largestFirstMultiAsset(required, utxos)
    const primaryTokenIdStr = primaryTokenId as string

    expect(result.missingAmounts[primaryTokenIdStr as TokenId]).toBeDefined()
    expect(
      parseInt(result.missingAmounts[primaryTokenIdStr as TokenId] || '0', 10),
    ).toBeGreaterThan(0)
  })

  it('should handle empty UTXO list', () => {
    const token1 = 'token1' as TokenId
    const utxos: ModernUtxo[] = []
    const required: Balance.Amounts = {
      [primaryTokenId]: '1000000',
      [token1]: '50',
    } as Balance.Amounts

    const result = largestFirstMultiAsset(required, utxos)
    const primaryTokenIdStr = primaryTokenId as string

    expect(result.selected).toHaveLength(0)
    expect(result.missingAmounts[primaryTokenIdStr as TokenId]).toBe('1000000')
  })
})

function hasEnoughAmounts(
  amounts1: Balance.Amounts,
  amounts2: Balance.Amounts,
): boolean {
  for (const [tokenId, requiredQuantity] of Object.entries(amounts2)) {
    const available = amounts1[tokenId as TokenId] || '0'
    if (parseInt(available, 10) < parseInt(requiredQuantity, 10)) {
      return false
    }
  }
  return true
}
