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
        sellTokenId: splitStringInto64CharArray(createOrder.amounts.sell.tokenId),
        sellQuantity: [createOrder.amounts.sell.quantity],
        buyTokenId: splitStringInto64CharArray(createOrder.amounts.buy.tokenId),
        buyQuantity: [createOrder.amounts.buy.quantity],
        depositFee: [createOrder.selectedPool.deposit.quantity],
        poolId: [splitStringInto64CharArray(createOrder.selectedPool.poolId)],
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

function splitStringInto64CharArray(inputString: string): string[] {
  const maxLength = 64
  const resultArray: string[] = []

  for (let i = 0; i < inputString.length; i += maxLength) {
    const substring = inputString.slice(i, i + maxLength)
    resultArray.push(substring)
  }

  return resultArray
}
