import {CardanoTypes} from '../cardano'
import {NFTMetadata} from './tokens'

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

export type YoroiNFT = {
  id: string
  name: string
  description: string
  image: string
  thumbnail: string
  metadata: {
    policyId: string
    assetNameHex: string
    originalMetadata: NFTMetadata
  }
}

export type YoroiNFTModerationStatus = 'consent' | 'blocked' | 'approved' | 'pending' | 'manual_review'
