import {GovernanceManager} from './manager'

export const managerMock: GovernanceManager = {
  validateDRepID: () => Promise.reject(new Error('Mock not implemented')),
  getStakingKeyState: () =>
    Promise.resolve({
      drepDelegation: {action: 'no-confidence', tx: 'txId', slot: 1, epoch: 1},
    }),
  createDelegationCertificate: () =>
    Promise.reject(new Error('Mock not implemented')),
  createLedgerDelegationPayload: () =>
    Promise.reject(new Error('Mock not implemented')),
  createVotingCertificate: () =>
    Promise.reject(new Error('Mock not implemented')),
  createLedgerVotingPayload: () =>
    Promise.reject(new Error('Mock not implemented')),
  setLatestGovernanceAction: () =>
    Promise.reject(new Error('Mock not implemented')),
  getLatestGovernanceAction: () =>
    Promise.reject(new Error('Mock not implemented')),
  createStakeRegistrationCertificate: () =>
    Promise.reject(new Error('Mock not implemented')),
}
