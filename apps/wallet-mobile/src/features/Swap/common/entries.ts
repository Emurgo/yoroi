import {Balance, Swap} from '@yoroi/types'

import {YoroiEntry} from '../../../yoroi-wallets/types'
import {Quantities} from '../../../yoroi-wallets/utils'

/**
 * Build the YoroiEntry to add the extra output for the swap transaciton with the frontend fee.
 *
 * @param {Balance.Amount} fee - The fee amount.
 * @param {string | undefined} addressFeeDeposit - The address to deposit the fee to.
 *
 * @returns {YoroiEntry | null} The entry for the fee or null if missing fee or address.
 */
export const makePossibleFrontendFeeEntry = (
  fee: Balance.Amount,
  addressFeeDeposit: string | undefined,
): YoroiEntry | null => {
  if (addressFeeDeposit == null) return null

  const {quantity, tokenId} = fee
  const hasFrontendFee = !Quantities.isZero(quantity)
  if (!hasFrontendFee) return null

  return {
    address: addressFeeDeposit,
    amounts: {[tokenId]: quantity},
  } as const
}

/**
 * Create a YoroiEntry for the swap order.
 *
 * @param {Swap.CreateOrderData['amounts']} amounts - The amounts for creating the order.
 * @param {Swap.CreateOrderData['selectedPool']} selectedPool- The selected pool for creating the order.
 * @param {string} address - The address associated with the order.
 * @param {Balance.TokenInfo['id']} primaryTokenId - The ID of the primary token.
 * @param {YoroiEntry['datum']} datum - The datum associated with the entry.
 *
 * @returns {YoroiEntry} The YoroiEntry it can have one amount or two depending on what is selling, if is primary just one amount, if is not primary two amounts.
 */
export const createOrderEntry = (
  amounts: Swap.CreateOrderData['amounts'],
  selectedPool: Swap.CreateOrderData['selectedPool'],
  address: string,
  primaryTokenId: Balance.TokenInfo['id'],
  // create order is passing {data: cbor}
  datum: YoroiEntry['datum'],
): YoroiEntry => {
  const amountEntry = {}
  const sellTokenId = amounts.sell.tokenId
  const isSellPrimaryToken = sellTokenId === primaryTokenId

  if (isSellPrimaryToken) {
    amountEntry[sellTokenId] = Quantities.sum([
      selectedPool.deposit.quantity,
      selectedPool.batcherFee.quantity,
      amounts.sell.quantity,
    ])
  } else {
    amountEntry[primaryTokenId] = Quantities.sum([selectedPool.deposit.quantity, selectedPool.batcherFee.quantity])
    amountEntry[sellTokenId] = amounts.sell.quantity
  }

  return {
    address: address,
    amounts: amountEntry,
    datum,
  } as const
}
