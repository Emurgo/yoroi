import AsyncStorage from '@react-native-async-storage/async-storage'
import {CardanoTypes} from '../cardanoMobile'
import {GovernanceApi} from './api'

export type Config = {
  networkId: number
  cardano: CardanoTypes.Wasm
  storage: typeof AsyncStorage
  api: GovernanceApi
}

export type VoteKind = 'abstain' | 'no-confidence'

export type GovernanceAction =
  | {
      kind: 'delegate-to-drep'
      drepID: string
      txID: string
    }
  | {
      kind: 'vote'
      vote: VoteKind
      txID: string
    }

export type GovernanceManager = {
  validateDRepID: (drepID: string) => Promise<void>
  createDelegationCertificate: (
    drepID: string,
    stakingKey: CardanoTypes.PublicKey,
  ) => Promise<CardanoTypes.Certificate>
  createLedgerDelegationPayload: (
    drepID: string,
    stakingKey: CardanoTypes.PublicKey,
  ) => Promise<object>
  createVotingCertificate: (
    vote: VoteKind,
    stakingKey: CardanoTypes.PublicKey,
  ) => Promise<CardanoTypes.Certificate>
  createLedgerVotingPayload: (
    vote: VoteKind,
    stakingKey: CardanoTypes.PublicKey,
  ) => Promise<object>

  // latest governance action to be used only to check the "pending" transaction that is not yet confirmed on the blockchain
  setLatestGovernanceAction: (action: GovernanceAction) => Promise<void>
  getLatestGovernanceAction: () => Promise<GovernanceAction | null>
}

export const createGovernanceManager = (config: Config): GovernanceManager => {
  return new Manager(config)
}

class Manager implements GovernanceManager {
  constructor(private config: Config) {}

  async createDelegationCertificate(
    drepID: string,
    stakingKey: CardanoTypes.PublicKey,
  ): Promise<CardanoTypes.Certificate> {
    const {Certificate, Ed25519KeyHash, StakeDelegation, StakeCredential} =
      this.config.cardano

    const credential = await StakeCredential.fromKeyhash(
      await stakingKey.hash(),
    )
    return await Certificate.newStakeDelegation(
      await StakeDelegation.new(
        credential,
        await Ed25519KeyHash.fromBytes(Buffer.from(drepID, 'hex')),
      ),
    )
  }

  async validateDRepID(drepId: string): Promise<void> {
    if (drepId.length !== 56) {
      throw new Error('invalid DRep ID length, must be 56 characters')
    }

    if (!/^[0-9a-fA-F]+$/.test(drepId)) {
      throw new Error('invalid DRep ID format, must be hexadecimal')
    }

    if (!(await this.config.api.isRegisteredDRep(drepId))) {
      throw new Error('DRep ID not registered')
    }
  }

  async createLedgerDelegationPayload(
    _drepID: string,
    _stakingKey: CardanoTypes.PublicKey,
  ): Promise<object> {
    throw new Error('Not implemented')
  }

  async createVotingCertificate(
    _vote: VoteKind,
    _stakingKey: CardanoTypes.PublicKey,
  ): Promise<CardanoTypes.Certificate> {
    throw new Error('Not implemented')
  }

  async createLedgerVotingPayload(
    _vote: VoteKind,
    _stakingKey: CardanoTypes.PublicKey,
  ): Promise<object> {
    throw new Error('Not implemented')
  }

  async setLatestGovernanceAction(action: GovernanceAction): Promise<void> {
    await this.config.storage.setItem(
      governanceStorageLatestActionKey,
      JSON.stringify(action),
    )
  }

  async getLatestGovernanceAction(): Promise<GovernanceAction | null> {
    try {
      const action = await this.config.storage.getItem(
        governanceStorageLatestActionKey,
      )
      return action ? JSON.parse(action) : null
    } catch {
      return null
    }
  }
}

const governanceStorageLatestActionKey = 'governance-manager/latest-action'
