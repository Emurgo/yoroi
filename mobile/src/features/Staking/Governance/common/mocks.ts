import {GovernanceManager, StakingKeyState} from '@yoroi/staking'
import {Chain} from '@yoroi/types'

const governanceManager: GovernanceManager = {
  network: Chain.Network.Mainnet,
  getStakingKeyState: () => {
    return Promise.resolve({
      drepDelegation: {action: 'no-confidence', tx: 'txId', slot: 1, epoch: 1},
    })
  },
  convertHexKeyHashToBech32Format: () => {
    return 'drep1r73ah4wa3zqhw2fpnzyyj2lnya5zwjftkakgfk094y3mkerc53c'
  },
  createStakeRegistrationCertificate: () => {
    throw new Error('mock not implemented')
  },
  createDelegationCertificate: () => {
    throw new Error('mock not implemented')
  },
  createLedgerDelegationPayload: () => {
    throw new Error('mock not implemented')
  },
  getLatestGovernanceAction: () => {
    throw new Error('mock not implemented')
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
    throw new Error('mock not implemented')
  },
}

const votedAbstainStakeKeyState: StakingKeyState = {
  drepDelegation: {
    action: 'abstain',
    tx: 'txId',
    slot: 1,
    epoch: 1,
  },
}

const votedNoConfidenceStakeKeyState: StakingKeyState = {
  drepDelegation: {
    action: 'no-confidence',
    tx: 'txId',
    slot: 1,
    epoch: 1,
  },
}

const votedDrepStakeKeyState: StakingKeyState = {
  drepDelegation: {
    action: 'drep',
    tx: 'txId',
    slot: 1,
    epoch: 1,
    hash: 'drepId',
    type: 'key',
  },
}

export const mocks = {
  governanceManager,
  votedAbstainStakeKeyState,
  votedNoConfidenceStakeKeyState,
  votedDrepStakeKeyState,
}
