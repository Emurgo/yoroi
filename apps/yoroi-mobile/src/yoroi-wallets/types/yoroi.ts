import {CardanoTypes, YoroiWallet} from '../cardano/types'
import {HWDeviceInfo} from '../hw'
import {YoroiStorage} from '../storage'
import {WalletMeta} from '../walletManager'
import {NftMetadata} from './tokens'

export type YoroiUnsignedTx = YoroiTxInfo & {
  unsignedTx: CardanoTypes.UnsignedTx
}

export type YoroiSignedTx = YoroiTxInfo & {
  signedTx: CardanoTypes.SignedTx
}

export type YoroiTxInfo = {
  entries: YoroiEntries
  amounts: YoroiAmounts
  fee: YoroiAmounts
  change: YoroiEntries
  metadata: YoroiMetadata
  staking: YoroiStaking
  voting: YoroiVoting
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
export type Quantity = `${number}`
export type TokenId = string

export type YoroiEntries = Record<string, YoroiAmounts>

export type YoroiEntry = {
  address: Address
  amounts: YoroiAmounts
}

export type YoroiAmounts = {
  [tokenId: TokenId]: Quantity
}

export type YoroiAmount = {
  tokenId: TokenId
  quantity: Quantity
}

export type YoroiMetadata = {
  [label: string]: string
}

export type YoroiNft = {
  id: string
  name: string
  description: string | undefined
  logo: string | undefined
  thumbnail: string | undefined
  fingerprint: string
  metadata: {
    policyId: string
    assetNameHex: string
    originalMetadata: NftMetadata | undefined
  }
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
    storage: YoroiStorage
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
    storage: YoroiStorage
  }): Promise<YoroiWallet>

  restore({walletMeta, storage}: {storage: YoroiStorage; walletMeta: WalletMeta}): Promise<YoroiWallet>
}
