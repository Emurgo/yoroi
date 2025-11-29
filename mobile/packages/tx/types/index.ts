import {
  Address,
  Amount,
  Balance,
  DatumCbor,
  DatumHash,
  KeyHash,
  TokenId,
  TransactionHash,
  UtxoId,
} from '@yoroi/types'

// Transaction types
// These are WASM types from CSL
import type {
  AuxiliaryData,
  Transaction as CSLTransaction,
  TransactionBody,
} from '@emurgo/cross-csl-core'

interface Bip44DerivationLevel {
  level: number
}

export type AmountWithReceiver = {
  receiver: Address
  amount: Amount
}
export type StakingKeyBalances = {[key: KeyHash]: Amount}

export enum RegistrationStatus {
  DelegateOnly,
  RegisterAndDelegate,
  Deregister,
}

export const Bip44DerivationLevels = {
  ROOT: {
    level: 0,
  } as Bip44DerivationLevel,
  PURPOSE: {
    level: 1,
  } as Bip44DerivationLevel,
  COIN_TYPE: {
    level: 2,
  } as Bip44DerivationLevel,
  ACCOUNT: {
    level: 3,
  } as Bip44DerivationLevel,
  CHAIN: {
    level: 4,
  } as Bip44DerivationLevel,
  ADDRESS: {
    level: 5,
  } as Bip44DerivationLevel,
}

export type AccountStatePart = {
  remainingAmount: Amount
  rewards: Amount
  withdrawals: Amount
}

export type WithdrawalRequest = {
  addressing: Addressing
  rewardAddress: Address
  shouldDeregister: boolean
}

export type CardanoAddressedUtxo = RemoteUnspentOutput & {
  addressing: Addressing
}

export type Change = AddressingAddress & {
  amounts: Balance.Amounts
}

export type AddressingAddress = {
  address: Address
  addressing?: Addressing
}

export type {Address}

export type Addressing = {
  path: number[]
  startLevel: number
}

export type TxOutput = {
  address: Address
  amounts: Balance.Amounts
  datum?: Datum
}

export type Datum =
  | {
      hash: DatumHash
    }
  | {
      data: DatumCbor
    }

// Modern UTXO format using Balance.Amounts
export type RemoteUnspentOutput = {
  receiver: Address
  txHash: TransactionHash
  txIndex: number
  utxoId: UtxoId
  balance: Balance.Amounts // Record<TokenId, Quantity> - modern format
}

// @deprecated Use RemoteUnspentOutput.balance instead
export type UtxoAsset = {
  assetId: TokenId
  amount: Amount
}

export type SendToken = {
  amount: BigNumber
  token: Token
  shouldSendAll: boolean
}

export type Token = {
  identifier: TokenId
  isDefault: boolean
}

export type TokenEntry = {
  amount: BigNumber
  identifier: TokenId
}

export type TxOptions = {
  metadata?: ReadonlyArray<TxMetadata>
}

export type TxMetadata = {
  label: string
  data: any
}

export type CardanoHaskellConfig = {
  keyDeposit: string
  linearFee: LinearFee
  minimumUtxoVal: string
  coinsPerUtxoByte: string
  poolDeposit: string
  networkId: number
}

// UnsignedTx type - matches TransactionBody structure
export type UnsignedTx = TransactionBody
export type SignedTx = CSLTransaction

// Extended type for runtime objects that have additional properties
// This is used internally where we know the object has these properties
export type UnsignedTxWithProperties = TransactionBody & {
  readonly txBody: TransactionBody
  readonly auxiliaryData?: AuxiliaryData | null
  readonly catalystRegistrationData?: unknown
}

export type LinearFee = {
  coefficient: string
  constant: string
}

export enum MetadataJsonSchema {
  NoConversions = 0,
  BasicConversions = 1,
  DetailedSchema = 2,
}

export enum CatalystLabels {
  DATA = 61284,
  SIG = 61285,
}

export enum CoinType {
  CARDANO = 2147485463, // HARD_DERIVATION_START + 1815;
  ERGO = 2147484077, // HARD_DERIVATION_START + 429;
}
