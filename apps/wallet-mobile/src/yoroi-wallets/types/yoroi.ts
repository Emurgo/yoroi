import {Datum} from '@emurgo/yoroi-lib'
import {App, Balance} from '@yoroi/types'

import {CardanoTypes, YoroiWallet} from '../cardano/types'
import {HWDeviceInfo} from '../hw'
import {WalletMeta} from '../walletManager'

export type YoroiUnsignedTx = YoroiTxInfo & {
  unsignedTx: CardanoTypes.UnsignedTx
}

export type YoroiSignedTx = YoroiTxInfo & {
  signedTx: CardanoTypes.SignedTx
}

export type YoroiTxInfo = {
  entries: YoroiEntries
  amounts: Balance.Amounts
  fee: Balance.Amounts
  change: YoroiEntries
  metadata: YoroiMetadata
  staking: YoroiStaking
  voting: YoroiVoting
  datum?: Datum
}

export type YoroiStaking = {
  registrations?: YoroiEntries
  deregistrations?: YoroiEntries
  delegations?: YoroiEntries
  withdrawals?: YoroiEntries
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

export type YoroiEntries = Record<string, Balance.Amounts>

export type YoroiEntry = {
  address: Address
  amounts: Balance.Amounts
}

export type YoroiMetadata = {
  [label: string]: string
}

export type YoroiTarget = {
  receiver: string
  entry: YoroiEntry
}

export type YoroiNftModerationStatus = 'consent' | 'blocked' | 'approved' | 'pending' | 'manual_review'

export type WalletFactory = {
  create({
    id,
    storage,
    mnemonic,
    password,
  }: {
    id: string
    storage: App.Storage
    mnemonic: string
    password: string
  }): Promise<YoroiWallet>

  createBip44({
    id,
    storage,
    accountPubKeyHex,
    hwDeviceInfo, // hw wallet
    isReadOnly, // readonly wallet
  }: {
    accountPubKeyHex: string
    hwDeviceInfo: HWDeviceInfo | null
    id: string
    isReadOnly: boolean
    storage: App.Storage
  }): Promise<YoroiWallet>

  restore({walletMeta, storage}: {storage: App.Storage; walletMeta: WalletMeta}): Promise<YoroiWallet>
}
