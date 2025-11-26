import {Balance} from '@yoroi/types'

import {ModernUtxo} from '../utxo/models'
import {selectUtxos} from './selection'

describe('selectUtxos', () => {
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

  it('should use largestFirst strategy by default', () => {
    const utxos = [
      createMockUtxo({'.': '1000000'}, 'hash1', 0),
      createMockUtxo({'.': '5000000'}, 'hash2', 1),
      createMockUtxo({'.': '2000000'}, 'hash3', 2),
    ]
    const required: Balance.Amounts = {'.': '3000000'}

    const result = selectUtxos(required, utxos)

    expect(result.selected.length).toBeGreaterThan(0)
    expect(result.selected[0]?.txHash).toBe('hash2') // Largest first
  })

  it('should use largestFirst strategy when specified', () => {
    const utxos = [
      createMockUtxo({'.': '1000000'}, 'hash1', 0),
      createMockUtxo({'.': '5000000'}, 'hash2', 1),
    ]
    const required: Balance.Amounts = {'.': '3000000'}

    const result = selectUtxos(required, utxos, 'largestFirst')

    expect(result.selected.length).toBeGreaterThan(0)
    expect(result.selected[0]?.txHash).toBe('hash2')
  })

  it('should use keepRelevant strategy when specified', () => {
    const utxos = [
      createMockUtxo({'.': '1000000'}, 'hash1', 0),
      createMockUtxo({'.': '2000000', 'token1': '100'}, 'hash2', 1),
      createMockUtxo({'.': '5000000'}, 'hash3', 2),
    ]
    const required: Balance.Amounts = {'.': '1000000', 'token1': '50'}

    const result = selectUtxos(required, utxos, 'keepRelevant')

    expect(result.selected.some((u) => u.txHash === 'hash2')).toBe(true)
  })

  it('should use largestFirstMultiAsset strategy when specified', () => {
    const utxos = [
      createMockUtxo({'.': '1000000'}, 'hash1', 0),
      createMockUtxo({'.': '2000000', 'token1': '100'}, 'hash2', 1),
      createMockUtxo({'.': '5000000'}, 'hash3', 2),
    ]
    const required: Balance.Amounts = {'.': '1000000', 'token1': '50'}

    const result = selectUtxos(required, utxos, 'largestFirstMultiAsset')

    expect(result.selected.length).toBeGreaterThan(0)
    expect(hasEnoughAmounts(result.selectedAmounts, required)).toBe(true)
  })

  it('should pass options to strategy', () => {
    const utxos = [
      createMockUtxo({'.': '1000000'}, 'hash1', 0),
      createMockUtxo({'.': '2000000'}, 'hash2', 1),
      createMockUtxo({'.': '3000000'}, 'hash3', 2),
    ]
    const required: Balance.Amounts = {'.': '10000000'}

    const result = selectUtxos(required, utxos, 'largestFirst', '.', {
      maxUtxos: 2,
    })

    expect(result.selected.length).toBeLessThanOrEqual(2)
  })

  it('should use custom primaryTokenId', () => {
    const utxos = [
      createMockUtxo({custom: '1000000'}, 'hash1', 0),
      createMockUtxo({custom: '5000000'}, 'hash2', 1),
    ]
    const required: Balance.Amounts = {custom: '3000000'}

    const result = selectUtxos(required, utxos, 'largestFirst', 'custom')

    expect(result.selected.length).toBeGreaterThan(0)
  })

  it('should handle unknown strategy by defaulting to largestFirst', () => {
    const utxos = [
      createMockUtxo({'.': '1000000'}, 'hash1', 0),
      createMockUtxo({'.': '5000000'}, 'hash2', 1),
    ]
    const required: Balance.Amounts = {'.': '3000000'}

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
    const available = amounts1[tokenId] || '0'
    if (parseInt(available, 10) < parseInt(requiredQuantity, 10)) {
      return false
    }
  }
  return true
}
