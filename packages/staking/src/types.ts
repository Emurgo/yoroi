import {
  Addressing as AddressingType,
  CardanoAddressedUtxo as CardanoAddressedUtxoType,
  MultiTokenValue as MultiTokenValueType,
  StakingKeyBalances as StakingKeyBalancesType,
  TokenEntry as TokenEntryType,
  TxMetadata as TxMetadataType,
  SignedTx as SignedTxType,
  UnsignedTx as UnsignedTxType,
} from '@emurgo/yoroi-lib'
import {WalletChecksum as WalletChecksumType} from '@emurgo/cip4-js'
import * as CoreTypes from '@emurgo/cross-csl-core'

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
  export type StakeCredential = CoreTypes.Credential
  export type TransactionBuilder = CoreTypes.TransactionBuilder
  export type Value = CoreTypes.Value
  export type TokenEntry = TokenEntryType
  export type Wasm = CoreTypes.WasmModuleProxy
}
