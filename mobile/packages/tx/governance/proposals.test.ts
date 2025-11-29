import {TransactionHash} from '@yoroi/types'

import {createTransactionBuilder} from '../transaction-builder/builder'
import {
  addProposal,
  createGovernanceAnchor,
  validateProposal,
} from './proposals'
import type {Proposal} from './types'

describe('governance proposals', () => {
  describe('addProposal', () => {
    it('should add proposal to metadata', () => {
      const state = createTransactionBuilder()
      const proposal: Proposal = {
        governanceAction: {
          type: 'parameterChange',
          actionId: {txHash: 'hash1' as TransactionHash, txIndex: 0},
        },
        anchor: {url: 'https://example.com', hash: 'hash123'},
        rewardAccount: 'stake_test1',
        deposit: '500000000',
      }

      const newState = addProposal(state, proposal)

      expect(newState.metadata).toHaveLength(1)
      expect(newState.metadata[0]?.label).toBe('governance_proposal')
      expect(newState.metadata[0]?.data).toHaveProperty('governanceAction')
      expect(newState.metadata[0]?.data).toHaveProperty('anchor')
    })
  })

  describe('createGovernanceAnchor', () => {
    it('should create anchor from URL and metadata', () => {
      const result = createGovernanceAnchor('https://example.com', {
        key1: 'value1',
        key2: 42,
      })

      expect(result.url).toBe('https://example.com')
      expect(result.hash.length).toBeLessThanOrEqual(64) // Up to 32 bytes = 64 hex chars
      expect(/^[0-9a-fA-F]+$/.test(result.hash)).toBe(true) // Valid hex
      expect(typeof result.hash).toBe('string')
    })

    it('should generate consistent hash for same metadata', () => {
      const metadata = {key: 'value'}
      const result1 = createGovernanceAnchor('https://example.com', metadata)
      const result2 = createGovernanceAnchor('https://example.com', metadata)

      expect(result1.hash).toBe(result2.hash)
    })
  })

  describe('validateProposal', () => {
    it('should validate correct proposal', () => {
      const proposal: Proposal = {
        governanceAction: {
          type: 'parameterChange',
          actionId: {txHash: 'hash1' as TransactionHash, txIndex: 0},
        },
        anchor: {url: 'https://example.com', hash: 'hash123'},
        rewardAccount: 'stake_test1',
        deposit: '500000000',
      }

      const result = validateProposal(proposal)

      expect(result.valid).toBe(true)
    })

    it('should reject proposal without governance action', () => {
      const proposal = {
        anchor: {url: 'https://example.com', hash: 'hash123'},
        rewardAccount: 'stake_test1',
        deposit: '500000000',
      } as any

      const result = validateProposal(proposal)

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Governance action is required')
    })

    it('should reject proposal without anchor', () => {
      const proposal = {
        governanceAction: {
          type: 'parameter_change',
          id: {txHash: 'hash1' as TransactionHash, txIndex: 0},
        },
        rewardAccount: 'stake_test1',
        deposit: '500000000',
      } as any

      const result = validateProposal(proposal)

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Valid anchor is required')
    })

    it('should reject proposal without reward account', () => {
      const proposal = {
        governanceAction: {
          type: 'parameter_change',
          id: {txHash: 'hash1' as TransactionHash, txIndex: 0},
        },
        anchor: {url: 'https://example.com', hash: 'hash123'},
        deposit: '500000000',
      } as any

      const result = validateProposal(proposal)

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Reward account is required')
    })

    it('should reject proposal with invalid deposit', () => {
      const proposal: Proposal = {
        governanceAction: {
          type: 'parameterChange',
          actionId: {txHash: 'hash1' as TransactionHash, txIndex: 0},
        },
        anchor: {url: 'https://example.com', hash: 'hash123'},
        rewardAccount: 'stake_test1',
        deposit: '0',
      }

      const result = validateProposal(proposal)

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Valid deposit amount is required')
    })
  })
})
