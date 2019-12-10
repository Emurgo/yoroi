// @flow
import {BigNumber} from 'bignumber.js'
import {Address, Bip32PrivateKey} from 'react-native-chain-libs'
import type {AddressedUtxo} from '../../../types/HistoryTransaction'
import {signTransaction, sendAllUnsignedTx} from './utxoTransactions'
import {getShelleyTxFee} from './utils'
import {addressToDisplayString} from '../../commonUtils'
import {CONFIG, NUMBERS} from '../../../config'
import {Logger} from '../../../utils/logging'

type TransferTx = {
  recoveredBalance: BigNumber,
  fee: BigNumber,
  id: string,
  encodedTx: Uint8Array,
  senders: Array<string>,
  receiver: string,
}

/**
 * Generate transaction including all addresses with no change.
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
    const fee = await getShelleyTxFee(unsignedTxResponse.IOs, false)

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
      recoveredBalance: totalBalance.dividedBy(NUMBERS.LOVELACES_PER_ADA),
      fee: fee.dividedBy(NUMBERS.LOVELACES_PER_ADA),
      id: Buffer.from(await (await fragment.id()).as_bytes()).toString('hex'),
      encodedTx: await fragment.as_bytes(),
      // recall: some addresses may be legacy, some may be Shelley
      senders: await Promise.all(
        uniqueSenders.map(async (addr) => await addressToDisplayString(addr)),
      ),
      receiver: await (await Address.from_bytes(
        Buffer.from(outputAddr, 'hex'),
      )).to_string(CONFIG.BECH32_PREFIX.ADDRESS),
    }
  } catch (error) {
    Logger.error(`transfer::buildYoroiTransferTx: ${error.message}`)
    throw new Error(`buildYoroiTransferTx: ${error.message}`)
  }
}
