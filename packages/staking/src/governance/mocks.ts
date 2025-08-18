import {Chain} from '@yoroi/types'

import {GovernanceManager} from './manager'

// Mock certificate object
const mockCertificate = {
  toBytes: () => new Uint8Array([1, 2, 3, 4]),
  toHex: () => '01020304',
  toJson: () => ({}),
  kind: () => 0,
} as any

export const managerMock: GovernanceManager = {
  network: Chain.Network.Mainnet,
  convertHexKeyHashToBech32Format: () =>
    'drep1r73ah4wa3zqhw2fpnzyyj2lnya5zwjftkakgfk094y3mkerc53c',
  validateDRepID: () => Promise.reject(new Error('Mock not implemented')),
  getStakingKeyState: () =>
    Promise.resolve({
      drepDelegation: {action: 'no-confidence', tx: 'txId', slot: 1, epoch: 1},
    }),
  createDelegationCertificate: () => mockCertificate,
  createLedgerDelegationPayload: () =>
    Promise.reject(new Error('Mock not implemented')),
  createVotingCertificate: () => mockCertificate,
  createLedgerVotingPayload: () =>
    Promise.reject(new Error('Mock not implemented')),
  setLatestGovernanceAction: () =>
    Promise.reject(new Error('Mock not implemented')),
  getLatestGovernanceAction: () =>
    Promise.reject(new Error('Mock not implemented')),
  createStakeRegistrationCertificate: () => mockCertificate,
}
