import {primaryTokenId} from '@yoroi/portfolio'
import {Address, Balance, TokenId, TransactionHash} from '@yoroi/types'

import {ModernUtxo} from '../utxo/models'
import {selectUtxos} from './selection'

describe('selectUtxos', () => {
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

  it('should use largestFirst strategy by default', () => {
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

    const result = selectUtxos(required, utxos)

    expect(result.selected.length).toBeGreaterThan(0)
    expect(result.selected[0]?.txHash).toBe('hash2') // Largest first
  })

  it('should use largestFirst strategy when specified', () => {
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
    ]
    const required: Balance.Amounts = {
      [primaryTokenId]: '3000000' as Balance.Quantity,
    }

    const result = selectUtxos(required, utxos, 'largestFirst')

    expect(result.selected.length).toBeGreaterThan(0)
    expect(result.selected[0]?.txHash).toBe('hash2')
  })

  it('should use keepRelevant strategy when specified', () => {
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

    const result = selectUtxos(required, utxos, 'keepRelevant')

    expect(result.selected.some((u) => u.txHash === 'hash2')).toBe(true)
  })

  it('should use largestFirstMultiAsset strategy when specified', () => {
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

    const result = selectUtxos(required, utxos, 'largestFirstMultiAsset')

    expect(result.selected.length).toBeGreaterThan(0)
    expect(hasEnoughAmounts(result.selectedAmounts, required)).toBe(true)
  })

  it('should pass options to strategy', () => {
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
        {[primaryTokenId]: '3000000' as Balance.Quantity},
        'hash3',
        2,
      ),
    ]
    const required: Balance.Amounts = {
      [primaryTokenId]: '10000000' as Balance.Quantity,
    }

    const result = selectUtxos(
      required,
      utxos,
      'largestFirst',
      primaryTokenId,
      {
        maxUtxos: 2,
      },
    )

    expect(result.selected.length).toBeLessThanOrEqual(2)
  })

  it('should use custom primaryTokenId', () => {
    const customTokenId = 'custom' as TokenId
    const utxos = [
      createMockUtxo(
        {[customTokenId]: '1000000'} as Balance.Amounts,
        'hash1',
        0,
      ),
      createMockUtxo(
        {[customTokenId]: '5000000'} as Balance.Amounts,
        'hash2',
        1,
      ),
    ]
    const required: Balance.Amounts = {
      [customTokenId]: '3000000',
    } as Balance.Amounts

    const result = selectUtxos(required, utxos, 'largestFirst', customTokenId)

    expect(result.selected.length).toBeGreaterThan(0)
  })

  it('should handle unknown strategy by defaulting to largestFirst', () => {
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
    ]
    const required: Balance.Amounts = {
      [primaryTokenId]: '3000000' as Balance.Quantity,
    }

    // TypeScript won't allow this, but runtime might
    const result = selectUtxos(required, utxos, 'unknown' as any)

    expect(result.selected.length).toBeGreaterThan(0)
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
