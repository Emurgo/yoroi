import {UseQueryOptions, useQuery} from 'react-query'

import {swapStorageSlippageKey} from '../../../adapters/async-storage/storage'
import {useSwap} from './useSwap'

export const useSwapSlippage = (
  options?: UseQueryOptions<number, Error, number, [string]>,
) => {
  const {slippage} = useSwap()
  const query = useQuery({
    suspense: true,
    queryKey: [swapStorageSlippageKey],
    ...options,
    queryFn: slippage.read,
  })

  if (query.data == null)
    throw new Error('[@yoroi/swap] useSwapSlippage invalid state')

  return query.data
}
