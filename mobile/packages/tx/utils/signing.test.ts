import type {UnsignedTransaction} from '../transaction-builder/types'
import {signTransaction} from './signing'

describe('signing utils', () => {
  describe('signTransaction', () => {
    it('should sign transaction with account key', () => {
      const unsignedTx: UnsignedTransaction = {
        cbor: 'cbor_hex',
        options: {},
      } as any
      const mockPrivateKey = {}
      const mockFixedTx = {
        signAndAddVkeySignature: jest.fn(),
        toBytes: jest.fn(() => Buffer.from('signed_bytes')),
      }
      const mockTransaction = {}
      const mockCsl = {
        FixedTransaction: {
          fromHex: jest.fn(() => mockFixedTx),
        },
        PrivateKey: {
          fromHex: jest.fn(() => mockPrivateKey),
        },
        Transaction: {
          fromBytes: jest.fn(() => mockTransaction),
        },
      }

      const result = signTransaction(
        mockCsl as any,
        unsignedTx,
        'account_key_hex',
      )

      expect(result).toBe(mockTransaction)
      expect(mockCsl.FixedTransaction.fromHex).toHaveBeenCalledWith('cbor_hex')
      expect(mockCsl.PrivateKey.fromHex).toHaveBeenCalledWith('account_key_hex')
      expect(mockFixedTx.signAndAddVkeySignature).toHaveBeenCalledWith(
        mockPrivateKey,
      )
    })

    it('should sign with staking keys when provided', () => {
      const unsignedTx: UnsignedTransaction = {
        cbor: 'cbor_hex',
        options: {},
      } as any
      const mockPrivateKey1 = {}
      const mockPrivateKey2 = {}
      const mockFixedTx = {
        signAndAddVkeySignature: jest.fn(),
        toBytes: jest.fn(() => Buffer.from('signed_bytes')),
      }
      const mockTransaction = {}
      const mockCsl = {
        FixedTransaction: {
          fromHex: jest.fn(() => mockFixedTx),
        },
        PrivateKey: {
          fromHex: jest
            .fn()
            .mockReturnValueOnce(mockPrivateKey1)
            .mockReturnValueOnce(mockPrivateKey2),
        },
        Transaction: {
          fromBytes: jest.fn(() => mockTransaction),
        },
      }

      signTransaction(mockCsl as any, unsignedTx, 'account_key_hex', [
        {keyHex: 'staking_key_hex'},
      ])

      expect(mockFixedTx.signAndAddVkeySignature).toHaveBeenCalledTimes(2)
    })

    it('should throw error when CBOR is missing', () => {
      const unsignedTx: UnsignedTransaction = {
        cbor: undefined,
        options: {},
      } as any
      const mockCsl = {} as any

      expect(() => signTransaction(mockCsl, unsignedTx, 'key_hex')).toThrow(
        'UnsignedTransaction must have CBOR to sign',
      )
    })

    it('should throw error when transaction is invalid', () => {
      const unsignedTx: UnsignedTransaction = {
        cbor: 'invalid_cbor',
        options: {},
      } as any
      const mockCsl = {
        FixedTransaction: {
          fromHex: jest.fn(() => null),
        },
      }

      expect(() =>
        signTransaction(mockCsl as any, unsignedTx, 'key_hex'),
      ).toThrow('Invalid transaction CBOR')
    })

    it('should handle datum data (no-op for now)', () => {
      const unsignedTx: UnsignedTransaction = {
        cbor: 'cbor_hex',
        options: {},
      } as any
      const mockPrivateKey = {}
      const mockFixedTx = {
        signAndAddVkeySignature: jest.fn(),
        toBytes: jest.fn(() => Buffer.from('signed_bytes')),
      }
      const mockTransaction = {}
      const mockCsl = {
        FixedTransaction: {
          fromHex: jest.fn(() => mockFixedTx),
        },
        PrivateKey: {
          fromHex: jest.fn(() => mockPrivateKey),
        },
        Transaction: {
          fromBytes: jest.fn(() => mockTransaction),
        },
      }

      const result = signTransaction(
        mockCsl as any,
        unsignedTx,
        'account_key_hex',
        undefined,
        [{data: 'datum_data'}],
      )

      expect(result).toBe(mockTransaction)
      // Datum data handling is TODO, so no error should be thrown
    })
  })
})
