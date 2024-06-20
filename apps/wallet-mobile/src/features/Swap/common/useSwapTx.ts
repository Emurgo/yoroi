import {useMutationWithInvalidations} from '@yoroi/common'
import {useSwap} from '@yoroi/swap'
import {UseMutationOptions} from 'react-query'

import {YoroiEntry, YoroiUnsignedTx} from '../../../yoroi-wallets/types'
import {splitStringInto64CharArray} from '../../../yoroi-wallets/utils'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'

export const useSwapTx = (options?: UseMutationOptions<YoroiUnsignedTx, Error, {entries: YoroiEntry[]}>) => {
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
          }),
        ),
      },
    },
  ]

  const {wallet} = useSelectedWallet()
  const mutation = useMutationWithInvalidations({
    mutationFn: (data) => wallet.createUnsignedTx(data.entries, metadata),
    invalidateQueries: [['useCreateOrder']],
    ...options,
  })

  return {
    createUnsignedTx: mutation.mutate,
    ...mutation,
  }
}
