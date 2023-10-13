import {Swap} from '@yoroi/types'

import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {YoroiEntry} from '../../../yoroi-wallets/types'
import {Quantities} from '../../../yoroi-wallets/utils'
export const createYoroiEntry = (
  createOrder: Swap.CreateOrderData,
  address: string,
  wallet: YoroiWallet,
): YoroiEntry => {
  const amountEntry = {}

  const sellTokenId = createOrder.amounts.sell.tokenId
  // summing fees is missing the frontend fee
  if (sellTokenId === wallet.primaryTokenInfo.id) {
    amountEntry[sellTokenId] = Quantities.sum([
      createOrder.selectedPool.deposit.quantity,
      createOrder.selectedPool.batcherFee.quantity,
      createOrder.amounts.sell.quantity,
    ])
  } else {
    amountEntry[wallet.primaryTokenInfo.id] = Quantities.sum([
      createOrder.selectedPool.deposit.quantity,
      createOrder.selectedPool.batcherFee.quantity,
    ])
    amountEntry[sellTokenId] = createOrder.amounts.sell.quantity
  }

  return {
    address: address,
    amounts: amountEntry,
  }
}
