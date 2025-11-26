import {createTransactionBuilder} from '../transaction-builder/builder'
import type {Vote} from './types'
import {
  addVote,
  createVoter,
  createVotingProcedure,
  validateVote,
} from './voting'

describe('governance voting', () => {
  describe('addVote', () => {
    it('should add vote to metadata', () => {
      const state = createTransactionBuilder()
      const vote: Vote = {
        governanceActionId: {txHash: 'hash1', txIndex: 0},
        votingProcedure: {vote: 'yes'},
        voter: {type: 'drep', credential: 'cred1'},
      }

      const newState = addVote(state, vote)

      expect(newState.metadata).toHaveLength(1)
      expect(newState.metadata[0]?.label).toBe('governance_vote')
      expect(newState.metadata[0]?.data).toHaveProperty('governanceActionId')
      expect(newState.metadata[0]?.data).toHaveProperty('votingProcedure')
    })
  })

  describe('createVoter', () => {
    it('should create drep voter', () => {
      const result = createVoter('drep', 'cred1')

      expect(result).toEqual({
        type: 'drep',
        credential: 'cred1',
      })
    })

    it('should create pool voter', () => {
      const result = createVoter('pool', 'pool1')

      expect(result).toEqual({
        type: 'pool',
        credential: 'pool1',
      })
    })

    it('should create committee voter', () => {
      const result = createVoter('committee', 'comm1')

      expect(result).toEqual({
        type: 'committee',
        credential: 'comm1',
      })
    })
  })

  describe('createVotingProcedure', () => {
    it('should create voting procedure without anchor', () => {
      const result = createVotingProcedure('yes')

      expect(result).toEqual({
        vote: 'yes',
        anchor: undefined,
      })
    })

    it('should create voting procedure with anchor', () => {
      const anchor = {url: 'https://example.com', hash: 'hash123'}
      const result = createVotingProcedure('no', anchor)

      expect(result).toEqual({
        vote: 'no',
        anchor,
      })
    })

    it('should support abstain vote', () => {
      const result = createVotingProcedure('abstain')

      expect(result.vote).toBe('abstain')
    })
  })

  describe('validateVote', () => {
    it('should validate correct vote', () => {
      const vote: Vote = {
        governanceActionId: {txHash: 'hash1', txIndex: 0},
        votingProcedure: {vote: 'yes'},
        voter: {type: 'drep', credential: 'cred1'},
      }

      const result = validateVote(vote)

      expect(result.valid).toBe(true)
    })

    it('should reject vote without voter', () => {
      const vote = {
        governanceActionId: {txHash: 'hash1', txIndex: 0},
        votingProcedure: {vote: 'yes'},
      } as any

      const result = validateVote(vote)

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Valid voter is required')
    })

    it('should reject vote without governance action ID', () => {
      const vote = {
        votingProcedure: {vote: 'yes'},
        voter: {type: 'drep', credential: 'cred1'},
      } as any

      const result = validateVote(vote)

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Governance action ID is required')
    })

    it('should reject vote without voting procedure', () => {
      const vote = {
        governanceActionId: {txHash: 'hash1', txIndex: 0},
        voter: {type: 'drep', credential: 'cred1'},
      } as any

      const result = validateVote(vote)

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Valid voting procedure is required')
    })
  })
})
