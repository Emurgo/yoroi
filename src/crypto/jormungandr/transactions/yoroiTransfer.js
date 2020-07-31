// @flow
import {BigNumber} from 'bignumber.js'
import {isEmpty} from 'lodash'
import {Address, Bip32PrivateKey} from 'react-native-chain-libs'

import {InsufficientFunds} from '../../errors'
import type {AddressedUtxo, Addressing} from '../../../types/HistoryTransaction'
import {signTransaction, sendAllUnsignedTx} from './utxoTransactions'
import {getShelleyTxFee} from './utils'
import {generateWalletRootKey} from '../util'
import {addressToDisplayString} from '../../commonUtils'
import {bulkFetchUTXOsForAddresses} from '../../../api/byron/api'
import {CONFIG} from '../../../config/config'
import {Logger} from '../../../utils/logging'

export type TransferTx = {
  recoveredBalance: BigNumber,
  fee: BigNumber,
  id: string,
  encodedTx: Uint8Array,
  senders: Array<string>,
  receiver: string,
}

/**
 * Generate transaction including all addresses with no change.
 * signingKey assumed account-level
 */
export const buildYoroiTransferTx = async (payload: {|
  senderUtxos: Array<AddressedUtxo>,
  outputAddr: string,
  signingKey: Bip32PrivateKey,
|}): Promise<TransferTx> => {
  try {
    const {senderUtxos, outputAddr} = payload

    const totalBalance = senderUtxos
      .map((utxo) => new BigNumber(utxo.amount))
      .reduce((acc, amount) => acc.plus(amount), new BigNumber(0))

    // first build a transaction to see what the fee will be
    const unsignedTxResponse = await sendAllUnsignedTx(outputAddr, senderUtxos)
    const fee = await getShelleyTxFee(unsignedTxResponse.IOs)

    // sign inputs
    const fragment = await signTransaction(
      unsignedTxResponse,
      payload.signingKey,
      true,
    )

    const uniqueSenders = Array.from(
      new Set(senderUtxos.map((utxo) => utxo.receiver)),
    )

    // return summary of transaction
    return {
      recoveredBalance: totalBalance,
      fee,
      id: Buffer.from(await (await fragment.id()).as_bytes()).toString('hex'),
      encodedTx: await fragment.as_bytes(),
      // recall: some addresses may be legacy, some may be Shelley
      senders: await Promise.all(
        uniqueSenders.map(async (addr) => await addressToDisplayString(addr)),
      ),
      receiver: await (await Address.from_bytes(
        Buffer.from(outputAddr, 'hex'),
      )).to_string(CONFIG.NETWORKS.JORMUNGANDR.BECH32_PREFIX.ADDRESS),
    }
  } catch (error) {
    if (error instanceof InsufficientFunds) {
      // handle error at UI-level
      throw error
    } else {
      Logger.error(`transfer::buildYoroiTransferTx: ${error.message}`)
      throw new Error(`buildYoroiTransferTx: ${error.message}`)
    }
  }
}

/**
 * get utxos for given addresses, return as addressed utxo's
 */
export const toSenderUtxos = async (
  addresses: Array<{|...Address, ...Addressing|}>,
): Promise<Array<AddressedUtxo>> => {
  // fetch UTXO
  const utxos = await bulkFetchUTXOsForAddresses(
    addresses.map((addr) => addr.address),
  )
  // add addressing info to the UTXO
  const addressingMap = new Map<string, Addressing>(
    addresses.map((entry) => [entry.address, {addressing: entry.addressing}]),
  )
  const senderUtxos = utxos.map((utxo) => {
    const addressing = addressingMap.get(utxo.receiver)
    if (addressing == null) {
      throw new Error('should never happen')
    }
    return {
      ...utxo,
      addressing: addressing.addressing,
    }
  })

  if (isEmpty(utxos)) {
    const error = new Error('No inputs error')
    Logger.error(`legacyYoroi::toSenderUtxos ${error.message}`)
    throw error
  }

  return senderUtxos
}

export const generateLegacyYoroiTransferTx = async (
  addresses: Array<{|address: string, ...Addressing|}>,
  outputAddr: string,
  signingKey: Bip32PrivateKey,
): Promise<TransferTx> => {
  const senderUtxos = await toSenderUtxos(addresses)

  const txRequest = {
    outputAddr,
    signingKey,
    senderUtxos,
  }
  return buildYoroiTransferTx(txRequest)
}

export const generateTransferTxFromMnemonic = async (
  recoveryPhrase: string,
  destinationAddress: string,
  fundedAddresses: Array<{|address: string, ...Addressing|}>,
): Promise<TransferTx> => {
  // Perform restoration
  // for now we only support transfering from Byron to Shelley
  const accountKey = await (await (await (await generateWalletRootKey(
    recoveryPhrase,
  )).derive(CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.BIP44)).derive(
    CONFIG.NUMBERS.COIN_TYPES.CARDANO,
  )).derive(0 + CONFIG.NUMBERS.HARD_DERIVATION_START)

  // generate transaction
  const transferTx = await generateLegacyYoroiTransferTx(
    fundedAddresses,
    destinationAddress,
    accountKey,
  )
  // Possible exception: NotEnoughMoneyToSendError
  return transferTx
}
