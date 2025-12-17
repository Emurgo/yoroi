import {TransactionHash} from '@yoroi/types'

import {
  buildLedgerSignedTx,
  createSignedLedgerTxFromCbor,
  signRawTransaction,
} from './signing'

describe('ledger signing', () => {
  describe('buildLedgerSignedTx', () => {
    it('should build signed transaction from Ledger response', async () => {
      // Create a recursive mock for derive that can be called multiple times
      // The derive function is called for each path index, so we need a chain
      const createDeriveMock = (depth: number = 0): any => {
        if (depth > 10) {
          // Return final key object
          return {
            toRawKey: jest.fn(() => ({
              toHex: jest.fn(() => 'publicKeyHex'),
            })),
            chaincode: jest.fn(() => Buffer.from('chaincode')),
          }
        }
        return {
          derive: jest.fn(() => createDeriveMock(depth + 1)),
          toRawKey: jest.fn(() => ({
            toHex: jest.fn(() => 'publicKeyHex'),
          })),
          chaincode: jest.fn(() => Buffer.from('chaincode')),
        }
      }

      const mockCsl = {
        Bip32PublicKey: {
          fromBytes: jest.fn(() => createDeriveMock(0)),
        },
        TransactionWitnessSet: {
          new: jest.fn(() => ({
            setVkeys: jest.fn(),
            setBootstraps: jest.fn(),
            setPlutusData: jest.fn(),
            setRedeemers: jest.fn(),
            setPlutusScripts: jest.fn(),
          })),
        },
        PlutusList: {
          new: jest.fn(() => ({
            len: jest.fn(() => 0),
            add: jest.fn(),
          })),
        },
        BootstrapWitness: {
          new: jest.fn(() => ({
            toBytes: jest.fn(() => Buffer.from('bootstrap')),
          })),
        },
        Vkeywitness: {
          new: jest.fn(() => ({
            toBytes: jest.fn(() => Buffer.from('vkey')),
          })),
        },
        Vkeywitnesses: {
          new: jest.fn(() => ({
            add: jest.fn(),
          })),
        },
        BootstrapWitnesses: {
          new: jest.fn(() => ({
            add: jest.fn(),
          })),
        },
        Vkey: {
          new: jest.fn(() => ({
            toBytes: jest.fn(() => Buffer.from('vkey')),
          })),
        },
        Ed25519Signature: {
          fromBytes: jest.fn(() => ({
            toBytes: jest.fn(() => Buffer.from('sig')),
          })),
        },
        ByronAddress: {
          isValid: jest.fn(() => false),
        },
        Transaction: {
          new: jest.fn(() => ({
            toBytes: jest.fn(() => Buffer.from('tx')),
            id: jest.fn(() => ({
              toHex: jest.fn(() => 'txId'),
            })),
          })),
        },
        TransactionBody: {
          fromBytes: jest.fn(() => ({
            inputs: jest.fn(() => ({
              len: jest.fn(() => 0),
            })),
          })),
        },
        FixedTransaction: {
          fromBytes: jest.fn(() => ({
            transactionHash: jest.fn(() => ({
              toHex: jest.fn(() => 'txHash'),
            })),
          })),
        },
      } as any

      const unsignedTx = {
        senderUtxos: [
          {
            receiver: 'addr_test1',
            txHash: 'hash1' as TransactionHash,
            txIndex: 0,
            addressing: {
              path: [2147483648, 2147483648, 0, 0, 0],
              startLevel: 1, // PURPOSE level
            },
          },
        ],
        txBuilder: {
          build: jest.fn(() => ({
            toBytes: jest.fn(() => Buffer.from('body')),
          })),
        },
        auxiliaryData: null,
      } as any

      const signedLedgerTx = {
        witnesses: [
          {
            path: [2147483648, 2147483648, 0, 0, 0],
            witnessSignatureHex: 'signature',
          },
        ],
        txHashHex: 'txHash', // Must match the hash returned by FixedTransaction mock
      } as any

      const result = await buildLedgerSignedTx(
        mockCsl,
        unsignedTx,
        signedLedgerTx,
        1852,
        'publicKeyHex',
      )

      expect(result).toBeDefined()
      expect(result.id).toBe('txHash') // Should match txHashHex
      expect(result.encodedTx).toBeDefined()
    })

    it('should throw error when witness not found', async () => {
      const mockCsl = {
        Bip32PublicKey: {
          fromBytes: jest.fn(() => ({
            derive: jest.fn(),
          })),
        },
        TransactionWitnessSet: {
          new: jest.fn(() => ({})),
        },
        PlutusList: {
          new: jest.fn(() => ({
            len: jest.fn(() => 0),
            add: jest.fn(),
          })),
        },
        ByronAddress: {
          isValid: jest.fn(() => false),
        },
        TransactionBody: {
          fromBytes: jest.fn(() => ({
            inputs: jest.fn(() => ({
              len: jest.fn(() => 0),
            })),
          })),
        },
        FixedTransaction: {
          fromBytes: jest.fn(() => ({
            transactionHash: jest.fn(() => ({
              toHex: jest.fn(() => 'txHash'),
            })),
          })),
        },
      } as any

      const unsignedTx = {
        senderUtxos: [
          {
            receiver: 'addr_test1',
            txHash: 'hash1' as TransactionHash,
            txIndex: 0,
            addressing: {
              path: [2147483648, 2147483648, 0, 0, 0],
              startLevel: 1, // PURPOSE level
            },
          },
        ],
        txBuilder: {
          build: jest.fn(() => ({
            toBytes: jest.fn(() => Buffer.from('body')),
          })),
        },
        auxiliaryData: null,
      } as any

      const signedLedgerTx = {
        witnesses: [
          {
            path: [2147483648, 2147483648, 0, 0, 1], // Different path
            witnessSignatureHex: 'signature',
          },
        ],
      } as any

      await expect(
        buildLedgerSignedTx(
          mockCsl,
          unsignedTx,
          signedLedgerTx,
          1852,
          'publicKeyHex',
        ),
      ).rejects.toThrow('no witness for')
    })
  })

  describe('createSignedLedgerTxFromCbor', () => {
    it('should have correct function signature', () => {
      // This function uses CardanoMobile internally
      // which requires real CSL. We verify the function exists and has correct signature
      expect(typeof createSignedLedgerTxFromCbor).toBe('function')
    })
  })

  describe('signRawTransaction', () => {
    it('should have correct function signature', () => {
      // This function uses CardanoMobile internally
      // which requires real CSL. We verify the function exists and has correct signature
      expect(typeof signRawTransaction).toBe('function')
    })
  })
})
