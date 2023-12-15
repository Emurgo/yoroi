import AsyncStorage from '@react-native-async-storage/async-storage'
import {CardanoTypes} from '../types'
import {GovernanceApi} from './api'
import {parseDrepId} from './helpers'
import {StakingKeyState} from './types'

export type Config = {
  networkId: number
  walletId: string
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
  createStakeRegistrationCertificate: (
    stakingKey: CardanoTypes.PublicKey,
  ) => Promise<CardanoTypes.Certificate>

  // latest governance action to be used only to check the "pending" transaction that is not yet confirmed on the blockchain
  setLatestGovernanceAction: (action: GovernanceAction | null) => Promise<void>
  getLatestGovernanceAction: () => Promise<GovernanceAction | null>

  getStakingKeyState: (stakeKeyHash: string) => Promise<StakingKeyState>
}

export const governanceManagerMaker = (config: Config): GovernanceManager => {
  return new Manager(config)
}

class Manager implements GovernanceManager {
  constructor(private config: Config) {}

  async getStakingKeyState(stakeKeyHash: string) {
    const {api} = this.config
    const response = await api.getStakingKeyState(stakeKeyHash)
    if (response.drepDelegation) {
      if (response.drepDelegation.drep === 'no_confidence') {
        const {tx, slot, epoch} = response.drepDelegation
        return {
          drepDelegation: {action: 'no-confidence', tx, slot, epoch},
        } as const
      }
      if (response.drepDelegation.drep === 'abstain') {
        const {tx, slot, epoch} = response.drepDelegation
        return {
          drepDelegation: {action: 'abstain', tx, slot, epoch},
        } as const
      }

      const {tx, slot, epoch, drep} = response.drepDelegation
      return {
        drepDelegation: {action: 'drep', tx, slot, epoch, drepID: drep},
      } as const
    }
    return {}
  }

  async createDelegationCertificate(
    drepID: string,
    stakingKey: CardanoTypes.PublicKey,
  ): Promise<CardanoTypes.Certificate> {
    const {Certificate, Ed25519KeyHash, Credential, VoteDelegation, DRep} =
      this.config.cardano

    const stakingCredential = await Credential.fromKeyhash(
      await stakingKey.hash(),
    )

    return await Certificate.newVoteDelegation(
      await VoteDelegation.new(
        stakingCredential,
        await DRep.newKeyHash(
          await Ed25519KeyHash.fromBytes(Buffer.from(drepID, 'hex')),
        ),
      ),
    )
  }

  async createStakeRegistrationCertificate(
    stakingKey: CardanoTypes.PublicKey,
  ): Promise<CardanoTypes.Certificate> {
    const {Certificate, Credential, StakeRegistration} = this.config.cardano

    const stakingCredential = await Credential.fromKeyhash(
      await stakingKey.hash(),
    )

    return await Certificate.newStakeRegistration(
      await StakeRegistration.new(stakingCredential),
    )
  }

  async validateDRepID(drepId: string): Promise<void> {
    const drepKeyHash = await parseDrepId(drepId, this.config.cardano)
    const drepStatus = await this.config.api.getDRepById(drepKeyHash)

    if (!drepStatus || !drepStatus.epoch) {
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
    vote: VoteKind,
    stakingKey: CardanoTypes.PublicKey,
  ): Promise<CardanoTypes.Certificate> {
    const {Certificate, Credential, VoteDelegation, DRep} = this.config.cardano

    const stakingCredential = await Credential.fromKeyhash(
      await stakingKey.hash(),
    )

    if (vote === 'abstain') {
      return await Certificate.newVoteDelegation(
        await VoteDelegation.new(
          stakingCredential,
          await DRep.newAlwaysAbstain(),
        ),
      )
    }

    if (vote === 'no-confidence') {
      return await Certificate.newVoteDelegation(
        await VoteDelegation.new(
          stakingCredential,
          await DRep.newAlwaysNoConfidence(),
        ),
      )
    }

    throw new Error('Invalid vote')
  }

  async createLedgerVotingPayload(
    _vote: VoteKind,
    _stakingKey: CardanoTypes.PublicKey,
  ): Promise<object> {
    throw new Error('Not implemented')
  }

  async setLatestGovernanceAction(
    action: GovernanceAction | null,
  ): Promise<void> {
    if (!action) {
      await this.config.storage.removeItem(
        getGovernanceStorageLatestActionKey(this.config.walletId),
      )
      return
    }
    await this.config.storage.setItem(
      getGovernanceStorageLatestActionKey(this.config.walletId),
      JSON.stringify(action),
    )
  }

  async getLatestGovernanceAction(): Promise<GovernanceAction | null> {
    try {
      const action = await this.config.storage.getItem(
        getGovernanceStorageLatestActionKey(this.config.walletId),
      )
      return action ? JSON.parse(action) : null
    } catch {
      return null
    }
  }
}

const getGovernanceStorageLatestActionKey = (walletId: string) => {
  return `${walletId}/governance-manager/latest-action`
}
