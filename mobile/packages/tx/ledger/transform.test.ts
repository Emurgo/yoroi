import {TransactionHash} from '@yoroi/types'

import {CertificateType} from '@cardano-foundation/ledgerjs-hw-app-cardano'

import {Addressing} from '../types'
import {
  assertTagsState,
  compareCborKey,
  doAllSetsHaveTag,
  formatLedgerCertificates,
  formatLedgerWithdrawals,
  toLedgerTokenBundle,
  transformToLedgerInputs,
  verifyFromBip44Root,
} from './transform'

describe('ledger transform', () => {
  describe('verifyFromBip44Root', () => {
    it('should throw error when addressing does not start from root', () => {
      const addressing: Addressing = {
        path: [2147483648, 2147483648, 0, 0],
        startLevel: 0, // Should be 1 (PURPOSE level)
      }

      expect(() => verifyFromBip44Root(addressing)).toThrow(
        'verifyFromBip44Root addressing does not start from root',
      )
    })

    it('should throw error when addressing size is incorrect', () => {
      const addressing: Addressing = {
        path: [2147483648, 2147483648, 0, 0], // Too short - should be 5 levels total
        startLevel: 1,
      }

      expect(() => verifyFromBip44Root(addressing)).toThrow(
        'verifyFromBip44Root incorrect addressing size',
      )
    })

    it('should not throw when addressing is correct', () => {
      const addressing: Addressing = {
        path: [2147483648, 2147483648, 0, 0, 0],
        startLevel: 1, // PURPOSE level
      }

      expect(() => verifyFromBip44Root(addressing)).not.toThrow()
    })
  })

  describe('compareCborKey', () => {
    it('should return -1 when hex1 is shorter', () => {
      expect(compareCborKey('abc', 'abcd')).toBe(-1)
    })

    it('should return 1 when hex1 is longer', () => {
      expect(compareCborKey('abcd', 'abc')).toBe(1)
    })

    it('should return -1 when hex1 is lexicographically smaller', () => {
      expect(compareCborKey('abc', 'def')).toBe(-1)
    })

    it('should return 1 when hex1 is lexicographically larger', () => {
      expect(compareCborKey('def', 'abc')).toBe(1)
    })

    it('should return 0 when hex strings are equal', () => {
      expect(compareCborKey('abc', 'abc')).toBe(0)
    })
  })

  describe('transformToLedgerInputs', () => {
    it('should transform inputs and order them correctly', () => {
      // Use proper hex strings for transaction hashes
      const hash1Hex =
        '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
      const hash2Hex =
        'fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210'
      const hash1Bytes = Buffer.from(hash1Hex, 'hex')
      const hash2Bytes = Buffer.from(hash2Hex, 'hex')

      const mockTxBuilder = {
        build: jest.fn(() => ({
          inputs: jest.fn(() => ({
            len: jest.fn(() => 2),
            get: jest.fn((index: number) => {
              if (index === 0) {
                return {
                  transactionId: jest.fn(() => ({
                    toBytes: jest.fn(() => hash1Bytes),
                  })),
                  index: jest.fn(() => 0),
                }
              }
              return {
                transactionId: jest.fn(() => ({
                  toBytes: jest.fn(() => hash2Bytes),
                })),
                index: jest.fn(() => 1),
              }
            }),
          })),
        })),
      }

      const unsignedTx = {
        senderUtxos: [
          {
            txHash: hash1Hex as TransactionHash,
            txIndex: 0,
            addressing: {
              path: [2147483648, 2147483648, 0, 0, 0],
              startLevel: 1, // PURPOSE level
            },
          },
          {
            txHash: hash2Hex as TransactionHash,
            txIndex: 1,
            addressing: {
              path: [2147483648, 2147483648, 0, 0, 1],
              startLevel: 1, // PURPOSE level
            },
          },
        ],
        txBuilder: mockTxBuilder,
      } as any

      const result = transformToLedgerInputs(unsignedTx)

      expect(result).toHaveLength(2)
      expect(result[0]?.txHashHex).toBe(hash1Hex)
      expect(result[0]?.outputIndex).toBe(0)
      expect(result[1]?.txHashHex).toBe(hash2Hex)
      expect(result[1]?.outputIndex).toBe(1)
    })

    it('should throw error when input not found', () => {
      const hash1Hex =
        '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
      const hash3Hex =
        '3333333333333333333333333333333333333333333333333333333333333333'
      const hash3Bytes = Buffer.from(hash3Hex, 'hex')

      const mockTxBuilder = {
        build: jest.fn(() => ({
          inputs: jest.fn(() => ({
            len: jest.fn(() => 1),
            get: jest.fn(() => ({
              transactionId: jest.fn(() => ({
                toBytes: jest.fn(() => hash3Bytes),
              })),
              index: jest.fn(() => 2),
            })),
          })),
        })),
      }

      const unsignedTx = {
        senderUtxos: [
          {
            txHash: hash1Hex as TransactionHash,
            txIndex: 0,
            addressing: {
              path: [2147483648, 2147483648, 0, 0, 0],
              startLevel: 1, // PURPOSE level
            },
          },
        ],
        txBuilder: mockTxBuilder,
      } as any

      expect(() => transformToLedgerInputs(unsignedTx)).toThrow(
        'no input found to match',
      )
    })
  })

  describe('toLedgerTokenBundle', () => {
    it('should return null for null or undefined', () => {
      expect(toLedgerTokenBundle(null)).toBeNull()
      expect(toLedgerTokenBundle(undefined)).toBeNull()
    })

    it('should transform MultiAsset to Ledger format', () => {
      // Mock the asset name
      const mockAssetName = {
        name: jest.fn(() => Buffer.from('test', 'utf-8')),
      }
      const mockPolicyId = {
        toBytes: jest.fn(() =>
          Buffer.from(
            '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
            'hex',
          ),
        ),
      }
      const mockAmount = {
        toStr: jest.fn(() => '1000000'),
      }

      const mockAssetsForPolicy = {
        keys: jest.fn(() => ({
          len: jest.fn(() => 1),
          get: jest.fn(() => mockAssetName),
        })),
        get: jest.fn(() => mockAmount),
      }

      const mockMultiAsset = {
        keys: jest.fn(() => ({
          len: jest.fn(() => 1),
          get: jest.fn(() => mockPolicyId),
        })),
        get: jest.fn(() => mockAssetsForPolicy),
      } as any

      const result = toLedgerTokenBundle(mockMultiAsset)

      expect(result).not.toBeNull()
      expect(result).toHaveLength(1)
      if (result) {
        expect(result[0]?.policyIdHex).toBeTruthy()
        expect(result[0]?.tokens).toHaveLength(1)
      }
    })
  })

  describe('formatLedgerCertificates', () => {
    it('should format stake registration certificate', () => {
      const mockCert = {
        asStakeRegistration: jest.fn(() => ({
          hasValue: jest.fn(() => true),
        })),
      }
      const mockCertificates = {
        len: jest.fn(() => 1),
        get: jest.fn(() => mockCert),
      } as any

      const result = formatLedgerCertificates(
        mockCertificates,
        [2147483648, 2147483648, 0, 2, 0],
      )

      expect(result).toHaveLength(1)
      expect(result[0]?.type).toBe(CertificateType.STAKE_REGISTRATION)
    })

    it('should format stake deregistration certificate', () => {
      const mockCert = {
        asStakeRegistration: jest.fn(() => null),
        asStakeDeregistration: jest.fn(() => ({
          hasValue: jest.fn(() => true),
        })),
      }
      const mockCertificates = {
        len: jest.fn(() => 1),
        get: jest.fn(() => mockCert),
      } as any

      const result = formatLedgerCertificates(
        mockCertificates,
        [2147483648, 2147483648, 0, 2, 0],
      )

      expect(result).toHaveLength(1)
      expect(result[0]?.type).toBe(CertificateType.STAKE_DEREGISTRATION)
    })

    it('should format stake delegation certificate', () => {
      const mockCert = {
        asStakeRegistration: jest.fn(() => null),
        asStakeDeregistration: jest.fn(() => null),
        asStakeDelegation: jest.fn(() => ({
          hasValue: jest.fn(() => true),
          poolKeyhash: jest.fn(() => ({
            toBytes: jest.fn(() => Buffer.from('pool', 'hex')),
          })),
        })),
      }
      const mockCertificates = {
        len: jest.fn(() => 1),
        get: jest.fn(() => mockCert),
      } as any

      const result = formatLedgerCertificates(
        mockCertificates,
        [2147483648, 2147483648, 0, 2, 0],
      )

      expect(result).toHaveLength(1)
      expect(result[0]?.type).toBe(CertificateType.STAKE_DELEGATION)
    })

    it('should throw error for unsupported certificate type', () => {
      const mockCert = {
        asStakeRegistration: jest.fn(() => null),
        asStakeDeregistration: jest.fn(() => null),
        asStakeDelegation: jest.fn(() => null),
        asVoteDelegation: jest.fn(() => null),
      }
      const mockCertificates = {
        len: jest.fn(() => 1),
        get: jest.fn(() => mockCert),
      } as any

      expect(() =>
        formatLedgerCertificates(
          mockCertificates,
          [2147483648, 2147483648, 0, 2, 0],
        ),
      ).toThrow("Ledger doesn't support this certificate type")
    })
  })

  describe('formatLedgerWithdrawals', () => {
    it('should format withdrawals', () => {
      const mockRewardAddr = {
        paymentCred: jest.fn(() => ({
          toKeyhash: jest.fn(() => ({
            toBytes: jest.fn(() => Buffer.from('hash', 'hex')),
          })),
        })),
      }
      const mockWithdrawalAmount = {
        toStr: jest.fn(() => '1000000'),
      }
      const mockWithdrawals = {
        keys: jest.fn(() => ({
          len: jest.fn(() => 1),
          get: jest.fn(() => mockRewardAddr),
        })),
        get: jest.fn(() => mockWithdrawalAmount),
      } as any

      const result = formatLedgerWithdrawals(
        mockWithdrawals,
        [2147483648, 2147483648, 0, 2, 0],
      )

      expect(result).toHaveLength(1)
      // formatLedgerWithdrawals returns array of LedgerWithdrawal objects
      expect(result[0]?.amount).toBe('1000000')
      expect(result[0]?.stakeCredential).toBeDefined()
    })
  })

  describe('doAllSetsHaveTag', () => {
    it('should return true when all sets have tag', () => {
      const TransactionSetsState = {
        AllSetsHaveTag: 'AllSetsHaveTag',
        MixedSets: 'MixedSets',
        NoSetsHaveTag: 'NoSetsHaveTag',
      }
      const mockCsl = {
        Transaction: {
          fromBytes: jest.fn(() => ({
            body: jest.fn(() => ({
              inputs: jest.fn(() => ({
                len: jest.fn(() => 0),
              })),
            })),
            witnessSet: jest.fn(() => ({
              plutusScripts: jest.fn(() => null),
              plutusData: jest.fn(() => null),
              redeemers: jest.fn(() => null),
            })),
          })),
        },
        hasTransactionSetTag: jest.fn(
          () => TransactionSetsState.AllSetsHaveTag,
        ),
        TransactionSetsState,
      } as any

      expect(doAllSetsHaveTag(mockCsl, 'hex')).toBe(true)
    })
  })

  describe('assertTagsState', () => {
    it('should not throw when tags are valid', () => {
      const TransactionSetsState = {
        AllSetsHaveTag: 'AllSetsHaveTag',
        MixedSets: 'MixedSets',
        NoSetsHaveTag: 'NoSetsHaveTag',
      }
      const mockCsl = {
        Transaction: {
          fromBytes: jest.fn(() => ({
            body: jest.fn(() => ({
              inputs: jest.fn(() => ({
                len: jest.fn(() => 0),
              })),
            })),
            witnessSet: jest.fn(() => ({
              plutusScripts: jest.fn(() => null),
              plutusData: jest.fn(() => null),
              redeemers: jest.fn(() => null),
            })),
          })),
        },
        hasTransactionSetTag: jest.fn(
          () => TransactionSetsState.AllSetsHaveTag,
        ),
        TransactionSetsState,
      } as any

      expect(() => assertTagsState(mockCsl, 'hex')).not.toThrow()
    })
  })
})
