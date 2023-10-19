import {useQuery, UseQueryOptions} from 'react-query'
import {Swap} from '@yoroi/types'
import {useSwap} from './useSwap'

export const useFrontendFees = (
  options?: UseQueryOptions<
    Swap.DiscountTier[],
    Error,
    Swap.DiscountTier[],
    ['useFrontendFees']
  >,
) => {
  const {frontendFees} = useSwap()

  return useQuery({
    queryKey: ['useFrontendFees'],
    queryFn: () =>
      frontendFees.get().then((fees) => [...(fees.muesliswap?.tiers ?? [])]),
    useErrorBoundary: true,
    ...options,
  })
}
