import {getLogger, isLeft} from '@yoroi/common'
import {App, Branded, Chain} from '@yoroi/types'

import {CardanoTypes} from '../types'
import {GovernanceApi} from './api'
import {convertHexKeyHashToBech32Format, parseDrepId} from './helpers'
import {StakingKeyState} from './types'

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
      hash: string
      type: 'script' | 'key'
      txID: string
    }
  | {
      kind: 'vote'
      vote: VoteKind
      txID: string
    }

export type GovernanceManager = {
  readonly network: Chain.Network
  validateDRepID: (drepID: string) => Promise<boolean>
  createDelegationCertificate: (
    hash: string,
    type: 'script' | 'key',
    stakingKey: CardanoTypes.PublicKey,
  ) => CardanoTypes.Certificate
  createLedgerDelegationPayload: (
    hash: string,
    type: 'script' | 'key',
    stakingKey: CardanoTypes.PublicKey,
  ) => Promise<object>
  createVotingCertificate: (
    vote: VoteKind,
    stakingKey: CardanoTypes.PublicKey,
  ) => CardanoTypes.Certificate
  createLedgerVotingPayload: (
    vote: VoteKind,
    stakingKey: CardanoTypes.PublicKey,
  ) => Promise<object>
  createStakeRegistrationCertificate: (
    stakingKey: CardanoTypes.PublicKey,
  ) => CardanoTypes.Certificate

  // latest governance action to be used only to check the "pending" transaction that is not yet confirmed on the blockchain
  setLatestGovernanceAction: (action: GovernanceAction | null) => Promise<void>
  getLatestGovernanceAction: () => Promise<GovernanceAction | null>

  getStakingKeyState: (stakeKeyHash: string) => Promise<StakingKeyState>
  convertHexKeyHashToBech32Format: (hexKeyHash: string) => string
}

export const governanceManagerMaker = (config: Config): GovernanceManager => {
  return new Manager(config)
}

class Manager implements GovernanceManager {
  readonly network: Chain.Network
  constructor(private config: Config) {
    this.network = config.network
  }

  convertHexKeyHashToBech32Format(hexKeyHash: string): string {
    return convertHexKeyHashToBech32Format(hexKeyHash, this.config.cardano)
  }

  async getStakingKeyState(stakeKeyHash: string): Promise<StakingKeyState> {
    const {api} = this.config
    const logger = getLogger()
    const response = await api.getStakingKeyState(stakeKeyHash)

    if (isLeft(response)) {
      logger.error('Failed to fetch staking key state', {
        stakeKeyHash,
        error: response.error,
      })
      return {}
    }

    const {data} = response.value

    if (data.drepDelegation) {
      if (data.drepDelegation.drep === 'no_confidence') {
        const {tx, slot, epoch} = data.drepDelegation
        return {
          drepDelegation: {
            action: 'no-confidence',
            tx: Branded.asTransactionHash(tx),
            slot: Branded.asSlotNumber(slot),
            epoch: Branded.asEpochNumber(epoch),
          },
        } as const
      }
      if (data.drepDelegation.drep === 'abstain') {
        const {tx, slot, epoch} = data.drepDelegation
        return {
          drepDelegation: {
            action: 'abstain',
            tx: Branded.asTransactionHash(tx),
            slot: Branded.asSlotNumber(slot),
            epoch: Branded.asEpochNumber(epoch),
          },
        } as const
      }

      const {tx, slot, epoch, drep, drepKind} = data.drepDelegation
      return {
        drepDelegation: {
          action: 'drep',
          tx: Branded.asTransactionHash(tx),
          slot: Branded.asSlotNumber(slot),
          epoch: Branded.asEpochNumber(epoch),
          hash: Branded.asDRepId(drep),
          type: drepKind === 'scripthash' ? 'script' : 'key',
        },
      } as const
    }
    return {}
  }

  createDelegationCertificate(
    hash: string,
    type: 'script' | 'key',
    stakingKey: CardanoTypes.PublicKey,
  ): CardanoTypes.Certificate {
    const {
      Certificate,
      Ed25519KeyHash,
      Credential,
      VoteDelegation,
      DRep,
      ScriptHash,
    } = this.config.cardano

    const stakingCredential = Credential.fromKeyhash(stakingKey.hash())

    const votingDelegation =
      type === 'key'
        ? DRep.newKeyHash(Ed25519KeyHash.fromBytes(Buffer.from(hash, 'hex')))
        : DRep.newScriptHash(ScriptHash.fromBytes(Buffer.from(hash, 'hex')))

    return Certificate.newVoteDelegation(
      VoteDelegation.new(stakingCredential, votingDelegation),
    )
  }

  createStakeRegistrationCertificate(
    stakingKey: CardanoTypes.PublicKey,
  ): CardanoTypes.Certificate {
    const {Certificate, Credential, StakeRegistration} = this.config.cardano

    const stakingCredential = Credential.fromKeyhash(stakingKey.hash())

    return Certificate.newStakeRegistration(
      StakeRegistration.new(stakingCredential),
    )
  }

  async validateDRepID(drepId: string): Promise<boolean> {
    const {hash} = parseDrepId(drepId, this.config.cardano)
    const response = await this.config.api.getDRepById(Branded.asDRepId(hash))

    if (isLeft(response)) {
      getLogger().error('DRep validation failed', {
        drepId,
        error: response.error,
      })
      throw new Error('DRep ID not registered')
    }

    const drepStatus = response.value.data

    if (!drepStatus || !drepStatus.epoch) {
      throw new Error('DRep ID not registered')
    }

    return true
  }

  async createLedgerDelegationPayload(
    _drepID: string,
    _type: 'script' | 'key',
    _stakingKey: CardanoTypes.PublicKey,
  ): Promise<object> {
    throw new Error('Not implemented')
  }

  createVotingCertificate(
    vote: VoteKind,
    stakingKey: CardanoTypes.PublicKey,
  ): CardanoTypes.Certificate {
    const {Certificate, Credential, VoteDelegation, DRep} = this.config.cardano

    const stakingCredential = Credential.fromKeyhash(stakingKey.hash())

    if (vote === 'abstain') {
      return Certificate.newVoteDelegation(
        VoteDelegation.new(stakingCredential, DRep.newAlwaysAbstain()),
      )
    }

    if (vote === 'no-confidence') {
      return Certificate.newVoteDelegation(
        VoteDelegation.new(stakingCredential, DRep.newAlwaysNoConfidence()),
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
      await this.config.storage
        .join(`${this.config.network}/`)
        .removeItem(LATEST_ACTION_KEY)
      return
    }
    await this.config.storage
      .join(`${this.config.network}/`)
      .setItem(LATEST_ACTION_KEY, action)
  }

  async getLatestGovernanceAction(): Promise<GovernanceAction | null> {
    try {
      return await this.config.storage
        .join(`${this.config.network}/`)
        .getItem(LATEST_ACTION_KEY)
    } catch {
      return null
    }
  }
}

const LATEST_ACTION_KEY = 'latest-action-v2'
