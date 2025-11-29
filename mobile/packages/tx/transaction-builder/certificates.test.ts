import {KeyHash} from '@yoroi/types'

import {createCertificateFromData} from './certificates'
import type {TransactionCertificate} from './types'

describe('certificates', () => {
  describe('createCertificateFromData', () => {
    it('should create stake registration certificate', () => {
      const certData: TransactionCertificate = {
        stakeCredentialKeyHashHex: 'stake_key_hash' as KeyHash,
        kind: 'StakeRegistration',
      }
      const mockStakeCred = {}
      const mockStakeReg = {}
      const mockCert = {}
      const mockCsl = {
        Credential: {
          fromKeyhash: jest.fn(() => mockStakeCred),
        },
        StakeRegistration: {
          new: jest.fn(() => mockStakeReg),
        },
        Certificate: {
          newStakeRegistration: jest.fn(() => mockCert),
        },
        Ed25519KeyHash: {
          fromBytes: jest.fn(),
        },
      }

      const result = createCertificateFromData(mockCsl as any, certData)

      expect(result).toBe(mockCert)
      expect(mockCsl.StakeRegistration.new).toHaveBeenCalled()
    })

    it('should create stake deregistration certificate', () => {
      const certData: TransactionCertificate = {
        stakeCredentialKeyHashHex: 'stake_key_hash' as KeyHash,
        kind: 'StakeDeregistration',
      }
      const mockStakeCred = {}
      const mockStakeDereg = {}
      const mockCert = {}
      const mockCsl = {
        Credential: {
          fromKeyhash: jest.fn(() => mockStakeCred),
        },
        StakeDeregistration: {
          new: jest.fn(() => mockStakeDereg),
        },
        Certificate: {
          newStakeDeregistration: jest.fn(() => mockCert),
        },
        Ed25519KeyHash: {
          fromBytes: jest.fn(),
        },
      }

      const result = createCertificateFromData(mockCsl as any, certData)

      expect(result).toBe(mockCert)
    })

    it('should create stake delegation certificate', () => {
      const certData: TransactionCertificate = {
        stakeCredentialKeyHashHex: 'stake_key_hash' as KeyHash,
        poolKeyHash: 'pool_key_hash' as KeyHash,
        kind: 'StakeDelegation',
      }
      const mockStakeCred = {}
      const mockPoolKeyHash = {}
      const mockStakeDeleg = {}
      const mockCert = {}
      const mockCsl = {
        Credential: {
          fromKeyhash: jest.fn(() => mockStakeCred),
        },
        StakeDelegation: {
          new: jest.fn(() => mockStakeDeleg),
        },
        Certificate: {
          newStakeDelegation: jest.fn(() => mockCert),
        },
        Ed25519KeyHash: {
          fromBytes: jest.fn(() => mockPoolKeyHash),
        },
      }

      const result = createCertificateFromData(mockCsl as any, certData)

      expect(result).toBe(mockCert)
      expect(mockCsl.Ed25519KeyHash.fromBytes).toHaveBeenCalled()
    })

    it('should create vote delegation certificate', () => {
      const certData: TransactionCertificate = {
        stakeCredentialKeyHashHex: 'stake_key_hash' as KeyHash,
        drep: {KeyHash: 'drep_key_hash' as KeyHash},
        kind: 'VoteDelegation',
      }
      const mockStakeCred = {}
      const mockDrep = {}
      const mockVoteDeleg = {}
      const mockCert = {}
      const mockCsl = {
        Credential: {
          fromKeyhash: jest.fn(() => mockStakeCred),
        },
        DRep: {
          newKeyHash: jest.fn(() => mockDrep),
        },
        VoteDelegation: {
          new: jest.fn(() => mockVoteDeleg),
        },
        Certificate: {
          newVoteDelegation: jest.fn(() => mockCert),
        },
        Ed25519KeyHash: {
          fromBytes: jest.fn(),
        },
      }

      const result = createCertificateFromData(mockCsl as any, certData)

      expect(result).toBe(mockCert)
    })

    it('should throw error when stake credential missing', () => {
      const certData = {
        type: 'stake_registration',
        kind: 'StakeRegistration',
      } as any
      const mockCsl = {
        Credential: {
          fromKeyhash: jest.fn(),
        },
      }

      expect(() => createCertificateFromData(mockCsl as any, certData)).toThrow(
        'requires stakeCredentialKeyHashHex',
      )
    })

    it('should handle DRep AlwaysAbstain', () => {
      const certData: TransactionCertificate = {
        stakeCredentialKeyHashHex: 'stake_key_hash' as KeyHash,
        drep: 'AlwaysAbstain',
        kind: 'VoteDelegation',
      }
      const mockStakeCred = {}
      const mockKeyHash = {}
      const mockDrep = {}
      const mockVoteDeleg = {}
      const mockCert = {}
      const mockCsl = {
        Credential: {
          fromKeyhash: jest.fn(() => mockStakeCred),
        },
        Ed25519KeyHash: {
          fromBytes: jest.fn(() => mockKeyHash),
        },
        DRep: {
          newAlwaysAbstain: jest.fn(() => mockDrep),
        },
        VoteDelegation: {
          new: jest.fn(() => mockVoteDeleg),
        },
        Certificate: {
          newVoteDelegation: jest.fn(() => mockCert),
        },
      }

      const result = createCertificateFromData(mockCsl as any, certData)

      expect(result).toBe(mockCert)
      expect(mockCsl.DRep.newAlwaysAbstain).toHaveBeenCalled()
    })

    it('should handle DRep AlwaysNoConfidence', () => {
      const certData: TransactionCertificate = {
        stakeCredentialKeyHashHex: 'stake_key_hash' as KeyHash,
        drep: 'AlwaysNoConfidence',
        kind: 'VoteDelegation',
      }
      const mockStakeCred = {}
      const mockKeyHash = {}
      const mockDrep = {}
      const mockVoteDeleg = {}
      const mockCert = {}
      const mockCsl = {
        Credential: {
          fromKeyhash: jest.fn(() => mockStakeCred),
        },
        Ed25519KeyHash: {
          fromBytes: jest.fn(() => mockKeyHash),
        },
        DRep: {
          newAlwaysNoConfidence: jest.fn(() => mockDrep),
        },
        VoteDelegation: {
          new: jest.fn(() => mockVoteDeleg),
        },
        Certificate: {
          newVoteDelegation: jest.fn(() => mockCert),
        },
      }

      const result = createCertificateFromData(mockCsl as any, certData)

      expect(result).toBe(mockCert)
      expect(mockCsl.DRep.newAlwaysNoConfidence).toHaveBeenCalled()
    })
  })
})
