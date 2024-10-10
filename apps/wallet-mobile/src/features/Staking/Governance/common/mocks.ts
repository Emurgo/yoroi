import {GovernanceManager} from '@yoroi/staking'
import {StakingKeyState} from '@yoroi/staking/src'
import {Chain} from '@yoroi/types'

const governanceManager: GovernanceManager = {
  network: Chain.Network.Mainnet,
  getStakingKeyState: () => {
    return Promise.resolve({
      drepDelegation: {action: 'no-confidence', tx: 'txId', slot: 1, epoch: 1},
    })
  },
  convertHexKeyHashToBech32Format: () => {
    return Promise.resolve('drep1r73ah4wa3zqhw2fpnzyyj2lnya5zwjftkakgfk094y3mkerc53c')
  },
  createStakeRegistrationCertificate: () => {
    return Promise.reject(new Error('mock not implemented'))
  },
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
    drepID: 'drepId',
  },
}

export const mocks = {
  governanceManager,
  votedAbstainStakeKeyState,
  votedNoConfidenceStakeKeyState,
  votedDrepStakeKeyState,
}
