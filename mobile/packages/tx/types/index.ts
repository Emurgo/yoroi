import {
  Address,
  Addressing,
  Balance,
  BalanceQuantity,
  DatumCbor,
  DatumHash,
  TokenId,
  TransactionMetadata,
} from '@yoroi/types'

// Transaction types
// These are WASM types from CSL
import type {
  AuxiliaryData,
  Transaction as CSLTransaction,
  TransactionBody,
} from '@emurgo/cross-csl-core'

type Bip44DerivationLevel = {
  level: number
}

export type AmountWithReceiver = {
  receiver: Address
  amount: BalanceQuantity
}
// Re-export from @yoroi/types for backward compatibility
export type {StakingKeyBalances} from '@yoroi/types'

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
  remainingAmount: BalanceQuantity
  rewards: BalanceQuantity
  withdrawals: BalanceQuantity
}

export type WithdrawalRequest = {
  addressing: Addressing
  rewardAddress: Address
  shouldDeregister: boolean
}

// Re-export from @yoroi/types for backward compatibility
export type {CardanoAddressedUtxo, RemoteUnspentOutput} from '@yoroi/types'

export type Change = AddressingAddress & {
  amounts: Balance.Amounts
}

export type AddressingAddress = {
  address: Address
  addressing?: Addressing
}

export type {Address}
// Re-export from @yoroi/types for backward compatibility
export type {Addressing} from '@yoroi/types'

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

// RemoteUnspentOutput is now imported from @yoroi/types above

// @deprecated Use RemoteUnspentOutput.balance instead
export type UtxoAsset = {
  assetId: TokenId
  amount: BalanceQuantity
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
  metadata?: ReadonlyArray<TransactionMetadata>
}

// Re-export from @yoroi/types for backward compatibility
export type {MetadataDataValue, TransactionMetadata} from '@yoroi/types'

export type CardanoHaskellConfig = {
  keyDeposit: string
  linearFee: LinearFee
  minimumUtxoVal: string
  coinsPerUtxoByte: string
  poolDeposit: string
  networkId: number
  collateralPercentage?: string
  refScriptCoinsPerByte?: {numerator: string; denominator: string}
  /** PlutusV3 cost model values (array of integers). Required for Plutus script transactions. */
  plutusV3CostModel?: number[]
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
