import {CardanoTypes} from '../types'
import {GovernanceApi} from './api'
import {convertHexKeyHashToBech32Format, parseDrepId} from './helpers'
import {StakingKeyState} from './types'
import {App, Chain} from '@yoroi/types'

export type Config = {
  network: Chain.SupportedNetworks
  walletId: string
  cardano: CardanoTypes.Wasm
  storage: App.Storage
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
  convertHexKeyHashToBech32Format: (hexKeyHash: string) => Promise<string>
}

export const governanceManagerMaker = (config: Config): GovernanceManager => {
  return new Manager(config)
}

class Manager implements GovernanceManager {
  constructor(private config: Config) {}

  async convertHexKeyHashToBech32Format(hexKeyHash: string): Promise<string> {
    return await convertHexKeyHashToBech32Format(
      hexKeyHash,
      this.config.cardano,
    )
  }

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
      await this.config.storage.removeItem(LATEST_ACTION_KEY)
      return
    }
    await this.config.storage.setItem(LATEST_ACTION_KEY, action)
  }

  async getLatestGovernanceAction(): Promise<GovernanceAction | null> {
    try {
      return await this.config.storage.getItem(LATEST_ACTION_KEY)
    } catch {
      return null
    }
  }
}

const LATEST_ACTION_KEY = 'latest-action'
