import {Datum} from '@emurgo/yoroi-lib'
import {useSwap} from '@yoroi/swap'
import {UseMutationOptions} from 'react-query'

import {useSelectedWallet} from '../../../SelectedWallet'
import {useMutationWithInvalidations} from '../../../yoroi-wallets/hooks'
import {YoroiEntry, YoroiUnsignedTx} from '../../../yoroi-wallets/types'
import {splitStringInto64CharArray} from '../../../yoroi-wallets/utils'

export const useSwapTx = (options?: UseMutationOptions<YoroiUnsignedTx, Error, {entry: YoroiEntry; datum: Datum}>) => {
  const {orderData} = useSwap()
  const pool = orderData.selectedPoolCalculation?.pool
  const metadata = [
    {
      label: '674',
      data: {
        msg: splitStringInto64CharArray(
          JSON.stringify({
            provider: pool?.provider,
            sellTokenId: orderData.amounts.sell.tokenId,
            sellQuantity: orderData.amounts.sell.quantity,
            buyTokenId: orderData.amounts.buy.tokenId,
            buyQuantity: orderData.amounts.buy.quantity,
            feeTokenId: pool?.deposit.tokenId,
          }),
        ),
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
