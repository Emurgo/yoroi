import type {RawUtxo} from '@yoroi/api'
import {
  Address,
  Balance,
  Portfolio,
  TokenId,
  TransactionHash,
  UtxoId,
} from '@yoroi/types'

import {
  didUtxosUpdate,
  getAddressedUtxos,
  getSpendableUtxos,
} from './utxo-operations'

describe('utxo-operations', () => {
  const mockRawUtxos: RawUtxo[] = [
    {
      utxo_id: 'tx1:0' as UtxoId,
      tx_hash: 'tx1' as TransactionHash,
      tx_index: 0,
      receiver: 'addr_test1...' as Address,
      amount: '1000000' as Balance.Quantity,
      assets: [],
    },
    {
      utxo_id: 'tx2:1' as UtxoId,
      tx_hash: 'tx2' as TransactionHash,
      tx_index: 1,
      receiver: 'addr_test1...' as Address,
      amount: '2000000' as Balance.Quantity,
      assets: [],
    },
  ]

  const mockWallet = {
    publicKeyHex: 'test-public-key-hex',
    accountVisual: 0,
    internalChain: {
      isMyAddress: jest.fn().mockReturnValue(false),
      getIndexOfAddress: jest.fn().mockReturnValue(0),
    },
    externalChain: {
      isMyAddress: jest.fn().mockReturnValue(true),
      getIndexOfAddress: jest.fn().mockReturnValue(0),
    },
    getAddressing: jest.fn().mockReturnValue({
      path: [1852, 1815, 0, 0, 0],
      startLevel: 2,
    }),
  }

  const primaryTokenId = 'ada' as TokenId as Portfolio.Token.Id

  describe('getAddressedUtxos', () => {
    it('should convert RawUtxos to ModernUtxos with addressing', () => {
      const modernUtxos = getAddressedUtxos(
        mockRawUtxos,
        mockWallet as any,
        primaryTokenId,
        'cardano-cip1852' as any,
      )

      expect(modernUtxos).toHaveLength(mockRawUtxos.length)
      expect(modernUtxos[0]).toHaveProperty('utxoId')
      expect(modernUtxos[0]).toHaveProperty('address')
    })
  })

  describe('didUtxosUpdate', () => {
    it('should return true when UTXOs length changes', () => {
      const newUtxos: RawUtxo[] = [
        ...mockRawUtxos,
        {...mockRawUtxos[0]!, utxo_id: 'tx3:0' as UtxoId},
      ]
      expect(didUtxosUpdate(mockRawUtxos, newUtxos)).toBe(true)
    })

    it('should return true when UTXO IDs change', () => {
      const newUtxos: RawUtxo[] = [
        {...mockRawUtxos[0]!, utxo_id: 'tx3:0' as UtxoId},
      ]
      expect(didUtxosUpdate(mockRawUtxos, newUtxos)).toBe(true)
    })

    it('should return false when UTXOs are unchanged', () => {
      expect(didUtxosUpdate(mockRawUtxos, mockRawUtxos)).toBe(false)
    })
  })

  describe('getSpendableUtxos', () => {
    it('should filter out collateral UTXO', () => {
      const collateralId = 'tx1:0' as UtxoId
      const spendable = getSpendableUtxos(mockRawUtxos, collateralId)

      expect(spendable).toHaveLength(1)
      expect(spendable[0]?.utxo_id).toBe('tx2:1')
    })

    it('should return all UTXOs when no collateral', () => {
      const spendable = getSpendableUtxos(mockRawUtxos, '' as UtxoId)
      expect(spendable).toHaveLength(mockRawUtxos.length)
    })
  })
})
