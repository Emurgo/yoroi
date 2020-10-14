// @flow
import {BigNumber} from 'bignumber.js'

import {
  TRANSACTION_DIRECTION,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '../types/HistoryTransaction'
import {CONFIG} from '../config/config'
import {Logger} from '../utils/logging'
import assert from '../utils/assert'
import {CERTIFICATE_KIND} from '../api/types'

import type {TransactionInfo, Transaction} from '../types/HistoryTransaction'
import type {WalletImplementationId} from '../config/types'

type TransactionAssurance = 'PENDING' | 'FAILED' | 'LOW' | 'MEDIUM' | 'HIGH'

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

const _sum = (a: Array<{address: string, amount: string}>): BigNumber =>
  a.reduce(
    (acc: BigNumber, x) => acc.plus(new BigNumber(x.amount, 10)),
    new BigNumber(0),
  )

const _multiPartyWarningCache = {}

export const processTxHistoryData = (
  tx: Transaction,
  ownAddresses: Array<string>,
  confirmations: number,
  walletImplementationId: WalletImplementationId,
): TransactionInfo => {
  // rename to match yoroi extension notation
  const utxoInputs = tx.inputs
  const utxoOutputs = tx.outputs
  const accountingInputs = tx.withdrawals
  // const accountingOutpus // eventually

  const ownImplicitInput = new BigNumber(0)
  const ownImplicitOutput = (() => {
    if (tx.type === TRANSACTION_TYPE.SHELLEY) {
      let implicitOutputSum = new BigNumber(0)
      for (const cert of tx.certificates) {
        if (cert.kind !== CERTIFICATE_KIND.MOVE_INSTANTANEOUS_REWARDS) {
          continue
        }
        const {rewards} = cert
        if (rewards == null) continue // shouldn't happen
        for (const rewardAddr in rewards) {
          if (ownAddresses.includes(rewardAddr)) {
            implicitOutputSum = implicitOutputSum.plus(rewards[rewardAddr])
          }
        }
      }
      return implicitOutputSum
    }
    return new BigNumber(0)
  })()

  const unifiedInputs = [...utxoInputs, ...accountingInputs]
  const unifiedOutputs = [
    ...utxoOutputs,
    // ...accountingOutpus,
  ]
  const ownInputs = unifiedInputs.filter(({address}) =>
    ownAddresses.includes(address),
  )

  const ownOutputs = unifiedOutputs.filter(({address}) =>
    ownAddresses.includes(address),
  )

  const totalIn = _sum(unifiedInputs)
  const totalOut = _sum(unifiedOutputs)
  const ownIn = _sum(ownInputs).plus(ownImplicitInput)
  const ownOut = _sum(ownOutputs).plus(ownImplicitOutput)

  const hasOnlyOwnInputs = ownInputs.length === unifiedInputs.length
  const hasOnlyOwnOutputs = ownOutputs.length === unifiedOutputs.length

  const isIntraWallet = hasOnlyOwnInputs && hasOnlyOwnOutputs
  const isMultiParty =
    ownInputs.length > 0 && ownInputs.length !== unifiedInputs.length

  if (isMultiParty && !_multiPartyWarningCache[tx.id]) {
    _multiPartyWarningCache[tx.id] = true
    Logger.warn(
      'I see a multi-party transaction (only some of the inputs are mine)',
    )
    Logger.warn('This probably means broken address discovery!')
    Logger.warn(`Transaction: ${tx.id}`)
  }

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
  const remoteFee = tx.fee != null ? new BigNumber(tx.fee) : null
  let direction
  if (isIntraWallet) {
    direction = TRANSACTION_DIRECTION.SELF
    amount = new BigNumber(0)
    fee = remoteFee ?? totalFee
  } else if (isMultiParty) {
    direction = TRANSACTION_DIRECTION.MULTI
    amount = brutto
    fee = null
  } else if (hasOnlyOwnInputs) {
    direction = TRANSACTION_DIRECTION.SENT
    amount = brutto.minus(totalFee)
    fee = remoteFee ?? totalFee
  } else {
    assert.assert(
      ownInputs.length === 0,
      'This cannot be receiving transaction',
    )
    assert.assert(brutto.gte(0), 'Received negative funds')
    direction = TRANSACTION_DIRECTION.RECEIVED
    amount = brutto
    fee = null
  }

  const assurance = getTransactionAssurance(tx.status, confirmations)

  return {
    id: tx.id,
    fromAddresses: tx.inputs.map(({address}) => address),
    toAddresses: tx.outputs.map(({address}) => address),
    amount,
    fee,
    bruttoAmount: brutto,
    bruttoFee: totalFee,
    confirmations,
    direction,
    submittedAt: tx.submittedAt,
    lastUpdatedAt: tx.lastUpdatedAt,
    status: tx.status,
    assurance,
  }
}
