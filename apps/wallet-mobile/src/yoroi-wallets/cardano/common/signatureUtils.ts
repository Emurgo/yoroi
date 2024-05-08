import {SignTransactionRequest} from '@cardano-foundation/ledgerjs-hw-app-cardano'
import * as CSL_TYPES from '@emurgo/cross-csl-core'
import {Addressing, createLedgerPlutusPayload, getAllSigners} from '@emurgo/yoroi-lib'
import {Buffer} from 'buffer'
import _ from 'lodash'

import {CardanoMobile} from '../../wallets'
import {BIP44_DERIVATION_LEVELS, HARD_DERIVATION_START} from '../constants/common'
import {NUMBERS} from '../numbers'
import {YoroiWallet} from '../types'
import {isHaskellShelley} from '../utils'

export const createSwapCancellationLedgerPayload = async (
  cbor: string,
  wallet: YoroiWallet,
  networkId: number,
  protocolMagic: number,
  getAddressing: (address: string) => Addressing,
  stakeVKHash: CSL_TYPES.Ed25519KeyHash,
): Promise<SignTransactionRequest> => {
  const changeAddrs = [...wallet.internalAddresses, ...wallet.internalAddresses].map((address) => ({
    addressing: getAddressing(address),
    address,
  }))
  const getAddressingByTxIdAndIndex = (txId: string, index: number) => {
    const utxo = wallet.allUtxos.find((utxo) => utxo.tx_hash === txId && utxo.tx_index === index)
    return utxo ? getAddressing(utxo.receiver) : null
  }
  return createLedgerPlutusPayload({
    wasm: CardanoMobile,
    cbor,
    addresses: changeAddrs,
    networkId,
    protocolMagic,
    purpose: harden(1852),
    stakeVKHash,
    getUtxoAddressing: getAddressingByTxIdAndIndex,
    getAddressAddressing: getAddressing,
  })
}

export const convertBech32ToHex = async (bech32Address: string) => {
  const address = await CardanoMobile.Address.fromBech32(bech32Address)
  const bytes = await address.toBytes()
  return Buffer.from(bytes).toString('hex')
}

export const harden = (num: number) => HARD_DERIVATION_START + num

export const getRequiredSigners = async (
  tx: CSL_TYPES.Transaction,
  wallet: YoroiWallet,
  partial = true,
): Promise<number[][]> => {
  const stakeVKHash = await wallet.getStakingKey().then((key) => key.hash())
  const body = await tx.body()

  const startLevel = BIP44_DERIVATION_LEVELS.PURPOSE

  const addressedUtxos = wallet.allUtxos.map((utxo) => ({
    txHash: utxo.tx_hash,
    txIndex: utxo.tx_index,
    amount: utxo.amount,
    receiver: utxo.receiver,
    utxoId: utxo.utxo_id,
    assets: utxo.assets,
    addressing: {path: getDerivationPathForAddress(utxo.receiver, wallet), startLevel},
  }))

  const getAddressAddressing = (bech32Address: string) => {
    const path = getDerivationPathForAddress(bech32Address, wallet)
    return {path, startLevel}
  }
  const signers = await getAllSigners(
    CardanoMobile,
    body,
    wallet.networkId,
    stakeVKHash,
    getAddressAddressing,
    addressedUtxos,
    partial,
  )

  return getUniquePaths(signers.map((s) => s.path))
}

const getUniquePaths = (paths: number[][]) => {
  return _.uniqWith(paths, arePathsEqual)
}

const arePathsEqual = (path1: number[], path2: number[]) => {
  return path1.every((value, index) => value === path2[index]) && path1.length === path2.length
}

const getDerivationPathForAddress = (address: string, wallet: YoroiWallet) => {
  const internalIndex = wallet.internalAddresses.indexOf(address)
  const externalIndex = wallet.externalAddresses.indexOf(address)
  const purpose = isHaskellShelley(wallet.walletImplementationId)
    ? NUMBERS.WALLET_TYPE_PURPOSE.CIP1852
    : NUMBERS.WALLET_TYPE_PURPOSE.BIP44
  if (internalIndex === -1 && externalIndex === -1) throw new Error('Could not find matching address')

  const role = internalIndex > -1 ? 1 : 0
  const index = Math.max(internalIndex, externalIndex)

  return [purpose, harden(1815), harden(0), role, index]
}

export const getTransactionSigners = async (cbor: string, wallet: YoroiWallet, partial = true) => {
  const tx = await CardanoMobile.Transaction.fromHex(cbor)
  return getRequiredSigners(tx, wallet, partial)
}
