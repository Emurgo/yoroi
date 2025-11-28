import {cardanoConfig, derivationConfig} from '@yoroi/blockchains'
import {Addressing, createLedgerPlutusPayload, getAllSigners} from '@yoroi/tx'
import {Balance, Wallet} from '@yoroi/types'

import {SignTransactionRequest} from '@cardano-foundation/ledgerjs-hw-app-cardano'
import * as CSL_TYPES from '@emurgo/cross-csl-core'
import {Buffer} from 'buffer'
import {uniqWith} from 'lodash'

import {throwLoggedError} from '~/kernel/logger/helpers/throw-logged-error'
import {CardanoMobile} from '~/wallets/wallets'

import {CardanoTypes, YoroiWallet} from '../types'

export const createSwapCancellationLedgerPayload = async (
  cbor: string,
  wallet: YoroiWallet,
  chainId: number,
  protocolMagic: number,
  getAddressing: (address: string) => Addressing,
  stakeVKHash: CSL_TYPES.Ed25519KeyHash,
): Promise<SignTransactionRequest> => {
  const changeAddrs = [
    ...wallet.internalAddresses(),
    ...wallet.internalAddresses(),
  ].map((address) => ({
    addressing: getAddressing(address),
    address,
  }))
  const getAddressingByTxIdAndIndex = (txId: string, index: number) => {
    const utxo = wallet
      .allUtxos()
      .find((utxo) => utxo.tx_hash === txId && utxo.tx_index === index)
    return utxo ? getAddressing(utxo.receiver) : null
  }
  return await createLedgerPlutusPayload({
    cbor,
    addresses: changeAddrs,
    networkId: chainId,
    protocolMagic,
    purpose: harden(1852),
    stakeVKHash,
    getUtxoAddressing: getAddressingByTxIdAndIndex,
    getAddressAddressing: getAddressing,
  })
}

export const convertBech32ToHex = (bech32Address: string) => {
  const address = CardanoMobile.Address.fromBech32(bech32Address)
  const bytes = address.toBytes()
  return Buffer.from(bytes).toString('hex')
}

export const harden = (num: number) => derivationConfig.hardStart + num

const getRequiredSigners = async (
  tx: CSL_TYPES.Transaction,
  wallet: YoroiWallet,
  meta: Wallet.Meta,
  partial = true,
): Promise<number[][]> => {
  const stakeVKHash = wallet.getStakingKey().hash()
  const txBody = tx.body()

  const implementation = meta.implementation

  const stakingKeyPath =
    implementation === 'cardano-cip1852'
      ? Array.from(
          cardanoConfig.implementations[implementation].features.staking
            .addressing,
        )
      : undefined

  const startLevel = derivationConfig.keyLevel.purpose
  const primaryTokenId = wallet.portfolioPrimaryTokenInfo.id

  const addressedUtxos: CardanoTypes.CardanoAddressedUtxo[] = wallet
    .allUtxos()
    .map((utxo) => {
      // Convert to modern Balance.Amounts format
      const balance: Balance.Amounts = {
        [primaryTokenId]: utxo.amount as Balance.Quantity,
      }
      for (const asset of utxo.assets) {
        balance[asset.tokenId] = asset.amount as Balance.Quantity
      }

      return {
        txHash: utxo.tx_hash,
        txIndex: utxo.tx_index,
        receiver: utxo.receiver,
        utxoId: utxo.utxo_id,
        balance,
        addressing: {
          path: getDerivationPathForAddress(
            utxo.receiver,
            wallet,
            meta,
            partial,
          ),
          startLevel,
        },
      }
    })

  const getAddressAddressing = (bech32Address: string) => {
    const path = getDerivationPathForAddress(
      bech32Address,
      wallet,
      meta,
      partial,
    )
    return {path, startLevel}
  }

  // Adapter to convert TransactionBody to the format expected by getAllSigners
  // TransactionBody.requiredSigners() returns Ed25519KeyHashes | null
  // TransactionBody.collateral() returns TransactionInputs | null
  const bodyAdapter = {
    requiredSigners() {
      const signers = txBody.requiredSigners()
      if (!signers) return null
      return {
        len: () => signers.len(),
        get: (index: number) => signers.get(index),
      }
    },
    inputs: () => txBody.inputs(),
    collateral: () => {
      // collateral() returns Optional<TransactionInputs> | TransactionInputs | null
      const collateralOpt = txBody.collateral()
      if (!collateralOpt) return null
      // Check if it's Optional (has hasValue method)
      if (typeof (collateralOpt as any).hasValue === 'function') {
        const opt = collateralOpt as any
        if (!opt.hasValue()) return null
        // When Optional has a value, the Optional itself IS the TransactionInputs
        // No need to call .value() - use it directly
        return opt
      }
      // If it's already TransactionInputs, return it directly
      return collateralOpt as any
    },
  }

  const signers = await getAllSigners({
    body: bodyAdapter,
    networkId: wallet.networkManager.chainId,
    stakeVKHash,
    getAddressAddressing,
    utxos: addressedUtxos,
    partial,
    stakingKeyPath,
  })

  return getUniquePaths(signers.map((s) => s.path))
}

