/**
 * Unit tests for multisig transaction signer
 */
import {Wallet} from '@yoroi/types'
import {Bip32PublicKeyHex, ScriptCbor, TransactionCbor} from '@yoroi/types'

import type {UnsignedTransaction} from '../transaction-builder/types'
import {
  checkCoSignerSignature,
  getQuorumStatus,
  getSignedCoSigners,
  signMultisigTransaction,
  validateMultisigQuorum,
} from './multisig-tx-signer'

// Mock CardanoMobileWrapped
jest.mock('@yoroi/cardano-wallet', () => ({
  CardanoMobileWrapped: {
    cslScope: jest.fn((fn) => {
      const mockCsl = {
        Transaction: {
          fromHex: jest.fn((hex: string) => ({
            witnessSet: jest.fn(() => ({
              nativeScripts: jest.fn(() => ({
                len: jest.fn(() => 0),
                get: jest.fn(() => null),
              })),
              vkeys: jest.fn(() => ({
                len: jest.fn(() => 1),
                get: jest.fn(() => ({
                  vkey: jest.fn(() => ({
                    publicKey: jest.fn(() => ({
                      hash: jest.fn(() => ({
                        toHex: jest.fn(() => 'mockKeyHash'),
                      })),
                    })),
                  })),
                })),
              })),
            })),
            body: jest.fn(() => ({
              toBytes: jest.fn(() => Buffer.from('body')),
            })),
            auxiliaryData: jest.fn(() => null),
          })),
          fromBytes: jest.fn((bytes: Uint8Array) => ({
            witnessSet: jest.fn(() => ({
              vkeys: jest.fn(() => ({
                len: jest.fn(() => 1),
                get: jest.fn(() => ({
                  vkey: jest.fn(() => ({
                    publicKey: jest.fn(() => ({
                      hash: jest.fn(() => ({
                        toHex: jest.fn(() => 'mockKeyHash'),
                      })),
                    })),
                  })),
                })),
              })),
            })),
            toBytes: jest.fn(() => Buffer.from('signedTx')),
          })),
        },
        Bip32PrivateKey: {
          fromBytes: jest.fn((bytes: Uint8Array) => ({
            derive: jest.fn((index: number) => ({
              derive: jest.fn((index2: number) => ({
                toRawKey: jest.fn(() => ({
                  sign: jest.fn(() => Buffer.from('signature')),
                })),
              })),
            })),
          })),
        },
        FixedTransaction: {
          fromHex: jest.fn((hex: string) => ({
            signAndAddVkeySignature: jest.fn(),
            toBytes: jest.fn(() => Buffer.from('signedTx')),
          })),
        },
        TransactionWitnessSet: {
          new: jest.fn(() => ({
            nativeScripts: jest.fn(() => ({
              len: jest.fn(() => 0),
              get: jest.fn(() => null),
            })),
            setNativeScripts: jest.fn(),
            setVkeys: jest.fn(),
            setBootstraps: jest.fn(),
          })),
        },
        NativeScripts: {
          new: jest.fn(() => ({
            len: jest.fn(() => 0),
            get: jest.fn(() => null),
            add: jest.fn(),
          })),
        },
        NativeScript: {
          fromHex: jest.fn((hex: string) => ({
            toHex: jest.fn(() => hex),
          })),
        },
        Bip32PublicKey: {
          fromBytes: jest.fn((bytes: Uint8Array) => ({
            derive: jest.fn((index: number) => ({
              derive: jest.fn((index2: number) => ({
                toRawKey: jest.fn(() => ({
                  hash: jest.fn(() => ({
                    toHex: jest.fn(() => 'mockKeyHash'),
                  })),
                })),
              })),
            })),
          })),
        },
      }
      return fn(mockCsl)
    }),
  },
}))

describe('multisig-tx-signer', () => {
  const mockUnsignedTx: UnsignedTransaction = {
    cbor: 'mockUnsignedTxCbor' as TransactionCbor,
    inputs: [],
    outputs: [],
    certificates: [],
    withdrawals: [],
  }

  const mockCoSignerKey = 'acct_shared_xvk1z8kc04y...' as Bip32PublicKeyHex
  const mockParentWalletRootKeyHex = 'mockRootKeyHex'
  const mockPaymentScriptCbor = 'paymentScriptCbor' as ScriptCbor
  const mockStakingScriptCbor = 'stakingScriptCbor' as ScriptCbor

  describe('signMultisigTransaction', () => {
    it('should sign multisig transaction', async () => {
      const result = await signMultisigTransaction({
        unsignedTx: mockUnsignedTx,
        coSignerKey: mockCoSignerKey,
        parentWalletRootKeyHex: mockParentWalletRootKeyHex,
        accountVisual: 0,
        paymentScriptCbor: mockPaymentScriptCbor,
        stakingScriptCbor: mockStakingScriptCbor,
      })

      expect(result).toBeDefined()
      expect(result.signedBy).toBe(mockCoSignerKey)
      expect(result.cborHex).toBeDefined()
    })

    it('should throw error if unsignedTx has no CBOR', async () => {
      await expect(
        signMultisigTransaction({
          unsignedTx: {...mockUnsignedTx, cbor: undefined},
          coSignerKey: mockCoSignerKey,
          parentWalletRootKeyHex: mockParentWalletRootKeyHex,
          accountVisual: 0,
          paymentScriptCbor: mockPaymentScriptCbor,
          stakingScriptCbor: mockStakingScriptCbor,
        }),
      ).rejects.toThrow('UnsignedTransaction must have CBOR to sign')
    })
  })

  describe('validateMultisigQuorum', () => {
    it('should return true when quorum is met', () => {
      const signedCoSigners = [
        'acct_shared_xvk1...' as Bip32PublicKeyHex,
        'acct_shared_xvk2...' as Bip32PublicKeyHex,
      ]
      const signPolicy = {
        requiredCosigners: 2,
        signers: [],
      }

      const result = validateMultisigQuorum(signedCoSigners, signPolicy)
      expect(result).toBe(true)
    })

    it('should return false when quorum is not met', () => {
      const signedCoSigners = ['acct_shared_xvk1...' as Bip32PublicKeyHex]
      const signPolicy = {
        requiredCosigners: 2,
        signers: [],
      }

      const result = validateMultisigQuorum(signedCoSigners, signPolicy)
      expect(result).toBe(false)
    })
  })

  describe('getQuorumStatus', () => {
    it('should return correct quorum status', () => {
      const signedCoSigners = ['acct_shared_xvk1...' as Bip32PublicKeyHex]
      const signPolicy = {
        requiredCosigners: 2,
        signers: [],
      }

      const result = getQuorumStatus(signedCoSigners, signPolicy)
      expect(result.signed).toBe(1)
      expect(result.required).toBe(2)
      expect(result.meetsQuorum).toBe(false)
    })
  })
})
