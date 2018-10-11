// @flow
/* eslint-disable no-console */

import moment from 'moment'
import _ from 'lodash'

import type {HistoryTransaction, RawTransaction} from '../types/HistoryTransaction'

// Fixme: Get real values and put it into config somewhere
export const confirmationsToAssuranceLevel = (confirmations: number) => {
  if (confirmations < 5) {
    return 'LOW'
  }

  if (confirmations < 9) {
    return 'MEDIUM'
  }

  return 'HIGH'
}

// TODO(ppershing): probably belongs to utils/localization once we have it
export const printAda = (amount: number) => {
  // 1 ADA = 1 000 000 micro ada
  return (amount / 1000000).toFixed(6)
}


// Note(ppershing): upgrade to bignum once we use it
const _sum = (a: Array<{amount: number}>) => a.reduce((acc, x) => acc + x.amount, 0)

export const processTxHistoryData =
(data: RawTransaction, ownAddresses: Array<string>): HistoryTransaction => {

  const parse = (addresses, amounts) => _.zip(addresses, amounts)
    .map(([address, amount]) => ({
      address,
      amount: parseInt(amount, 10),
    }))

  const inputs = parse(data.inputs_address, data.inputs_amount)
  const outputs = parse(data.outputs_address, data.outputs_amount)

  const ownInputs = inputs.filter((input) => ownAddresses.includes(input.address))

  const ownOutputs = outputs.filter((input) => ownAddresses.includes(input.address))

  const hasOnlyOwnInputs = ownInputs.length === inputs.length
  const hasOnlyOwnOutputs = ownOutputs.length === outputs.length
  const isIntraWallet = hasOnlyOwnInputs && hasOnlyOwnOutputs

  if (ownInputs.length > 0 && ownInputs.length !== inputs.length) {
    // this really should not happen
    console.error('I see a transaction where only some of the inputs are mine')
    console.error('This probably means broken address discovery!')

  }

  const totalIn = _sum(inputs)
  const totalOut = _sum(outputs)
  const ownIn = _sum(ownInputs)
  const ownOut = _sum(ownOutputs)

  // TODO(ppershing): this needs way more careful handling
  const amount = isIntraWallet
    ? 0 // does not make sense
    : Math.abs(ownIn - ownOut)

  return {
    id: data.hash,
    fromAddresses: data.inputs_address,
    toAddresses: data.outputs_address,
    amount,
    fee: totalIn - totalOut,
    confirmations: parseInt(data.best_block_num, 10) - parseInt(data.block_num, 10),
    direction: isIntraWallet ? 'SELF' : (ownOut - ownIn >= 0 ? 'RECEIVED' : 'SENT'),
    timestamp: moment(data.time),
    updatedAt: moment(data.last_update),
    status: data.tx_state,
  }
}

