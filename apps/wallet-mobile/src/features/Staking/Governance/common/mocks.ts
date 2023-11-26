import {GovernanceManager} from '@yoroi/staking'
import {mockTransactionInfos} from '../../../../yoroi-wallets/mocks'

const governanceManager: GovernanceManager = {
  createDelegationCertificate: async () => {
    throw new Error('mock not implemented')
  },
  createLedgerDelegationPayload: async () => {
    throw new Error('mock not implemented')
  },
  getLatestGovernanceAction: async () => {
    throw new Error('mock not implemented')
  },
  setLatestGovernanceAction: async () => {
    throw new Error('mock not implemented')
  },
  createLedgerVotingPayload: async () => {
    throw new Error('mock not implemented')
  },
  validateDRepID: async () => {
    throw new Error('mock not implemented')
  },
  createVotingCertificate: async () => {
    throw new Error('mock not implemented')
  },
}

const votingDelegationTxInfo = {
  ...mockTransactionInfos['ef147cbd5ccb0b0907a2969a697aeb06117ac83f284ddfae53a4198b03719b52'],
  metadata: {1: {actionId: 3, drepID: 'drep1wdt7ryc567pauvc5a93rt5mnzpx6y2rh6mvtu5phehmj5lkqjgx'}},
}

const votingNoConfidenceTxInfo = {
  ...mockTransactionInfos['ef147cbd5ccb0b0907a2969a697aeb06117ac83f284ddfae53a4198b03719b52'],
  metadata: {1: {actionId: 2}},
}

const votingAbstainTxInfo = {
  ...mockTransactionInfos['ef147cbd5ccb0b0907a2969a697aeb06117ac83f284ddfae53a4198b03719b52'],
  metadata: {1: {actionId: 1}},
}

export const mocks = {
  governanceManager,
  votingDelegationTxInfo,
  votingNoConfidenceTxInfo,
  votingAbstainTxInfo,
}
