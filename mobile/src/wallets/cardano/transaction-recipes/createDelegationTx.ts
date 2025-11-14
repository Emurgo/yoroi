import {
  ModernUtxo,
  RegistrationStatus,
  addCertificate,
  addInputs,
  buildRecipeTransaction,
  createCardanoHaskellConfig,
  createStakeDelegationCertificate,
  createStakeDeregistrationCertificate,
  createStakeRegistrationCertificate,
  createTransactionBuilder,
  setChangeAddress,
  setTTLWithBuffer,
} from '@yoroi/tx'
import {Portfolio, Wallet} from '@yoroi/types'

import type {PublicKey} from '@emurgo/cross-csl-core'

import {CardanoMobile} from '~/wallets/wallets'

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

  // Build transaction using functional TransactionBuilder
  let builderState = createTransactionBuilder()

  // Add all UTXOs as inputs
  builderState = addInputs(builderState, utxos)

  // Add certificates based on delegation type
  if (delegationType === RegistrationStatus.RegisterAndDelegate) {
    // Register staking key first
    const regCert = createStakeRegistrationCertificate(
      CardanoMobile,
      stakingKey,
    )
    builderState = addCertificate(builderState, regCert)
  }

  if (poolId) {
    // Delegate to pool
    const delegCert = createStakeDelegationCertificate(
      CardanoMobile,
      stakingKey,
      poolId,
    )
    builderState = addCertificate(builderState, delegCert)
  } else {
    // Deregister (no pool means deregistration)
    const deregCert = createStakeDeregistrationCertificate(
      CardanoMobile,
      stakingKey,
    )
    builderState = addCertificate(builderState, deregCert)
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
