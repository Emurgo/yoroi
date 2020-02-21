// @flow
import {InsufficientFunds} from '../../errors'
import {
  Fee,
  FragmentId,
  Input,
  InputOutputBuilder,
  Payload,
  UtxoPointer,
  Value,
} from 'react-native-chain-libs'

import type {RawUtxo} from '../../../types/HistoryTransaction'

export const utxoToTxInput = async (utxo: RawUtxo): Input => {
  const txoPointer = await UtxoPointer.new(
    await FragmentId.from_bytes(Buffer.from(utxo.tx_hash, 'hex')),
    utxo.tx_index,
    await Value.from_str(utxo.amount),
  )
  return await Input.from_utxo(txoPointer)
}

export const selectAllInputSelection = async (
  txBuilder: InputOutputBuilder,
  allUtxos: Array<RawUtxo>,
  feeAlgorithm: Fee,
  payload: Payload,
): Promise<Array<RawUtxo>> => {
  const selectedOutputs = []
  if (allUtxos.length === 0) {
    throw new InsufficientFunds()
  }
  for (let i = 0; i < allUtxos.length; i++) {
    selectedOutputs.push(allUtxos[i])
    await txBuilder.add_input(await utxoToTxInput(allUtxos[i]))
  }
  const txBalance = await txBuilder.get_balance(payload, feeAlgorithm)
  if (!(await txBalance.is_negative())) {
    return selectedOutputs
  }
  throw new InsufficientFunds()
}

export const firstMatchFirstInputSelection = async (
  txBuilder: InputOutputBuilder,
  allUtxos: Array<RawUtxo>,
  feeAlgorithm: Fee,
  payload: Payload,
): Promise<Array<RawUtxo>> => {
  const selectedOutputs = []
  if (allUtxos.length === 0) {
    throw new InsufficientFunds()
  }
  // add UTXOs in whatever order they're sorted until we have enough for amount+fee
  for (let i = 0; i < allUtxos.length; i++) {
    selectedOutputs.push(allUtxos[i])
    await txBuilder.add_input(await utxoToTxInput(allUtxos[i]))
    const txBalance = await txBuilder.get_balance(payload, feeAlgorithm)
    if (!(await txBalance.is_negative())) {
      break
    }
    if (i === allUtxos.length - 1) {
      throw new InsufficientFunds()
    }
  }
  return selectedOutputs
}
