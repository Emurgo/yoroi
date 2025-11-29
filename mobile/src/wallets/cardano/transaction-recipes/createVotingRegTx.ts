import {
  ModernUtxo,
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

import {CardanoMobile} from '~/wallets/wallets'

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
  const paymentAddressCIP36 = baseAddrObj.toBech32(undefined)
  if (!paymentAddressCIP36) {
    throw new Error('Failed to convert payment address to bech32')
  }

  // Derive reward address from base address
  const rewardAddr = baseAddrObj
  const rewardAddress = rewardAddr.toBech32(undefined)
  if (!rewardAddress) {
    throw new Error('Failed to convert reward address to bech32')
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
  const votingPublicKeyBech32 = votingPublicKey.toBech32()
  if (!votingPublicKeyBech32) {
    throw new Error('Failed to convert voting public key to bech32')
  }
  const stakingPublicKeyBech32 = stakingPublicKey.toBech32()
  if (!stakingPublicKeyBech32) {
    throw new Error('Failed to convert staking public key to bech32')
  }
  const rewardAddressBranded =
    typeof rewardAddress === 'string'
      ? (rewardAddress as Address)
      : rewardAddress
  const paymentAddressBranded =
    typeof paymentAddressCIP36 === 'string'
      ? (paymentAddressCIP36 as Address)
      : paymentAddressCIP36
  const votingMetadata = supportsCIP36
    ? createCIP36VotingMetadata(
        votingPublicKeyBech32 as PublicKeyHex,
        stakingPublicKeyBech32 as PublicKeyHex,
        rewardAddressBranded,
        nonce,
        paymentAddressBranded,
      )
    : createCIP15VotingMetadata(
        votingPublicKeyBech32 as PublicKeyHex,
        stakingPublicKeyBech32 as PublicKeyHex,
        rewardAddressBranded,
        nonce,
      )

  builderState = addMetadata(
    builderState,
    String(votingMetadata.label),
    votingMetadata.data,
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
