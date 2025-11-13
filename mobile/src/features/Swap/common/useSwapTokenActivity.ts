import {time} from '@yoroi/common'
import {Portfolio} from '@yoroi/types'

import {useQuery} from '@tanstack/react-query'

import {useSelectedNetwork} from '~/features/WalletManager/hooks/useSelectedNetwork'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {logger} from '~/kernel/logger/logger'

export const useSwapTokenActivity = (tokenIds: Portfolio.Token.Id[]) => {
  const {wallet} = useSelectedWallet()
  const {
    networkManager: {tokenManager, network},
  } = useSelectedNetwork()

  return useQuery({
    enabled: tokenIds.length > 0 && wallet.isMainnet,
    staleTime: time.fiveMinutes,
    gcTime: time.minutes(10),
    retryDelay: time.oneSecond,
    refetchInterval: time.fiveMinutes,
    queryKey: ['useSwapTokenActivity', network, tokenIds],
    queryFn: async () => {
      if (tokenIds.length === 0) return {}

      const response = await tokenManager.api.tokenActivity(
        tokenIds,
        Portfolio.Token.ActivityWindow.OneDay,
      )

      if (response.tag === 'left') {
        logger.error(
          JSON.stringify({endpoint: 'swapTokenActivity', ...response.error}),
        )
        return {}
      }
      return response.value.data
    },
  })
}
