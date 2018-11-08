// @flow

import {BigNumber} from 'bignumber.js'

import {
  TRANSACTION_DIRECTION,
  TRANSACTION_STATUS,
} from '../types/HistoryTransaction'
import {CONFIG} from '../config'
import {Logger} from '../utils/logging'

import type {TransactionInfo, Transaction} from '../types/HistoryTransaction'

type TransactionAssurance = 'PENDING' | 'FAILED' | 'LOW' | 'MEDIUM' | 'HIGH'

// TODO(ppershing): create Flow type for this
export const getTransactionAssurance = (
  status: $Values<typeof TRANSACTION_STATUS>,
  confirmations: number,
): TransactionAssurance => {
  if (status === TRANSACTION_STATUS.PENDING) return 'PENDING'
  if (status === TRANSACTION_STATUS.FAILED) return 'FAILED'
  if (status !== TRANSACTION_STATUS.SUCCESSFUL) {
    throw new Error('Internal error - unknown transaction status')
  }

  const assuranceLevelCutoffs = CONFIG.ASSURANCE_LEVELS

  if (confirmations < assuranceLevelCutoffs.LOW) return 'LOW'
  if (confirmations < assuranceLevelCutoffs.MEDIUM) return 'MEDIUM'
  return 'HIGH'
}

const _sum = (a: Array<{address: string, amount: BigNumber}>): BigNumber =>
  a.reduce((acc: BigNumber, x) => acc.plus(x.amount), new BigNumber(0))

const _multiPartyWarningCache = {}

export const processTxHistoryData = (
  tx: Transaction,
  ownAddresses: Array<string>,
  confirmations: number,
): TransactionInfo => {
  const ownInputs = tx.inputs.filter(({address}) =>
    ownAddresses.includes(address),
  )

  const ownOutputs = tx.outputs.filter(({address}) =>
    ownAddresses.includes(address),
  )

  const hasOnlyOwnInputs = ownInputs.length === tx.inputs.length
  const hasOnlyOwnOutputs = ownOutputs.length === tx.outputs.length
  const isIntraWallet = hasOnlyOwnInputs && hasOnlyOwnOutputs
  const isMultiParty =
    ownInputs.length > 0 && ownInputs.length !== tx.inputs.length
  if (isMultiParty && !_multiPartyWarningCache[tx.id]) {
    _multiPartyWarningCache[tx.id] = true
    Logger.warn(
      'I see a multi-party transaction (only some of the inputs are mine)',
    )
    Logger.warn('This probably means broken address discovery!')
    Logger.warn('Transaction:', tx)
  }

  const totalIn = _sum(tx.inputs)
  const totalOut = _sum(tx.outputs)
  const ownIn = _sum(ownInputs)
  const ownOut = _sum(ownOutputs)

  /*
  Calculating costs and direction from just inputs and outputs is quite tricky.
  Let's use the representation where amounts represent gain in our
  wallet after the
  transaction, i.e.:
  * positive amounts = incoming, negative amounts = outgoing
  * by the same logic, fees are represented by negative numbers

  Then our main goal is to maintain the following two invariants:
  * brutto amount = sum of our outputs - sum of our inputs
  * brutto amount = netto (shown) amount + (our) fee  (Note the plus here)
  * fee is either zero (no cost) or negative (transaction costed us something)

  1) If all inputs and outputs are our addresses, this is clearly an intrawallet
    transaction. There is no point in calculating the amount,
    only the transaction
    fee.

  2) If we do not have our address in the inputs, this is clearly an incoming
    transaction. Fee does not apply as we are just receiving money.

  3) If all inputs are ours (and at least one output is not), this is an
    outgoing transaction. Fee is the difference between total
    inputs and total outputs.

  4) if only some of the inputs are ours we are handling a special
    multi-party transaction.
    Such transactions could be constructed by hand but in reality it is probable
    that our wallet just failed to discover one of its own addresses.
    We will conservatively mark zero fee.
  */
  const brutto = ownOut.minus(ownIn)
  const totalFee = totalOut.minus(totalIn) // should be negative

  let amount
  let fee
  let direction
  if (isIntraWallet) {
    amount = new BigNumber(0)
    fee = totalFee
    direction = TRANSACTION_DIRECTION.SELF
  } else if (isMultiParty) {
    direction = TRANSACTION_DIRECTION.MULTI
    amount = brutto
    fee = new BigNumber(0)
  } else {
    fee = hasOnlyOwnInputs ? totalFee : new BigNumber(0)
    amount = brutto.minus(fee)
    direction = amount.gte(0)
      ? TRANSACTION_DIRECTION.RECEIVED
      : TRANSACTION_DIRECTION.SENT
  }

  const assurance = getTransactionAssurance(tx.status, confirmations)

  return {
    id: tx.id,
    fromAddresses: tx.inputs.map(({address}) => address),
    toAddresses: tx.outputs.map(({address}) => address),
    amount,
    bruttoAmount: brutto,
    fee,
    confirmations,
    direction,
    submittedAt: tx.submittedAt,
    lastUpdatedAt: tx.lastUpdatedAt,
    status: tx.status,
    assurance,
  }
}
