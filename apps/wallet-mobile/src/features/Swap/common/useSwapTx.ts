import {Datum} from '@emurgo/yoroi-lib'
import {useSwap} from '@yoroi/swap'
import {UseMutationOptions} from 'react-query'

import {useSelectedWallet} from '../../../SelectedWallet'
import {useMutationWithInvalidations} from '../../../yoroi-wallets/hooks'
import {YoroiEntry, YoroiUnsignedTx} from '../../../yoroi-wallets/types'

export const useSwapTx = (options?: UseMutationOptions<YoroiUnsignedTx, Error, {entry: YoroiEntry; datum: Datum}>) => {
  const {createOrder} = useSwap()

  const metadata = [
    {
      label: '674',
      data: {
        provider: [createOrder.selectedPool.provider],
        sellTokenId: createOrder.amounts.sell.tokenId.split('.'),
        sellQuantity: [createOrder.amounts.sell.quantity],
        buyTokenId: createOrder.amounts.buy.tokenId.split('.'),
        buyQuantity: [createOrder.amounts.buy.quantity],
        depositFee: [createOrder.selectedPool.deposit.quantity],
        poolId: [createOrder.selectedPool.poolId],
      },
    },
  ]

  const wallet = useSelectedWallet()
  const mutation = useMutationWithInvalidations({
    mutationFn: (data) => wallet.createUnsignedTx(data.entry, metadata, data.datum),
    invalidateQueries: ['useCreateOrder'],
    ...options,
  })

  return {
    createUnsignedTx: mutation.mutate,
    ...mutation,
  }
}
