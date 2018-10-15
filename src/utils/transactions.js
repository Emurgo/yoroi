// @flow

import moment from 'moment'
import _ from 'lodash'

import {TRANSACTION_DIRECTION, TRANSACTION_STATUS} from '../types/HistoryTransaction'
import {CONFIG} from '../config'
import {Logger} from '../utils/logging'

import type {HistoryTransaction, RawTransaction} from '../types/HistoryTransaction'


type TransactionAssurance = 'PENDING' | 'FAILED' | 'LOW' | 'MEDIUM' | 'HIGH'

// TODO(ppershing): create Flow type for this
export const getTransactionAssurance = (transaction: HistoryTransaction): TransactionAssurance => {
  if (transaction.status === TRANSACTION_STATUS.PENDING) return 'PENDING'
  if (transaction.status === TRANSACTION_STATUS.FAILED) return 'FAILED'
  if (transaction.status !== TRANSACTION_STATUS.SUCCESSFUL) {
    throw new Error('Internal error - unknown transaciton status')
  }

  // TODO(ppershing): this should be configurable
  const levels = CONFIG.ASSURANCE_LEVELS

  if (transaction.confirmations < levels.LOW) return 'LOW'
  if (transaction.confirmations < levels.MEDIUM) return 'MEDIUM'
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
    Logger.warn('I see a transaction where only some of the inputs are mine')
    Logger.warn('This probably means broken address discovery!')
  }

  const totalIn = _sum(inputs)
  const totalOut = _sum(outputs)
  const ownIn = _sum(ownInputs)
  const ownOut = _sum(ownOutputs)

  /*
  Calculating costs and direction from just inputs and outputs is quite tricky.
  Let's use the representation where amounts represent gain in our wallet after the
  transaction, i.e.:
  * positive amounts = incoming, negative amounts = outgoing
  * by the same logic, fees are represented by negative numbers

  Then our main goal is to maintain the following two invariants:
  * brutto amount = sum of our outputs - sum of our inputs
  * brutto amount = netto (shown) amount + (our) fee  (Note the plus here)
  * fee is either zero (no cost) or negative (transaction costed us something)

  1) If all inputs and outputs are our addresses, this is clearly an intrawallet
    transaction. There is no point in calculating the amount, only the transaction
    fee.

  2) If we do not have our address in the inputs, this is clearly an incoming
    transaction. Fee does not apply as we are just receiving money.

  3) If all inputs are ours (and at least one output is not), this is an
    outgoing transaction. Fee is the difference between total inputs and total outputs.

  4) if only some of the inputs are ours we are handling a special transaction.
    Such transactions could be constructed by hand but in reality it is probable
    that our wallet just failed to discover one of its own addresses.
    We will conservatively mark zero fee and decide on the transaction direction by the money flow
  */
  const brutto = ownOut - ownIn
  const totalFee = totalOut - totalIn // should be negative

  let amount
  let fee
  let direction
  if (isIntraWallet) {
    amount = 0
    fee = totalFee
    direction = TRANSACTION_DIRECTION.SELF
  } else {
    fee = hasOnlyOwnInputs ? totalFee : 0
    amount = brutto - fee
    direction = (amount >= 0)
      ? TRANSACTION_DIRECTION.RECEIVED
      : TRANSACTION_DIRECTION.SENT
  }

  return {
    id: data.hash,
    fromAddresses: data.inputs_address,
    toAddresses: data.outputs_address,
    amount: Math.abs(amount),
    bruttoAmount: brutto,
    fee,
    confirmations: parseInt(data.best_block_num, 10) - parseInt(data.block_num, 10),
    direction,
    timestamp: moment(data.time),
    updatedAt: moment(data.last_update),
    status: data.tx_state,
  }
}

