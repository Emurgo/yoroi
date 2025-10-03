import {App, Chain} from '@yoroi/types'

import {WasmModuleProxy, freeContext} from '@emurgo/cross-csl-core'

import {CardanoTypes} from '../types'
import {GovernanceApi} from './api'
import {parseDrepId} from './helpers'
import {StakingKeyState} from './types'

export type Config = {
  network: Chain.SupportedNetworks
  walletId: string
  cardano?: CardanoTypes.Wasm
  cslFactory?: (scope: string) => WasmModuleProxy
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
  validateAndParseDRepID: (drepID: string) => Promise<{
    type: 'key' | 'script'
    hash: string
    isValid: boolean
  }>
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

  // Cleanup method to free CSL resources
  cleanup: () => void
}

export const governanceManagerMaker = (config: Config): GovernanceManager => {
  return new Manager(config)
}

class Manager implements GovernanceManager {
  readonly network: Chain.Network
  private persistentCsl: WasmModuleProxy | null = null
  private persistentScopeId: string | null = null

  constructor(private config: Config) {
    this.network = config.network
  }

  private getPersistentCsl(): WasmModuleProxy {
    if (!this.persistentCsl && this.config.cslFactory) {
      this.persistentScopeId = `governance-${Date.now()}-${Math.random()}`
      this.persistentCsl = this.config.cslFactory(this.persistentScopeId)
    }
    return this.persistentCsl || this.config.cardano!
  }

  convertHexKeyHashToBech32Format(hexKeyHash: string): string {
    const csl = this.getPersistentCsl()
    const keyHash = csl.Ed25519KeyHash.fromHex(hexKeyHash)
    return keyHash.toBech32('drep')
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

      const {tx, slot, epoch, drep, drepKind} = response.drepDelegation
      return {
        drepDelegation: {
          action: 'drep',
          tx,
          slot,
          epoch,
          hash: drep,
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
    const csl = this.getPersistentCsl()
    const {
      Certificate,
      Ed25519KeyHash,
      Credential,
      VoteDelegation,
      DRep,
      ScriptHash,
    } = csl

    const stakingCredential = Credential.fromKeyhash(stakingKey.hash())

    const votingDelegation =
      type === 'key'
        ? DRep.newKeyHash(Ed25519KeyHash.fromBytes(Buffer.from(hash, 'hex')))
        : DRep.newScriptHash(ScriptHash.fromBytes(Buffer.from(hash, 'hex')))

    const certificate = Certificate.newVoteDelegation(
      VoteDelegation.new(stakingCredential, votingDelegation),
    )

    return certificate
  }

  createStakeRegistrationCertificate(
    stakingKey: CardanoTypes.PublicKey,
  ): CardanoTypes.Certificate {
    const csl = this.getPersistentCsl()
    const {Certificate, Credential, StakeRegistration} = csl

    const stakingCredential = Credential.fromKeyhash(stakingKey.hash())

    const certificate = Certificate.newStakeRegistration(
      StakeRegistration.new(stakingCredential),
    )

    return certificate
  }

  async validateDRepID(drepId: string): Promise<boolean> {
    const {hash} = this.parseDrepId(drepId)
    const drepStatus = await this.config.api.getDRepById(hash)

    if (!drepStatus || !drepStatus.epoch) {
      throw new Error('DRep ID not registered')
    }

    return true
  }

  async validateAndParseDRepID(drepId: string): Promise<{
    type: 'key' | 'script'
    hash: string
    isValid: boolean
  }> {
    const parsed = this.parseDrepId(drepId)

    try {
      const drepStatus = await this.config.api.getDRepById(parsed.hash)
      const isValid = !!(drepStatus && drepStatus.epoch)
      return {...parsed, isValid}
    } catch (error) {
      return {...parsed, isValid: false}
    }
  }

  private parseDrepId(drepId: string) {
    const csl = this.getPersistentCsl()
    return parseDrepId(drepId, csl)
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
    const csl = this.getPersistentCsl()
    const {Certificate, Credential, VoteDelegation, DRep} = csl

    const stakingCredential = Credential.fromKeyhash(stakingKey.hash())

    let certificate: CardanoTypes.Certificate
    if (vote === 'abstain') {
      certificate = Certificate.newVoteDelegation(
        VoteDelegation.new(stakingCredential, DRep.newAlwaysAbstain()),
      )
    } else if (vote === 'no-confidence') {
      certificate = Certificate.newVoteDelegation(
        VoteDelegation.new(stakingCredential, DRep.newAlwaysNoConfidence()),
      )
    } else {
      throw new Error('Invalid vote')
    }

    return certificate
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

  cleanup(): void {
    if (this.persistentScopeId) {
      try {
        freeContext(this.persistentScopeId)
      } catch (e) {
        // Ignore cleanup errors
      }
      this.persistentCsl = null
      this.persistentScopeId = null
    }
  }
}

const LATEST_ACTION_KEY = 'latest-action-v2'
