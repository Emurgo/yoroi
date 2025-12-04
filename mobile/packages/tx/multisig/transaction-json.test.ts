/**
 * Unit tests for multisig transaction JSON utilities
 */
import {Bip32PublicKeyHex, Chain} from '@yoroi/types'

import {
  type MultisigTransactionJSON,
  constructMultisigTransactionJSON,
  parseMultisigTransactionJSON,
} from './transaction-json'

describe('transaction-json', () => {
  const mockCborHex = 'mockTransactionCborHex' as TransactionCbor
  const mockChainId = Chain.Network.Preprod
  const mockCreatedBy = 'acct_shared_xvk1z8kc04y...' as Bip32PublicKeyHex
  const mockSigners = [
    {
      keyHash: 'keyHash1' as Wallet.KeyHash,
      signed: false,
    },
    {
      keyHash: 'keyHash2' as Wallet.KeyHash,
      signed: true,
    },
  ]

  describe('constructMultisigTransactionJSON', () => {
    it('should construct valid transaction JSON', () => {
      const result = constructMultisigTransactionJSON({
        cborHex: mockCborHex,
        chainId: mockChainId,
        createdBy: mockCreatedBy,
        signers: mockSigners,
      })

      expect(result).toBeDefined()
      expect(result.version).toBeDefined()
      expect(result.metadata).toBeDefined()
      expect(result.metadata.createdBy).toBe(mockCreatedBy)
      expect(result.metadata.chainId).toBe(mockChainId)
      expect(result.transaction).toBeDefined()
      expect(result.transaction.cborHex).toBe(mockCborHex)
    })

    it('should include optional note if provided', () => {
      const note = 'Test transaction note'
      const result = constructMultisigTransactionJSON({
        cborHex: mockCborHex,
        chainId: mockChainId,
        createdBy: mockCreatedBy,
        signers: mockSigners,
        note,
      })

      expect(result.metadata.note).toBe(note)
    })
  })

  describe('parseMultisigTransactionJSON', () => {
    it('should parse valid transaction JSON', () => {
      const json: MultisigTransactionJSON = {
        version: '1.0.0',
        metadata: {
          createdAt: new Date().toISOString(),
          createdBy: mockCreatedBy,
          chainId: mockChainId,
        },
        transaction: {
          cborHex: mockCborHex,
        },
      }

      const result = parseMultisigTransactionJSON(JSON.stringify(json))
      expect(result).toBeDefined()
      expect(result.transaction.cborHex).toBe(mockCborHex)
      expect(result.metadata.createdBy).toBe(mockCreatedBy)
    })

    it('should throw error for invalid JSON', () => {
      expect(() => {
        parseMultisigTransactionJSON('invalid json')
      }).toThrow()
    })

    it('should throw error for missing required fields', () => {
      const invalidJson = {
        version: '1.0.0',
        // Missing metadata and transaction
      }

      expect(() => {
        parseMultisigTransactionJSON(JSON.stringify(invalidJson))
      }).toThrow()
    })
  })
})
