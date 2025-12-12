import {primaryTokenId} from '@yoroi/portfolio'
import {Address, Balance, TokenId, TransactionHash} from '@yoroi/types'

import {ModernUtxo} from '../utxo/models'
import {largestFirst} from './largest-first'

describe('largestFirst', () => {
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

  it('should select largest UTXOs first', () => {
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

    const result = largestFirst(required, utxos)
    const primaryTokenIdStr = primaryTokenId as string

    expect(result.selected).toHaveLength(1)
    expect(result.selected[0]?.txHash).toBe('hash2') // Largest first
    expect(result.selectedAmounts[primaryTokenIdStr as TokenId]).toBe('5000000')
    expect(result.missingAmounts[primaryTokenIdStr as TokenId]).toBeUndefined()
  })

  it('should select multiple UTXOs when needed', () => {
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
      createMockUtxo(
        {[primaryTokenId]: '1500000' as Balance.Quantity},
        'hash3',
        2,
      ),
    ]
    const required: Balance.Amounts = {
      [primaryTokenId]: '2500000' as Balance.Quantity,
    }

    const result = largestFirst(required, utxos)

    expect(result.selected.length).toBeGreaterThan(1)
    expect(hasEnoughAmounts(result.selectedAmounts, required)).toBe(true)
  })

  it('should respect maxUtxos option', () => {
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
      createMockUtxo(
        {[primaryTokenId]: '1500000' as Balance.Quantity},
        'hash3',
        2,
      ),
    ]
    const required: Balance.Amounts = {
      [primaryTokenId]: '5000000' as Balance.Quantity,
    }

    const result = largestFirst(required, utxos, primaryTokenId, {maxUtxos: 2})

    expect(result.selected.length).toBeLessThanOrEqual(2)
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

    const result = largestFirst(required, utxos)
    const primaryTokenIdStr = primaryTokenId as string

    expect(result.missingAmounts[primaryTokenIdStr as TokenId]).toBeDefined()
    expect(
      parseInt(result.missingAmounts[primaryTokenIdStr as TokenId] || '0', 10),
    ).toBeGreaterThan(0)
  })

  it('should handle empty UTXO list', () => {
    const utxos: ModernUtxo[] = []
    const required: Balance.Amounts = {
      [primaryTokenId]: '1000000' as Balance.Quantity,
    }

    const result = largestFirst(required, utxos)
    const primaryTokenIdStr = primaryTokenId as string

    expect(result.selected).toHaveLength(0)
    expect(result.missingAmounts[primaryTokenIdStr as TokenId]).toBe('1000000')
  })

  it('should handle multi-asset requirements', () => {
    const token1 = 'token1' as TokenId
    const token2 = 'token2' as TokenId
    const utxos = [
      createMockUtxo(
        {[primaryTokenId]: '5000000', [token1]: '100'} as Balance.Amounts,
        'hash1',
        0,
      ),
      createMockUtxo(
        {[primaryTokenId]: '3000000', [token2]: '200'} as Balance.Amounts,
        'hash2',
        1,
      ),
    ]
    const required: Balance.Amounts = {
      [primaryTokenId]: '4000000',
      [token1]: '50',
    } as Balance.Amounts

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
    const available = amounts1[tokenId as TokenId] || '0'
    if (parseInt(available, 10) < parseInt(requiredQuantity, 10)) {
      return false
    }
  }
  return true
}
