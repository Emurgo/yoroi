import {GovernanceManager} from './manager'

export const managerMock: GovernanceManager = {
  validateDRepID: () => Promise.reject(new Error('Not implemented')),
  createDelegationCertificate: () =>
    Promise.reject(new Error('Not implemented')),
  createLedgerDelegationPayload: () =>
    Promise.reject(new Error('Not implemented')),
  createVotingCertificate: () => Promise.reject(new Error('Not implemented')),
  createLedgerVotingPayload: () => Promise.reject(new Error('Not implemented')),
  setLatestGovernanceAction: () => Promise.reject(new Error('Not implemented')),
  getLatestGovernanceAction: () => Promise.reject(new Error('Not implemented')),
}
