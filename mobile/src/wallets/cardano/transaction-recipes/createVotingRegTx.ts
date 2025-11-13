import {cardanoConfig} from '@yoroi/blockchains'
import {
  CardanoHaskellConfig,
  ModernUtxo,
  addInputs,
  addMetadata,
  buildTransaction,
  createCIP15VotingMetadata,
  createCIP36VotingMetadata,
  createTransactionBuilder,
  setChangeAddress,
  setTTL,
} from '@yoroi/tx'
import {Portfolio, Wallet} from '@yoroi/types'

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
  getChangeAddress: (addressMode: Wallet.AddressMode) => string
  getStakingKey: () => PublicKey
  getFirstPaymentAddress: () => BaseAddress
  supportsCIP36: boolean
  catalystKeyHex: string
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
  const votingPrivateKey = CardanoMobile.PrivateKey.fromExtendedBytes(
    new Uint8Array(Buffer.from(catalystKeyHex, 'hex')),
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
  const changeAddress = getChangeAddress(addressMode)

  const protocolParamsConfig: CardanoHaskellConfig = {
    keyDeposit: protocolParams.keyDeposit,
    linearFee: protocolParams.linearFee,
    minimumUtxoVal: cardanoConfig.params.minUtxoValue.toString(),
    coinsPerUtxoByte: protocolParams.coinsPerUtxoByte,
    poolDeposit: protocolParams.poolDeposit,
    networkId,
  }

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

  // Build transaction using functional TransactionBuilder
  let builderState = createTransactionBuilder()

  // Add all UTXOs as inputs
  builderState = addInputs(builderState, utxos)

  // Create and add voting metadata
  const votingPublicKeyBech32 = votingPublicKey.toBech32()
  if (!votingPublicKeyBech32) {
    throw new Error('Failed to convert voting public key to bech32')
  }
  const stakingPublicKeyBech32 = stakingPublicKey.toBech32()
  if (!stakingPublicKeyBech32) {
    throw new Error('Failed to convert staking public key to bech32')
  }
  const votingMetadata = supportsCIP36
    ? createCIP36VotingMetadata(
        votingPublicKeyBech32,
        stakingPublicKeyBech32,
        rewardAddress,
        nonce,
        paymentAddressCIP36,
      )
    : createCIP15VotingMetadata(
        votingPublicKeyBech32,
        stakingPublicKeyBech32,
        rewardAddress,
        nonce,
      )

  builderState = addMetadata(
    builderState,
    String(votingMetadata.label),
    votingMetadata.data,
  )

  // Set change address
  builderState = setChangeAddress(builderState, changeAddress)

  // Set TTL
  builderState = setTTL(builderState, absSlotNumber.toNumber())

  // Build the transaction
  const unsignedTx = await buildTransaction(
    builderState,
    protocolParamsConfig,
    primaryTokenId,
  )

  if (!unsignedTx.cbor) {
    throw new Error('Transaction CBOR not available')
  }

  return {
    votingRegTx: {cbor: unsignedTx.cbor},
  }
}
