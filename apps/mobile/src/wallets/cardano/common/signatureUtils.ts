import {SignTransactionRequest} from '@cardano-foundation/ledgerjs-hw-app-cardano'
import * as CSL_TYPES from '@emurgo/cross-csl-core'
import {
  Addressing,
  createLedgerPlutusPayload,
  getAllSigners,
} from '@emurgo/yoroi-lib'
import {cardanoConfig, derivationConfig} from '@yoroi/blockchains'
import {Wallet} from '@yoroi/types'
import {Buffer} from 'buffer'
import _ from 'lodash'

import {throwLoggedError} from '../../../kernel/logger/helpers/throw-logged-error'
import {CardanoMobile} from '../../wallets'
import {YoroiWallet} from '../types'

export const createSwapCancellationLedgerPayload = (
  cbor: string,
  wallet: YoroiWallet,
  chainId: number,
  protocolMagic: number,
  getAddressing: (address: string) => Addressing,
  stakeVKHash: CSL_TYPES.Ed25519KeyHash,
): SignTransactionRequest => {
  const changeAddrs = [
    ...wallet.internalAddresses,
    ...wallet.internalAddresses,
  ].map((address) => ({
    addressing: getAddressing(address),
    address,
  }))
  const getAddressingByTxIdAndIndex = (txId: string, index: number) => {
    const utxo = wallet.allUtxos.find(
      (utxo) => utxo.tx_hash === txId && utxo.tx_index === index,
    )
    return utxo ? getAddressing(utxo.receiver) : null
  }
  return createLedgerPlutusPayload({
    wasm: CardanoMobile,
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

const getRequiredSigners = (
  tx: CSL_TYPES.Transaction,
  wallet: YoroiWallet,
  meta: Wallet.Meta,
  partial = true,
): number[][] => {
  const stakeVKHash = wallet.getStakingKey().hash()
  const body = tx.body()

  const implementation = meta.implementation

  const stakingKeyPath =
    implementation === 'cardano-cip1852'
      ? Array.from(
          cardanoConfig.implementations[implementation].features.staking
            .addressing,
        )
      : undefined

  const startLevel = derivationConfig.keyLevel.purpose

  const addressedUtxos = wallet.allUtxos.map((utxo) => ({
    txHash: utxo.tx_hash,
    txIndex: utxo.tx_index,
    amount: utxo.amount,
    receiver: utxo.receiver,
    utxoId: utxo.utxo_id,
    assets: utxo.assets,
    addressing: {
      path: getDerivationPathForAddress(utxo.receiver, wallet, meta, partial),
      startLevel,
    },
  }))

  const getAddressAddressing = (bech32Address: string) => {
    const path = getDerivationPathForAddress(
      bech32Address,
      wallet,
      meta,
      partial,
    )
    return {path, startLevel}
  }
  const signers = getAllSigners({
    wasm: CardanoMobile,
    body,
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
  return _.uniqWith(paths, arePathsEqual)
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
  const internalIndex = wallet.internalAddresses.indexOf(address)
  const externalIndex = wallet.externalAddresses.indexOf(address)
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

export const getTransactionSigners = (
  cbor: string,
  wallet: YoroiWallet,
  meta: Wallet.Meta,
  partial = true,
) => {
  const tx = CardanoMobile.Transaction.fromHex(cbor)

  const signers = getRequiredSigners(tx, wallet, meta, partial)
  const implementation = meta.implementation
  if (implementation === 'cardano-cip1852' && needsToSignWithStakingKey(tx)) {
    const implementationConfig = cardanoConfig.implementations[implementation]
    const additionalSigner: number[] = Array.from(
      implementationConfig.features.staking.addressing,
    )
    return [...signers, additionalSigner]
  }

  return signers
}

export const assertHasAllSigners = (
  cbor: string,
  wallet: YoroiWallet,
  meta: Wallet.Meta,
) => {
  try {
    getTransactionSigners(cbor, wallet, meta, false)
  } catch (error) {
    throwLoggedError('Missing keys to sign transaction')
  }
}

const needsToSignWithStakingKey = (tx: CSL_TYPES.Transaction) => {
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

  if (withdrawals && withdrawals.len() > 0) return true
  return false
}
