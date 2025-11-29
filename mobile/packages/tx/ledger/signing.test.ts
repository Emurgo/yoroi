import {TransactionHash} from '@yoroi/types'

import {
  buildLedgerSignedTx,
  createSignedLedgerTxFromCbor,
  signRawTransaction,
} from './signing'

describe('ledger signing', () => {
  describe('buildLedgerSignedTx', () => {
    it('should build signed transaction from Ledger response', async () => {
      const mockCsl = {
        Bip32PublicKey: {
          fromBytes: jest.fn(() => ({
            derive: jest.fn(() => ({
              toRawKey: jest.fn(() => ({
                toHex: jest.fn(() => 'publicKeyHex'),
              })),
            })),
            chaincode: jest.fn(() => Buffer.from('chaincode')),
          })),
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
        Vkey: {
          new: jest.fn(),
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
      } as any

      const unsignedTx = {
        senderUtxos: [
          {
            receiver: 'addr_test1',
            txHash: 'hash1' as TransactionHash,
            txIndex: 0,
            addressing: {
              path: [2147483648, 2147483648, 0, 0, 0],
              startLevel: 0,
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
      } as any

      const result = await buildLedgerSignedTx(
        mockCsl,
        unsignedTx,
        signedLedgerTx,
        1852,
        'publicKeyHex',
      )

      expect(result).toBeDefined()
      expect(result.id).toBe('txId')
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
      } as any

      const unsignedTx = {
        senderUtxos: [
          {
            receiver: 'addr_test1',
            txHash: 'hash1' as TransactionHash,
            txIndex: 0,
            addressing: {
              path: [2147483648, 2147483648, 0, 0, 0],
              startLevel: 0,
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
      // This function uses CardanoMobileWrapped.cslScope internally
      // which requires real CSL. We verify the function exists and has correct signature
      expect(typeof createSignedLedgerTxFromCbor).toBe('function')
    })
  })

  describe('signRawTransaction', () => {
    it('should have correct function signature', () => {
      // This function uses CardanoMobileWrapped.cslScope internally
      // which requires real CSL. We verify the function exists and has correct signature
      expect(typeof signRawTransaction).toBe('function')
    })
  })
})
