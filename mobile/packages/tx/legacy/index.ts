// ⚠️ LEGACY TRANSACTION BUILDING METHODS
// These methods are kept for backward compatibility during migration
// They will be replaced by TransactionBuilder in Phase 2
// DO NOT USE IN NEW CODE - Use TransactionBuilder instead
import {PublicKey, WasmModuleProxy} from '@emurgo/cross-csl-core'

import {
  AddressingAddress,
  CardanoAddressedUtxo,
  CardanoHaskellConfig,
  Datum,
  MultiTokenValue,
  RegistrationStatus,
  SendToken,
  Token,
  TxOptions,
} from '../types'

// UnsignedTx type from yoroi-lib (will be replaced in Phase 2)
// Using 'any' here because we're just passing through to yoroi-lib
type UnsignedTx = any

/**
 * @deprecated Use TransactionBuilder instead (Phase 2)
 * Legacy method for creating unsigned transactions
 */
export const createUnsignedTx = async (
  wasm: WasmModuleProxy,
  absSlotNumber: BigNumber,
  utxos: Array<CardanoAddressedUtxo>,
  recipients: Array<{
    receiver: string
    tokens: Array<SendToken>
    datum?: Datum
  }>,
  changeAddr: AddressingAddress,
  config: CardanoHaskellConfig,
  defaultToken: Token,
  txOptions: TxOptions,
  certificates?: Array<unknown>,
): Promise<UnsignedTx> => {
  // Create a minimal wrapper that matches the old API
  // This will be replaced by TransactionBuilder in Phase 2
  const lib = await import('@emurgo/yoroi-lib').then((m) =>
    m.createYoroiLib(wasm),
  )
  return lib.createUnsignedTx(
    absSlotNumber,
    utxos,
    recipients,
    changeAddr,
    config,
    defaultToken,
    txOptions,
    certificates as any,
  )
}

/**
 * @deprecated Use TransactionBuilder.addCertificate() instead (Phase 2)
 * Legacy method for creating delegation transactions
 */
export const createUnsignedDelegationTx = async (
  wasm: WasmModuleProxy,
  absSlotNumber: BigNumber,
  utxos: Array<CardanoAddressedUtxo>,
  stakingKey: PublicKey,
  registrationStatus: RegistrationStatus,
  poolId: string | null,
  changeAddr: AddressingAddress,
  valueInAccount: MultiTokenValue,
  defaultToken: Token,
  txOptions: TxOptions,
  config: CardanoHaskellConfig,
): Promise<UnsignedTx> => {
  const lib = await import('@emurgo/yoroi-lib').then((m) =>
    m.createYoroiLib(wasm),
  )
  return lib.createUnsignedDelegationTx(
    absSlotNumber,
    utxos,
    stakingKey,
    registrationStatus,
    poolId,
    changeAddr,
    valueInAccount,
    defaultToken,
    txOptions,
    config,
  )
}

/**
 * @deprecated Use TransactionBuilder.addWithdrawal() instead (Phase 2)
 * Legacy method for creating withdrawal transactions
 */
export const createUnsignedWithdrawalTx = async (
  wasm: WasmModuleProxy,
  accountState: {
    [key: string]: null | {
      remainingAmount: string
      rewards: string
      withdrawals: string
    }
  },
  defaultToken: Token,
  absSlotNumber: BigNumber,
  utxos: Array<CardanoAddressedUtxo>,
  withdrawalRequests: Array<{
    addressing: unknown
    rewardAddress: string
    shouldDeregister: boolean
  }>,
  changeAddr: AddressingAddress,
  config: CardanoHaskellConfig,
  txOptions: TxOptions,
): Promise<UnsignedTx> => {
  const lib = await import('@emurgo/yoroi-lib').then((m) =>
    m.createYoroiLib(wasm),
  )
  return lib.createUnsignedWithdrawalTx(
    accountState,
    defaultToken,
    absSlotNumber,
    utxos,
    withdrawalRequests as any,
    changeAddr,
    config,
    txOptions,
  )
}

/**
 * @deprecated Use TransactionBuilder with metadata instead (Phase 2)
 * Legacy method for creating voting transactions
 */
export const createUnsignedVotingTx = async (
  wasm: WasmModuleProxy,
  absSlotNumber: BigNumber,
  defaultToken: Token,
  votingPublicKey: PublicKey,
  stakingKeyPath: number[],
  stakingPublicKey: PublicKey,
  utxos: Array<CardanoAddressedUtxo>,
  changeAddr: AddressingAddress,
  config: CardanoHaskellConfig,
  txOptions: TxOptions,
  nonce: number,
  paymentAddress: string,
  paymentKeyPath: number[],
  useCIP36 = true,
): Promise<UnsignedTx> => {
  const lib = await import('@emurgo/yoroi-lib').then((m) =>
    m.createYoroiLib(wasm),
  )
  return lib.createUnsignedVotingTx(
    absSlotNumber,
    defaultToken,
    votingPublicKey,
    stakingKeyPath,
    stakingPublicKey,
    utxos,
    changeAddr,
    config,
    txOptions,
    nonce,
    paymentAddress,
    paymentKeyPath,
    useCIP36,
  )
}
