import {Balance} from '@yoroi/types'

import {ModernUtxo} from '../utxo/models'
import {
  modernUtxoToCardanoAddressedUtxo,
  modernUtxosToCardanoAddressedUtxos,
} from './adapters'

describe('adapters', () => {
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

  describe('modernUtxoToCardanoAddressedUtxo', () => {
    it('should convert ModernUtxo to CardanoAddressedUtxo', () => {
      const utxo = createMockUtxo({'.': '1000000'}, 'hash1', 0)
      const result = modernUtxoToCardanoAddressedUtxo(utxo)

      expect(result.txHash).toBe('hash1')
      expect(result.txIndex).toBe(0)
      expect(result.receiver).toBe('addr_test1')
      expect(result.utxoId).toBe('hash1:0')
      expect(result.balance).toEqual({'.': '1000000'})
    })

    it('should use default addressing when not provided', () => {
      const utxo = createMockUtxo({'.': '1000000'})
      const result = modernUtxoToCardanoAddressedUtxo(utxo)

      expect(result.addressing).toEqual({
        path: [],
        startLevel: 0,
      })
    })

    it('should preserve addressing when provided', () => {
      const addressing = {path: [1852, 1815, 0, 0, 0], startLevel: 2}
      const utxo: ModernUtxo = {
        ...createMockUtxo({'.': '1000000'}),
        addressing,
      }
      const result = modernUtxoToCardanoAddressedUtxo(utxo)

      expect(result.addressing).toBe(addressing)
    })
  })

  describe('modernUtxosToCardanoAddressedUtxos', () => {
    it('should convert array of ModernUtxo', () => {
      const utxos = [
        createMockUtxo({'.': '1000000'}, 'hash1', 0),
        createMockUtxo({'.': '2000000'}, 'hash2', 1),
      ]
      const result = modernUtxosToCardanoAddressedUtxos(utxos)

      expect(result).toHaveLength(2)
      expect(result[0]?.utxoId).toBe('hash1:0')
      expect(result[1]?.utxoId).toBe('hash2:1')
    })

    it('should handle empty array', () => {
      const result = modernUtxosToCardanoAddressedUtxos([])
      expect(result).toEqual([])
    })
  })
})
