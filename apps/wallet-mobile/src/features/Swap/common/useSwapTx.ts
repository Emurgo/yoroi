import {Datum} from '@emurgo/yoroi-lib'
import {useSwap} from '@yoroi/swap'
import {UseMutationOptions} from 'react-query'

import {useSelectedWallet} from '../../../SelectedWallet'
import {useMutationWithInvalidations} from '../../../yoroi-wallets/hooks'
import {YoroiEntry, YoroiUnsignedTx} from '../../../yoroi-wallets/types'
import {splitStringInto64CharArray} from '../../../yoroi-wallets/utils'

export const useSwapTx = (options?: UseMutationOptions<YoroiUnsignedTx, Error, {entry: YoroiEntry; datum: Datum}>) => {
  const {createOrder} = useSwap()

  const metadata = [
    {
      label: '674',
      data: {
        msg: splitStringInto64CharArray(
          JSON.stringify({
            provider: createOrder.selectedPool.provider,
            sellTokenId: createOrder.amounts.sell.tokenId,
            sellQuantity: createOrder.amounts.sell.quantity,
            buyTokenId: createOrder.amounts.buy.tokenId,
            buyQuantity: createOrder.amounts.buy.quantity,
            depositFee: createOrder.selectedPool.deposit.quantity,
            feeTokenId: createOrder.selectedPool.deposit.tokenId,
            poolId: createOrder.selectedPool.poolId,
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
