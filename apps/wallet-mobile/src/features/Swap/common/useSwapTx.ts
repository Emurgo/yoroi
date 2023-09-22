import {Datum} from '@emurgo/yoroi-lib'
import {useSwap} from '@yoroi/swap'
import {Swap} from '@yoroi/types'
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
        msg: formatMetadata(createOrder),
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

const formatMetadata = (createOrder: Swap.CreateOrderData) => {
  if (createOrder.selectedPool !== undefined) {
    return [
      `address: ${createOrder.address}`,
      `buyQuantity: ${createOrder.amounts.buy.quantity}`,
      `buyTokenId: ${createOrder.amounts.buy.tokenId}`,
      `sellQuantity: ${createOrder.amounts.sell.quantity}`,
      `sellTokenId: ${createOrder.amounts.sell.tokenId}`,
      `poolDeposit: ${createOrder.selectedPool.deposit.quantity}`,
      `poolBacherFee: ${createOrder.selectedPool.batcherFee.quantity}`,
      `poolId: ${createOrder.selectedPool.poolId}`,
      `slippage: ${createOrder.slippage}`,
    ]
      .map((item) => splitStringInto64CharArray(item))
      .flat()
  }
  return []
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
