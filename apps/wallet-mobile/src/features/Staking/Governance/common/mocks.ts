import {GovernanceManager} from '@yoroi/staking'

import {mockTransactionInfos} from '../../../../yoroi-wallets/mocks'

const governanceManager: GovernanceManager = {
  createDelegationCertificate: () => {
    return Promise.reject(new Error('mock not implemented'))
  },
  createLedgerDelegationPayload: () => {
    return Promise.reject(new Error('mock not implemented'))
  },
  getLatestGovernanceAction: () => {
    return Promise.reject(new Error('mock not implemented'))
  },
  setLatestGovernanceAction: () => {
    return Promise.reject(new Error('mock not implemented'))
  },
  createLedgerVotingPayload: () => {
    return Promise.reject(new Error('mock not implemented'))
  },
  validateDRepID: () => {
    return Promise.reject(new Error('mock not implemented'))
  },
  createVotingCertificate: () => {
    return Promise.reject(new Error('mock not implemented'))
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
