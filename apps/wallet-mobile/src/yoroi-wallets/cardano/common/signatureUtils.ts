import {SignTransactionRequest} from '@cardano-foundation/ledgerjs-hw-app-cardano'
import * as CSL_TYPES from '@emurgo/cross-csl-core'
import {Addressing, createLedgerPlutusPayload} from '@emurgo/yoroi-lib'
import {Buffer} from 'buffer'
import _ from 'lodash'

import {RawUtxo} from '../../types'
import {CardanoMobile} from '../../wallets'
import {HARD_DERIVATION_START} from '../constants/common'
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
  return new Buffer(bytes).toString('hex')
}

export const harden = (num: number) => HARD_DERIVATION_START + num

export const assertRequired = <T>(value: T | undefined, message: string): T => {
  if (value === undefined) throw new Error(message)
  return value
}

// TODO: Use fn from yoroi-lib
export const getRequiredSigners = async (tx: CSL_TYPES.Transaction, wallet: YoroiWallet) => {
  const utxos = wallet.allUtxos
  const body = await tx.body()
  const inputs = await body.inputs()
  const purpose = isHaskellShelley(wallet.walletImplementationId)
    ? NUMBERS.WALLET_TYPE_PURPOSE.CIP1852
    : NUMBERS.WALLET_TYPE_PURPOSE.BIP44
  const signers = [[purpose, harden(1815), harden(0), 0, 0]]

  const inputUtxos: RawUtxo[] = []

  for (let i = 0; i < (await inputs.len()); i++) {
    const input = await inputs.get(i)
    const txId = await input.transactionId().then((t) => t.toHex())
    const txIndex = await input.index()
    const matchingUtxo = utxos.find((utxo) => utxo.tx_hash === txId && utxo.tx_index === txIndex)
    if (!matchingUtxo) continue
    inputUtxos.push(matchingUtxo)
  }

  inputUtxos.forEach((utxo) => {
    signers.push(getDerivationPathForAddress(utxo.receiver, wallet, purpose))
  })

  const requiredSigners = assertRequired(await body.requiredSigners(), 'Transaction does not contain required signers')

  const txRequiredAddresses: string[] = []
  for (let i = 0; i < (await requiredSigners.len()); i++) {
    const signer = await requiredSigners.get(i)
    const hex = await signer.toHex()

    const allAddresses = [...wallet.externalAddresses, ...wallet.internalAddresses]
    await Promise.all(
      allAddresses.map(async (bech32Address) => {
        const parsedAddress = await CardanoMobile.Address.fromBech32(bech32Address)
        const baseAddr = await CardanoMobile.BaseAddress.fromAddress(parsedAddress)
        const paymentCred = await baseAddr.paymentCred()
        const keyHash = await paymentCred.toKeyhash()
        const hexKeyHash = await keyHash.toBytes().then((b) => Buffer.from(b).toString('hex'))
        if (hex === hexKeyHash) {
          txRequiredAddresses.push(bech32Address)
        }
      }),
    )
  }

  txRequiredAddresses.forEach((address) => {
    signers.push(getDerivationPathForAddress(address, wallet, purpose))
  })

  const collateralInputs = assertRequired(await body.collateral(), 'Transaction does not contain collateral inputs')

  const firstCollateral = await collateralInputs.get(0)
  const txId = await firstCollateral.transactionId().then((t) => t.toHex())
  const txIndex = await firstCollateral.index()

  const matchingUtxo = utxos.find((utxo) => utxo.tx_hash === txId && utxo.tx_index === txIndex)
  if (!matchingUtxo) throw new Error('Could not find matching utxo')

  const {receiver} = matchingUtxo
  signers.push(getDerivationPathForAddress(receiver, wallet, purpose))

  return getUniquePaths(signers)
}

const getUniquePaths = (paths: number[][]) => {
  return _.uniqWith(paths, arePathsEqual)
}

const arePathsEqual = (path1: number[], path2: number[]) => {
  return path1.every((value, index) => value === path2[index]) && path1.length === path2.length
}

const getDerivationPathForAddress = (address: string, wallet: YoroiWallet, purpose: number) => {
  const internalIndex = wallet.internalAddresses.indexOf(address)
  const externalIndex = wallet.externalAddresses.indexOf(address)
  if (internalIndex === -1 && externalIndex === -1) throw new Error('Could not find matching address')

  const role = internalIndex > -1 ? 1 : 0
  const index = Math.max(internalIndex, externalIndex)

  return [purpose, harden(1815), harden(0), role, index]
}

export const getMuesliSwapTransactionAndSigners = async (cbor: string, wallet: YoroiWallet) => {
  // TODO: Fixed tx body was here
  const tx = await CardanoMobile.Transaction.fromHex(cbor)
  const signers = await getRequiredSigners(tx, wallet)
  return {signers}
}
