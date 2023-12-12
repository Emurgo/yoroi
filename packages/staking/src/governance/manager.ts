import AsyncStorage from '@react-native-async-storage/async-storage'
import {CardanoTypes} from '../types'
import {GovernanceApi} from './api'

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

  // latest governance action to be used only to check the "pending" transaction that is not yet confirmed on the blockchain
  setLatestGovernanceAction: (action: GovernanceAction | null) => Promise<void>
  getLatestGovernanceAction: () => Promise<GovernanceAction | null>
}

export const governanceManagerMaker = (config: Config): GovernanceManager => {
  return new Manager(config)
}

class Manager implements GovernanceManager {
  constructor(private config: Config) {}

  async createDelegationCertificate(
    drepID: string,
    stakingKey: CardanoTypes.PublicKey,
  ): Promise<CardanoTypes.Certificate> {
    const {Certificate, Ed25519KeyHash, StakeDelegation, Credential} =
      this.config.cardano

    const credential = await Credential.fromKeyhash(await stakingKey.hash())
    return await Certificate.newStakeDelegation(
      await StakeDelegation.new(
        credential,
        await Ed25519KeyHash.fromBytes(Buffer.from(drepID, 'hex')),
      ),
    )
  }

  async validateDRepID(drepId: string): Promise<void> {
    const isValidBech32 =
      drepId.startsWith('drep1') &&
      (await isValidDrepBech32Format(drepId, this.config.cardano))
    const isValidKeyHash = drepId.length === 56 && /^[0-9a-fA-F]+$/.test(drepId)

    if (!isValidBech32 && !isValidKeyHash) {
      const message =
        'Invalid DRep ID. Must have a valid bech32 format or a valid key hash format'
      throw new Error(message)
    }

    const drepKeyHash = isValidKeyHash
      ? drepId
      : await convertBech32ToKeyHash(drepId, this.config.cardano)
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
    _vote: VoteKind,
    _stakingKey: CardanoTypes.PublicKey,
  ): Promise<CardanoTypes.Certificate> {
    // TODO: will come from yoroi-lib
    throw new Error('Not implemented')
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

const isValidDrepBech32Format = async (
  drepId: string,
  cardano: CardanoTypes.Wasm,
): Promise<boolean> => {
  try {
    await cardano.Ed25519KeyHash.fromBech32(drepId)
    return true
  } catch (e) {
    return false
  }
}

const convertBech32ToKeyHash = async (
  drepId: string,
  cardano: CardanoTypes.Wasm,
): Promise<string> => {
  const keyHash = await cardano.Ed25519KeyHash.fromBech32(drepId)
  return await keyHash.toHex()
}

const getGovernanceStorageLatestActionKey = (walletId: string) => {
  return `${walletId}/governance-manager/latest-action`
}
