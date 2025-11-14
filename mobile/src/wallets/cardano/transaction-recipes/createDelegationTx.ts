import {
  CertificateKind,
  ModernUtxo,
  RegistrationStatus,
  addCertificate,
  addInputs,
  buildRecipeTransaction,
  createCardanoHaskellConfig,
  createTransactionBuilder,
  selectUtxosForAmount,
  setChangeAddress,
  setTTLWithBuffer,
} from '@yoroi/tx'
import {Portfolio, Wallet} from '@yoroi/types'

import type {PublicKey} from '@emurgo/cross-csl-core'

import {CardanoMobileWrapped} from '~/wallets/cardano/wrappedCsl'

export type CreateDelegationTxParams = {
  utxos: ModernUtxo[]
  primaryTokenId: Portfolio.Token.Id
  protocolParams: {
    coinsPerUtxoByte: string
    keyDeposit: string
    linearFee: {constant: string; coefficient: string}
    poolDeposit: string
  }
  networkId: number
  getAbsoluteSlotNumber: () => Promise<BigNumber>
  getChangeAddress: (addressMode: Wallet.AddressMode) => string
  getStakingKey: () => PublicKey
  getDelegationStatus: () => {isRegistered: boolean}
  poolId: string | undefined
  addressMode: Wallet.AddressMode
}

export async function createDelegationTx({
  utxos,
  primaryTokenId,
  protocolParams,
  networkId,
  getAbsoluteSlotNumber,
  getChangeAddress,
  getStakingKey,
  getDelegationStatus,
  poolId,
  addressMode,
}: CreateDelegationTxParams): Promise<{cbor: string}> {
  const absSlotNumber = await getAbsoluteSlotNumber()
  const changeAddress = getChangeAddress(addressMode)
  const registrationStatus = getDelegationStatus().isRegistered
  const stakingKey = getStakingKey()
  const delegationType = registrationStatus
    ? RegistrationStatus.DelegateOnly
    : RegistrationStatus.RegisterAndDelegate

  const protocolParamsConfig = createCardanoHaskellConfig(
    protocolParams,
    networkId,
  )

  // Estimate fee for delegation transaction
  // Delegation transactions are typically small (~300-400 bytes)
  // Fee = constant + (coefficient * tx_size_in_bytes)
  const estimatedTxSize = 400 // bytes - conservative estimate
  const estimatedFee =
    BigInt(protocolParams.linearFee.constant) +
    BigInt(protocolParams.linearFee.coefficient) * BigInt(estimatedTxSize)

  // If registering, we need deposit + fee (deposit is returned as change)
  // If delegating only, we just need fee
  const requiredAda = registrationStatus
    ? estimatedFee.toString() // Delegate only: just fee
    : (BigInt(protocolParams.keyDeposit) + estimatedFee).toString() // Register + delegate: deposit + fee

  // Select only necessary UTXOs to cover fees (and deposit if registering)
  const selectedUtxos = selectUtxosForAmount(utxos, requiredAda, primaryTokenId)

  // Build transaction using functional TransactionBuilder
  let builderState = createTransactionBuilder()

  // Add only selected UTXOs as inputs
  builderState = addInputs(builderState, selectedUtxos)

  // Extract stake credential key hash from staking key (store as data, not CSL object)
  const stakeKeyHashHex = CardanoMobileWrapped.cslScope(() => {
    const keyHash = stakingKey.hash()
    return keyHash.toHex()
  })

  // Add certificates based on delegation type (store as data, not CSL objects)
  if (delegationType === RegistrationStatus.RegisterAndDelegate) {
    // Register staking key first
    builderState = addCertificate(builderState, {
      kind: CertificateKind.StakeRegistration,
      stakeCredentialKeyHashHex: stakeKeyHashHex,
    })
  }

  if (poolId) {
    // Delegate to pool
    builderState = addCertificate(builderState, {
      kind: CertificateKind.StakeDelegation,
      stakeCredentialKeyHashHex: stakeKeyHashHex,
      poolKeyHash: poolId,
    })
  } else {
    // Deregister (no pool means deregistration)
    builderState = addCertificate(builderState, {
      kind: CertificateKind.StakeDeregistration,
      stakeCredentialKeyHashHex: stakeKeyHashHex,
    })
  }

  // Set change address
  builderState = setChangeAddress(builderState, changeAddress)

  // Set TTL with buffer
  builderState = setTTLWithBuffer(builderState, absSlotNumber.toNumber())

  // Build the transaction
  return await buildRecipeTransaction(
    builderState,
    protocolParamsConfig,
    primaryTokenId,
  )
}
