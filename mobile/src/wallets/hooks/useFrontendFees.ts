import {App} from '@yoroi/types'

import {UseSuspenseQueryOptions, useSuspenseQuery} from '@tanstack/react-query'

import {YoroiWallet} from '../cardano/types'

export const useFrontendFees = (
  wallet: YoroiWallet,
  options?: UseSuspenseQueryOptions<
    App.FrontendFeesResponse,
    Error,
    App.FrontendFeesResponse,
    [string, 'frontend-fees']
  >,
) => {
  const query = useSuspenseQuery({
    queryKey: [wallet.id, 'frontend-fees'],
    ...options,
    queryFn: () =>
      wallet.api.getFrontendFees().catch(() => ({
        // TODO: Without this it break when offline. Needs better fixing
      })),
  })

  return {
    ...query,
    aggregatedFrontendFeeTiers: query.data,
  }
}
