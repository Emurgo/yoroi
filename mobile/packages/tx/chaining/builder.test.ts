import {primaryTokenId} from '@yoroi/portfolio'
import {Balance, TransactionHash} from '@yoroi/types'

import {createTransactionBuilder} from '../transaction-builder/builder'
import type {UnsignedTransaction} from '../transaction-builder/types'
import {
  addChainedInput,
  buildTransactionChain,
  createChainedTransaction,
} from './builder'
import type {ChainedTransaction, ChainedTransactionRef} from './types'

describe('chaining builder', () => {
  describe('addChainedInput', () => {
    it('should add chained input to state', () => {
      const state = createTransactionBuilder()
      const chainedRef: ChainedTransactionRef = {
        txHash: 'hash1' as TransactionHash,
        txIndex: 0,
      }
      const outputAmounts: Balance.Amounts = {
        [primaryTokenId]: '1000000' as Balance.Quantity,
      }

      const newState = addChainedInput(state, chainedRef, outputAmounts)

      expect(newState.inputs).toHaveLength(1)
      expect(newState.inputs[0]?.utxo.txHash).toBe('hash1')
      expect(newState.inputs[0]?.utxo.txIndex).toBe(0)
      expect(newState.inputs[0]?.utxo.balance).toEqual(outputAmounts)
    })

    it('should throw when trying to serialize chained UTXO', () => {
      const state = createTransactionBuilder()
      const chainedRef: ChainedTransactionRef = {
        txHash: 'hash1' as TransactionHash,
        txIndex: 0,
      }
      const outputAmounts: Balance.Amounts = {
        [primaryTokenId]: '1000000' as Balance.Quantity,
      }

      const newState = addChainedInput(state, chainedRef, outputAmounts)
      const chainedUtxo = newState.inputs[0]?.utxo
      if (!chainedUtxo) throw new Error('Input not found')

      expect(() => chainedUtxo.toTransactionUnspentOutputHex()).toThrow(
        'Cannot serialize chained UTXO',
      )
      expect(() => chainedUtxo.toTransactionUnspentOutput({} as any)).toThrow(
        'Cannot convert chained UTXO',
      )
    })
  })

  describe('createChainedTransaction', () => {
    it('should create chained transaction', () => {
      const unsignedTx = {
        cbor: 'cbor123',
        options: {},
      } as UnsignedTransaction
      const result = createChainedTransaction(
        unsignedTx,
        'tx_id_1',
        'tx_id_0',
        1,
      )

      expect(result.transaction).toBe(unsignedTx)
      expect(result.transactionId).toBe('tx_id_1')
      expect(result.dependsOn).toBe('tx_id_0')
      expect(result.chainIndex).toBe(1)
    })

    it('should create chained transaction without dependency', () => {
      const unsignedTx = {
        cbor: 'cbor123',
        options: {},
      } as UnsignedTransaction
      const result = createChainedTransaction(
        unsignedTx,
        'tx_id_1',
        undefined,
        0,
      )

      expect(result.dependsOn).toBeUndefined()
      expect(result.chainIndex).toBe(0)
    })
  })

  describe('buildTransactionChain', () => {
    it('should build transaction chain with total fees', () => {
      const transactions: ChainedTransaction[] = [
        {
          transaction: {
            cbor: 'cbor1',
            options: {
              manualFee: {[primaryTokenId]: '1000000' as Balance.Quantity},
            },
            inputs: [],
            outputs: [],
            certificates: [],
            withdrawals: [],
            metadata: [],
          } as unknown as UnsignedTransaction,
          transactionId: 'tx1',
          chainIndex: 0,
        },
        {
          transaction: {
            cbor: 'cbor2',
            options: {
              manualFee: {[primaryTokenId]: '2000000' as Balance.Quantity},
            },
            inputs: [],
            outputs: [],
            certificates: [],
            withdrawals: [],
            metadata: [],
          } as unknown as UnsignedTransaction,
          transactionId: 'tx2',
          chainIndex: 1,
        },
      ]

      const result = buildTransactionChain(transactions)

      expect(result.transactions).toBe(transactions)
      expect(result.totalFees).toBe('3000000')
    })

    it('should handle transactions without fees', () => {
      const transactions: ChainedTransaction[] = [
        {
          transaction: {
            cbor: 'cbor1',
            options: {},
          } as UnsignedTransaction,
          transactionId: 'tx1',
          chainIndex: 0,
        },
      ]

      const result = buildTransactionChain(transactions)

      expect(result.totalFees).toBe('0')
    })

    it('should handle empty chain', () => {
      const result = buildTransactionChain([])

      expect(result.transactions).toEqual([])
      expect(result.totalFees).toBe('0')
    })
  })
})
