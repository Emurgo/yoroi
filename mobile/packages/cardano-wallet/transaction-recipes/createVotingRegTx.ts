import {
  ModernUtxo,
  type TransactionMetadata,
  addInputs,
  addMetadata,
  buildRecipeTransaction,
  createCIP15VotingMetadata,
  createCIP36VotingMetadata,
  createCardanoHaskellConfig,
  createTransactionBuilder,
  selectUtxosForAmount,
  setChangeAddress,
  setTTLWithBuffer,
} from '@yoroi/tx'
import {Address, Portfolio, PublicKeyHex, Wallet} from '@yoroi/types'

import type {BaseAddress, PublicKey} from '@emurgo/cross-csl-core'
import {Buffer} from 'buffer'

import {CardanoMobile} from '../wrappedCsl'

export type CreateVotingRegTxParams = {
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
  getChangeAddress: (addressMode: Wallet.AddressMode) => Address | string
  getStakingKey: () => PublicKey
  getFirstPaymentAddress: () => BaseAddress
  supportsCIP36: boolean
  catalystKeyHex: PublicKeyHex | string
  addressMode: Wallet.AddressMode
}

export async function createVotingRegTx({
  utxos,
  primaryTokenId,
  protocolParams,
  networkId,
  getAbsoluteSlotNumber,
  getChangeAddress,
  getStakingKey,
  getFirstPaymentAddress,
  supportsCIP36,
  catalystKeyHex,
  addressMode,
}: CreateVotingRegTxParams): Promise<{votingRegTx: {cbor: string}}> {
  const absSlotNumber = await getAbsoluteSlotNumber()
  const catalystKeyHexStr =
    typeof catalystKeyHex === 'string' ? catalystKeyHex : catalystKeyHex
  const votingPrivateKey = CardanoMobile.PrivateKey.fromExtendedBytes(
    new Uint8Array(Buffer.from(catalystKeyHexStr, 'hex')),
  )
  if (!votingPrivateKey) {
    throw new Error('Failed to create voting private key from catalystKeyHex')
  }
  const votingPublicKey = votingPrivateKey.toPublic()
  if (!votingPublicKey) {
    throw new Error('Failed to get public key from voting private key')
  }
  const stakingPublicKey = getStakingKey()
  if (!stakingPublicKey) {
    throw new Error('Failed to get staking public key')
  }
  const changeAddressRaw = getChangeAddress(addressMode)
  const changeAddress =
    typeof changeAddressRaw === 'string'
      ? (changeAddressRaw as Address)
      : changeAddressRaw

  const protocolParamsConfig = createCardanoHaskellConfig(
    protocolParams,
    networkId,
  )

  const nonce = absSlotNumber.toNumber()

  const baseAddr = getFirstPaymentAddress()
  if (!baseAddr) {
    throw new Error('getFirstPaymentAddress returned null')
  }
  const baseAddrObj = baseAddr.toAddress()
  if (!baseAddrObj) {
    throw new Error('Failed to convert base address to Address')
  }
  // Convert addresses to hex format (bech32 strings are too long for metadata)
  const paymentAddressHex = baseAddrObj.toHex()
  if (!paymentAddressHex) {
    throw new Error('Failed to convert payment address to hex')
  }

  // Derive reward address from base address
  const rewardAddr = baseAddrObj
  const rewardAddressHex = rewardAddr.toHex()
  if (!rewardAddressHex) {
    throw new Error('Failed to convert reward address to hex')
  }

  // Estimate fee for voting registration transaction
  // Voting registration transactions are typically small (~400-600 bytes)
  const estimatedTxSize = 600 // bytes - conservative estimate
  const estimatedFee =
    BigInt(protocolParams.linearFee.constant) +
    BigInt(protocolParams.linearFee.coefficient) * BigInt(estimatedTxSize)

  // Voting registration doesn't require deposit, but we need:
  // 1. Fee for the transaction
  // 2. Minimum UTXO value for the change output (at least 1 ADA)
  const minUtxoValue = BigInt(protocolParamsConfig.minimumUtxoVal || '1000000') // Base min UTXO (1 ADA)
  const feeBuffer = BigInt('100000') // 0.1 ADA buffer for fee estimation variance
  const requiredAda = (estimatedFee + minUtxoValue + feeBuffer).toString()

  // Select only necessary UTXOs to cover fees
  const selectedUtxos = selectUtxosForAmount(utxos, requiredAda, primaryTokenId)

  // Build transaction using functional TransactionBuilder
  let builderState = createTransactionBuilder()

  // Add only selected UTXOs as inputs
  builderState = addInputs(builderState, selectedUtxos)

  // Create and add voting metadata
  // Convert public keys to hex format (bech32 strings are too long for metadata)
  const votingPublicKeyHex = Buffer.from(votingPublicKey.asBytes()).toString(
    'hex',
  )
  const stakingPublicKeyHex = Buffer.from(stakingPublicKey.asBytes()).toString(
    'hex',
  )

  const votingMetadata = supportsCIP36
    ? createCIP36VotingMetadata(
        votingPublicKeyHex,
        stakingPublicKeyHex,
        rewardAddressHex,
        nonce,
        paymentAddressHex,
      )
    : createCIP15VotingMetadata(
        votingPublicKeyHex,
        stakingPublicKeyHex,
        rewardAddressHex,
        nonce,
      )

  builderState = addMetadata(
    builderState,
    String(votingMetadata.label),
    votingMetadata.data as TransactionMetadata['data'],
  )

  // Set change address
  builderState = setChangeAddress(builderState, changeAddress)

  // Set TTL with buffer
  builderState = setTTLWithBuffer(builderState, absSlotNumber.toNumber())

  // Build the transaction
  const result = await buildRecipeTransaction(
    builderState,
    protocolParamsConfig,
    primaryTokenId,
  )

  return {
    votingRegTx: {cbor: result.cbor},
  }
}
