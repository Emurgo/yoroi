export * from './catalyst'
export * from './chain'
export * from './MultiToken'
export * from './shelley'
export * from './ShelleyWallet'
export * from './types'
import {WalletChecksum as WalletChecksumType} from '@emurgo/cip4-js'
import * as CoreTypes from '@emurgo/cross-csl-core'
import {init} from '@emurgo/cross-csl-mobile'
import {
  Addressing as AddressingType,
  CardanoAddressedUtxo as CardanoAddressedUtxoType,
  createYoroiLib,
  MultiTokenValue as MultiTokenValueType,
  SignedTx as SignedTxType,
  StakingKeyBalances as StakingKeyBalancesType,
  TokenEntry as TokenEntryType,
  TxMetadata as TxMetadataType,
  UnsignedTx as UnsignedTxType,
} from '@emurgo/yoroi-lib'

export {legacyWalletChecksum, walletChecksum} from '@emurgo/cip4-js'
export {RegistrationStatus} from '@emurgo/yoroi-lib'

export const CardanoMobile = init()
export {AssetOverflowError, NoOutputsError, NotEnoughMoneyToSendError} from '@emurgo/yoroi-lib/dist/errors'
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace CardanoTypes {
  export type TxMetadata = TxMetadataType
  export type CardanoAddressedUtxo = CardanoAddressedUtxoType
  export type SignedTx = SignedTxType
  export type UnsignedTx = UnsignedTxType
  export type MultiTokenValue = MultiTokenValueType
  export type StakingKeyBalances = StakingKeyBalancesType
  export type WalletChecksum = WalletChecksumType

  export type Address = CoreTypes.Address
  export type Addressing = AddressingType
  export type AssetName = CoreTypes.AssetName
  export type BigNum = CoreTypes.BigNum
  export type Bip32PrivateKey = CoreTypes.Bip32PrivateKey
  export type Bip32PublicKey = CoreTypes.Bip32PublicKey
  export type Certificate = CoreTypes.Certificate
  export type Ed25519KeyHash = CoreTypes.Ed25519KeyHash
  export type LinearFee = CoreTypes.LinearFee
  export type MultiAsset = CoreTypes.MultiAsset
  export type PublicKey = CoreTypes.PublicKey
  export type RewardAddress = CoreTypes.RewardAddress
  export type ScriptHash = CoreTypes.ScriptHash
  export type StakeCredential = CoreTypes.StakeCredential
  export type TransactionBuilder = CoreTypes.TransactionBuilder
  export type Value = CoreTypes.Value
  export type TokenEntry = TokenEntryType
}

export const Cardano = createYoroiLib(CardanoMobile)
