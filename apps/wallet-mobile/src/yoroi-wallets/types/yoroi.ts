import {Datum} from '@emurgo/yoroi-lib'
import {App, Balance, Resolver} from '@yoroi/types'

import {NetworkManager, WalletMeta} from '../../features/WalletManager/common/types'
import {CardanoTypes, YoroiWallet} from '../cardano/types'
import {HWDeviceInfo} from '../hw'

export type YoroiUnsignedTx = YoroiTxInfo & {
  unsignedTx: CardanoTypes.UnsignedTx
}

export type YoroiSignedTx = YoroiTxInfo & {
  signedTx: CardanoTypes.SignedTx
}

export type YoroiTxInfo = {
  entries: YoroiEntry[]
  fee: Balance.Amounts
  change: YoroiEntry[]
  metadata: YoroiMetadata
  staking: YoroiStaking
  voting: YoroiVoting
  governance: boolean
}

export type YoroiStaking = {
  registrations?: YoroiEntry[]
  deregistrations?: YoroiEntry[]
  delegations?: YoroiEntry[]
  withdrawals?: YoroiEntry[]
}

export type YoroiVoting = {
  registration?: {
    votingPublicKey: string
    stakingPublicKey: string
    rewardAddress: string
    nonce: number
  }
}

export type Address = string
export type TokenId = string

export type YoroiTokenId = `${string}.${string}`

export type YoroiEntry = {
  address: Address
  amounts: Balance.Amounts
  datum?: Datum
}

export type YoroiMetadata = {
  [label: string]: string
}

export type YoroiTarget = {
  receiver: Resolver.Receiver
  entry: YoroiEntry
}

export type YoroiNftModerationStatus = 'consent' | 'blocked' | 'approved' | 'pending' | 'manual_review'

export type WalletFactory = {
  create({
    id,
    storage,
    mnemonic,
    password,
    networkManager,
  }: {
    id: string
    storage: App.Storage
    mnemonic: string
    password: string
    networkManager: NetworkManager
  }): Promise<YoroiWallet>

  createBip44({
    id,
    storage,
    accountPubKeyHex,
    hwDeviceInfo, // hw wallet
    isReadOnly, // readonly wallet
    networkManager,
  }: {
    accountPubKeyHex: string
    hwDeviceInfo: HWDeviceInfo | null
    id: string
    isReadOnly: boolean
    storage: App.Storage
    networkManager: NetworkManager
  }): Promise<YoroiWallet>

  restore({
    walletMeta,
    storage,
    networkManager,
  }: {
    storage: App.Storage
    walletMeta: WalletMeta
    networkManager: NetworkManager
  }): Promise<YoroiWallet>
}
