import {BalanceQuantity, Portfolio, TokenId} from '@yoroi/types'

import {rawUtxoToModernUtxo} from './utxo'
import type {RawUtxo} from './utxo'

describe('utxo utils', () => {
  describe('rawUtxoToModernUtxo', () => {
    it('should convert RawUtxo to ModernUtxo', () => {
      const rawUtxo: RawUtxo = {
        amount: '1000000' as BalanceQuantity,
        receiver: 'addr_test1',
        tx_hash: 'hash1',
        tx_index: 0,
        utxo_id: 'hash1:0',
        assets: [],
      }

      const result = rawUtxoToModernUtxo(rawUtxo)
      const emptyTokenId = '' as TokenId

      expect(result.receiver).toBe('addr_test1')
      expect(result.txHash).toBe('hash1')
      expect(result.txIndex).toBe(0)
      expect(result.balance[emptyTokenId]).toBe('1000000')
    })

    it('should include assets in balance', () => {
      const tokenId = 'policy1.asset1' as TokenId
      const rawUtxo: RawUtxo = {
        amount: '1000000' as BalanceQuantity,
        receiver: 'addr_test1',
        tx_hash: 'hash1',
        tx_index: 0,
        utxo_id: 'hash1:0',
        assets: [
          {
            amount: '100' as BalanceQuantity,
            tokenId: tokenId as Portfolio.Token.Id,
            policyId: 'policy1',
            name: 'asset1',
          },
        ],
      }

      const result = rawUtxoToModernUtxo(rawUtxo)

      expect(result.balance[tokenId]).toBe('100')
    })

    it('should use custom primaryTokenId', () => {
      const primaryTokenId = '.' as TokenId
      const rawUtxo: RawUtxo = {
        amount: '1000000' as BalanceQuantity,
        receiver: 'addr_test1',
        tx_hash: 'hash1',
        tx_index: 0,
        utxo_id: 'hash1:0',
        assets: [],
      }

      const result = rawUtxoToModernUtxo(rawUtxo, undefined, undefined, '.')

      expect(result.balance[primaryTokenId]).toBe('1000000')
    })

    it('should include addressing when provided', () => {
      const rawUtxo: RawUtxo = {
        amount: '1000000' as BalanceQuantity,
        receiver: 'addr_test1',
        tx_hash: 'hash1',
        tx_index: 0,
        utxo_id: 'hash1:0',
        assets: [],
      }
      const addressing = {path: [1852, 1815, 0, 0, 0], startLevel: 2}

      const result = rawUtxoToModernUtxo(rawUtxo, addressing)

      expect(result.addressing).toBe(addressing)
    })

    it('should include derivationPath when provided', () => {
      const rawUtxo: RawUtxo = {
        amount: '1000000' as BalanceQuantity,
        receiver: 'addr_test1',
        tx_hash: 'hash1',
        tx_index: 0,
        utxo_id: 'hash1:0',
        assets: [],
      }

      const result = rawUtxoToModernUtxo(
        rawUtxo,
        undefined,
        "m/1852'/1815'/0'/0/0",
      )

      expect(result.derivationPath).toBe("m/1852'/1815'/0'/0/0")
    })

    it('should handle zero amount', () => {
      const rawUtxo: RawUtxo = {
        amount: '0' as BalanceQuantity,
        receiver: 'addr_test1',
        tx_hash: 'hash1',
        tx_index: 0,
        utxo_id: 'hash1:0',
        assets: [],
      }

      const result = rawUtxoToModernUtxo(rawUtxo)
      const emptyTokenId = '' as TokenId

      expect(result.balance[emptyTokenId]).toBeUndefined()
    })

    it('should throw when trying to serialize without CSL', () => {
      const rawUtxo: RawUtxo = {
        amount: '1000000' as BalanceQuantity,
        receiver: 'addr_test1',
        tx_hash: 'hash1',
        tx_index: 0,
        utxo_id: 'hash1:0',
        assets: [],
      }

      const result = rawUtxoToModernUtxo(rawUtxo)

      expect(() => result.toTransactionUnspentOutputHex()).toThrow(
        'requires WASM instance',
      )
    })
  })
})
