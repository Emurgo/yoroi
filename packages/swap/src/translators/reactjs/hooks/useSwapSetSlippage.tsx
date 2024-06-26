import {UseMutationOptions} from '@tanstack/react-query'

import {useSwap} from './useSwap'
import {useMutationWithInvalidations} from '@yoroi/common'
import {swapStorageSlippageKey} from '../../../adapters/async-storage/storage'

export const useSwapSetSlippage = (
  options?: UseMutationOptions<void, Error, number>,
) => {
  const {slippage} = useSwap()

  const mutation = useMutationWithInvalidations<void, Error, number>({
    useErrorBoundary: true,
    invalidateQueries: [[swapStorageSlippageKey]],
    ...options,
    mutationFn: slippage.save,
  })

  return mutation.mutate
}