const getUniquePaths = (paths: number[][]) => {
  return uniqWith(paths, arePathsEqual)
}

const arePathsEqual = (path1: number[], path2: number[]) => {
  return (
    path1.every((value, index) => value === path2[index]) &&
    path1.length === path2.length
  )
}

export const getDerivationPathForAddress = (
  address: string,
  wallet: YoroiWallet,
  meta: Wallet.Meta,
  partial = false,
) => {
  const internalIndex = wallet.internalAddresses().indexOf(address)
  const externalIndex = wallet.externalAddresses().indexOf(address)
  const config = cardanoConfig.implementations[meta.implementation]
  const index = Math.max(internalIndex, externalIndex)

  if (internalIndex === -1 && externalIndex === -1) {
    if (!partial) throwLoggedError('Could not find matching address ' + address)
    return [
      config.derivations.base.harden.purpose,
      config.derivations.base.harden.coinType,
      derivationConfig.hardStart + wallet.accountVisual,
      config.derivations.base.roles.external,
      0,
    ]
  }

  const shouldUseInternal = internalIndex > -1
  const role = shouldUseInternal
    ? config.derivations.base.roles.internal
    : config.derivations.base.roles.external

  return [
    config.derivations.base.harden.purpose,
    config.derivations.base.harden.coinType,
    derivationConfig.hardStart + wallet.accountVisual,
    role,
    index,
  ]
}

export const getTransactionSigners = async (
  cbor: string,
  wallet: YoroiWallet,
  meta: Wallet.Meta,
  partial = true,
): Promise<number[][]> => {
  const tx = CardanoMobile.Transaction.fromHex(cbor)

  const signers = await getRequiredSigners(tx, wallet, meta, partial)
  const implementation = meta.implementation
  if (
    implementation === 'cardano-cip1852' &&
    needsToSignWithStakingKey(tx, wallet)
  ) {
    const implementationConfig = cardanoConfig.implementations[implementation]
    const additionalSigner: number[] = Array.from(
      implementationConfig.features.staking.addressing,
    )
    return [...signers, additionalSigner]
  }

  return signers
}

export const assertHasAllSigners = async (
  cbor: string,
  wallet: YoroiWallet,
  meta: Wallet.Meta,
) => {
  try {
    await getTransactionSigners(cbor, wallet, meta, false)
  } catch (error) {
    throwLoggedError('Missing keys to sign transaction')
  }
}

const needsToSignWithStakingKey = (
  tx: CSL_TYPES.Transaction,
  wallet: YoroiWallet,
) => {
  const body = tx.body()
  const [certificates, withdrawals] = [body.certs(), body.withdrawals()]

  for (let i = 0; certificates && i < certificates.len(); i++) {
    const certificate = certificates.get(i)
    if (certificate.asStakeRegistration()?.hasValue()) return true
    if (certificate.asStakeDeregistration()?.hasValue()) return true
    if (certificate.asStakeDelegation()?.hasValue()) return true
    if (certificate.asStakeRegistrationAndDelegation()?.hasValue()) return true
    if (certificate.asStakeAndVoteDelegation()?.hasValue()) return true
    if (certificate.asVoteDelegation()?.hasValue()) return true
    if (certificate.asVoteRegistrationAndDelegation()?.hasValue()) return true
  }

  // Only require staking key if any withdrawal targets our wallet's reward address
  if (withdrawals && wallet.rewardAddressHex) {
    const keys = withdrawals.keys()
    for (let i = 0; i < keys.len(); i++) {
      const rewardAddress = keys.get(i)
      const rewardAddressHex = rewardAddress.toAddress().toHex()
      if (rewardAddressHex === wallet.rewardAddressHex) return true
    }
  }
  return false
}
