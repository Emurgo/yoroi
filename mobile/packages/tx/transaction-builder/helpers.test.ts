import {Balance, Chain, Portfolio, Wallet} from '@yoroi/types'

import {BigNumber} from 'bignumber.js'

import {ModernUtxo} from '../utxo/models'
import {
  createCIP15VotingMetadata,
  createCIP36VotingMetadata,
  createCardanoHaskellConfig,
  createMetadataEntry,
  createRecipeContext,
  createStakeDelegationCertificate,
  createStakeDeregistrationCertificate,
  createStakeRegistrationCertificate,
  createVoteDelegationCertificate,
  selectUtxosForAmounts,
  sortUtxosByAda,
} from './helpers'

describe('transaction builder helpers', () => {
  const createMockUtxo = (
    balance: Balance.Amounts,
    txHash = 'hash1',
    txIndex = 0,
  ): ModernUtxo => ({
    receiver: 'addr_test1',
    txHash,
    txIndex,
    balance,
    toTransactionUnspentOutputHex: jest.fn(() => 'hex'),
    toTransactionUnspentOutput: jest.fn(),
  })

  describe('createMetadataEntry', () => {
    it('should create metadata entry', () => {
      const result = createMetadataEntry(674, {msg: 'test'})

      expect(result).toEqual({
        label: 674,
        data: {msg: 'test'},
      })
    })
  })

  describe('createCIP15VotingMetadata', () => {
    it('should create CIP-15 voting metadata', () => {
      const result = createCIP15VotingMetadata(
        'voting_key',
        'staking_key',
        'reward_addr',
        123,
      )

      expect(result.label).toBe(61284)
      expect(result.data).toEqual({
        1: 'voting_key',
        2: 'staking_key',
        3: 'reward_addr',
        4: 123,
      })
    })
  })

  describe('createCIP36VotingMetadata', () => {
    it('should create CIP-36 voting metadata without payment address', () => {
      const result = createCIP36VotingMetadata(
        'voting_key',
        'staking_key',
        'reward_addr',
        123,
      )

      expect(result.label).toBe(61284)
      expect(result.data).toEqual({
        1: 'voting_key',
        2: 'staking_key',
        3: 'reward_addr',
        4: 123,
      })
    })

    it('should create CIP-36 voting metadata with payment address', () => {
      const result = createCIP36VotingMetadata(
        'voting_key',
        'staking_key',
        'reward_addr',
        123,
        'payment_addr',
      )

      expect(result.data).toHaveProperty('5', 'payment_addr')
    })
  })

  describe('createCardanoHaskellConfig', () => {
    it('should create CardanoHaskellConfig from protocol params', () => {
      const protocolParams: Pick<
        Chain.Cardano.ProtocolParams,
        'keyDeposit' | 'linearFee' | 'coinsPerUtxoByte' | 'poolDeposit'
      > = {
        keyDeposit: '2000000',
        linearFee: {coefficient: '44', constant: '155381'},
        coinsPerUtxoByte: '4310',
        poolDeposit: '500000000',
      }

      const result = createCardanoHaskellConfig(protocolParams, 0)

      expect(result.keyDeposit).toBe('2000000')
      expect(result.linearFee).toEqual(protocolParams.linearFee)
      expect(result.coinsPerUtxoByte).toBe('4310')
      expect(result.poolDeposit).toBe('500000000')
      expect(result.networkId).toBe(0)
    })
  })

  describe('createRecipeContext', () => {
    it('should create recipe context', async () => {
      const protocolParams: Chain.Cardano.ProtocolParams = {
        keyDeposit: '2000000',
        linearFee: {coefficient: '44', constant: '155381'},
        coinsPerUtxoByte: '4310',
        poolDeposit: '500000000',
        minUtxoValue: '1000000',
      } as any

      const params = {
        getAbsoluteSlotNumber: jest.fn(() =>
          Promise.resolve(new BigNumber(1000000)),
        ),
        getChangeAddress: jest.fn(() => 'addr_test1'),
        protocolParams,
        networkId: 0,
        addressMode: 'single' as Wallet.AddressMode,
      }

      const result = await createRecipeContext(params)

      expect(result.absSlotNumber).toEqual(new BigNumber(1000000))
      expect(result.changeAddress).toBe('addr_test1')
      expect(result.protocolConfig.networkId).toBe(0)
    })
  })

  describe('sortUtxosByAda', () => {
    it('should sort UTXOs by ADA amount descending', () => {
      const utxos = [
        createMockUtxo({'.': '1000000'}, 'hash1', 0),
        createMockUtxo({'.': '5000000'}, 'hash2', 1),
        createMockUtxo({'.': '2000000'}, 'hash3', 2),
      ]

      const result = sortUtxosByAda(utxos, '.')

      expect(result[0]?.txHash).toBe('hash2') // Largest first
      expect(result[1]?.txHash).toBe('hash3')
      expect(result[2]?.txHash).toBe('hash1')
    })

    it('should handle empty array', () => {
      const result = sortUtxosByAda([], '.')

      expect(result).toEqual([])
    })
  })

  describe('selectUtxosForAmounts', () => {
    it('should select UTXOs with required tokens', () => {
      const utxos = [
        createMockUtxo({'.': '1000000', 'token1': '100'}, 'hash1', 0),
        createMockUtxo({'.': '5000000'}, 'hash2', 1),
      ]
      const requiredAmounts = {token1: '50'} as Record<
        Portfolio.Token.Id,
        string
      >

      const result = selectUtxosForAmounts(utxos, requiredAmounts, '.')

      expect(result.some((u) => u.txHash === 'hash1')).toBe(true)
    })

    it('should select additional UTXOs for ADA requirements', () => {
      const utxos = [
        createMockUtxo({'.': '1000000', 'token1': '100'}, 'hash1', 0),
        createMockUtxo({'.': '5000000'}, 'hash2', 1),
      ]
      const requiredAmounts = {
        '.': '3000000',
        'token1': '50',
      } as Record<Portfolio.Token.Id, string>

      const result = selectUtxosForAmounts(
        utxos,
        requiredAmounts,
        '.',
        '200000',
      )

      expect(result.length).toBeGreaterThan(1)
    })

    it('should handle estimated fee', () => {
      const utxos = [
        createMockUtxo({'.': '1000000'}, 'hash1', 0),
        createMockUtxo({'.': '5000000'}, 'hash2', 1),
      ]
      const requiredAmounts = {'.': '2000000'} as Record<
        Portfolio.Token.Id,
        string
      >

      const result = selectUtxosForAmounts(
        utxos,
        requiredAmounts,
        '.',
        '500000',
      )

      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('createStakeRegistrationCertificate', () => {
    it('should create stake registration certificate', () => {
      const mockStakingKey = {
        hash: jest.fn(() => ({
          toBytes: jest.fn(() => Buffer.from('key_hash', 'hex')),
        })),
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
      }

      const result = createStakeRegistrationCertificate(
        mockCsl as any,
        mockStakingKey as any,
      )

      expect(result).toBe(mockCert)
      expect(mockCsl.StakeRegistration.new).toHaveBeenCalled()
    })
  })

  describe('createStakeDeregistrationCertificate', () => {
    it('should create stake deregistration certificate', () => {
      const mockStakingKey = {
        hash: jest.fn(() => ({
          toBytes: jest.fn(() => Buffer.from('key_hash', 'hex')),
        })),
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
      }

      const result = createStakeDeregistrationCertificate(
        mockCsl as any,
        mockStakingKey as any,
      )

      expect(result).toBe(mockCert)
    })
  })

  describe('createStakeDelegationCertificate', () => {
    it('should create stake delegation certificate', () => {
      const mockStakingKey = {
        hash: jest.fn(() => ({
          toBytes: jest.fn(() => Buffer.from('key_hash', 'hex')),
        })),
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

      const result = createStakeDelegationCertificate(
        mockCsl as any,
        mockStakingKey as any,
        'pool_key_hash',
      )

      expect(result).toBe(mockCert)
      expect(mockCsl.Ed25519KeyHash.fromBytes).toHaveBeenCalled()
    })
  })

  describe('createVoteDelegationCertificate', () => {
    it('should create vote delegation certificate with hex DRep ID', () => {
      const mockStakingKey = {
        hash: jest.fn(() => ({
          toBytes: jest.fn(() => Buffer.from('key_hash', 'hex')),
        })),
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

      const result = createVoteDelegationCertificate(
        mockCsl as any,
        mockStakingKey as any,
        'abcdef123456', // Hex format (doesn't start with 'drep')
        false,
      )

      expect(result).toBe(mockCert)
      expect(mockCsl.DRep.newKeyHash).toHaveBeenCalled()
    })

    it('should throw error for bech32 DRep ID', () => {
      const mockStakingKey = {
        hash: jest.fn(() => ({
          toBytes: jest.fn(() => Buffer.from('key_hash', 'hex')),
        })),
      }
      const mockStakeCred = {}
      const mockCsl = {
        Credential: {
          fromKeyhash: jest.fn(() => mockStakeCred),
        },
      }

      expect(() =>
        createVoteDelegationCertificate(
          mockCsl as any,
          mockStakingKey as any,
          'drep1...',
          false,
        ),
      ).toThrow('Bech32 DRep ID format not yet supported')
    })
  })
})
