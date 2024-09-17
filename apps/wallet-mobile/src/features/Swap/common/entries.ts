import {Balance, Portfolio, Swap} from '@yoroi/types'

import {YoroiEntry} from '../../../yoroi-wallets/types/yoroi'
import {asQuantity} from '../../../yoroi-wallets/utils/utils'

/**
 * Build the YoroiEntry to add the extra output for the swap transaciton with the frontend fee.
 *
 * @param {Portfolio.Token.Amount} fee - The fee amount.
 * @param {string | undefined} addressFeeDeposit - The address to deposit the fee to.
 *
 * @returns {YoroiEntry | null} The entry for the fee or null if missing fee or address.
 */
export const makePossibleFrontendFeeEntry = (
  fee: Portfolio.Token.Amount,
  addressFeeDeposit: string | undefined,
): YoroiEntry | null => {
  const {quantity} = fee
  if (addressFeeDeposit == null || quantity === 0n) return null

  return {
    address: addressFeeDeposit,
    amounts: {['.']: asQuantity(quantity.toString())},
  } as const
}

/**
 * Create a YoroiEntry for the swap order.
 *
 * @param {Swap.CreateOrderData['amounts']} amounts - The amounts for creating the order.
 * @param {Swap.CreateOrderData['selectedPool']} selectedPool- The selected pool for creating the order.
 * @param {string} address - The address associated with the order.
 * @param {Portfolio.Token.Id} primaryTokenId - The ID of the primary token.
 * @param {YoroiEntry['datum']} datum - The datum associated with the entry.
 *
 * @returns {YoroiEntry} The YoroiEntry it can have one amount or two depending on what is selling, if is primary just one amount, if is not primary two amounts.
 */
export const createOrderEntry = (
  amounts: Swap.CreateOrderData['amounts'],
  selectedPool: Swap.CreateOrderData['selectedPool'],
  address: string,
  primaryTokenId: Portfolio.Token.Id,
  // create order is passing {data: cbor}
  datum: YoroiEntry['datum'],
): YoroiEntry => {
  const amountEntry: Record<string, Balance.Quantity> = {}
  const sellTokenId = amounts.sell.tokenId
  const isSellPrimaryToken = sellTokenId === primaryTokenId

  if (isSellPrimaryToken) {
    amountEntry[primaryTokenId] = asQuantity(
      (selectedPool.deposit.quantity + selectedPool.batcherFee.quantity + amounts.sell.quantity).toString(),
    )
  } else {
    amountEntry[primaryTokenId] = asQuantity(
      (selectedPool.deposit.quantity + selectedPool.batcherFee.quantity).toString(),
    )
    amountEntry[sellTokenId] = asQuantity(amounts.sell.quantity.toString())
  }

  return {
    address: address,
    amounts: amountEntry,
    datum,
  } as const
}
