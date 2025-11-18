import {useQuery} from '@tanstack/react-query'
import * as React from 'react'

import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useLanguage} from '~/kernel/i18n/LanguageProvider'
import {logger} from '~/kernel/logger/logger'

export const useTopStakePool = () => {
  const {wallet} = useSelectedWallet()
  const {walletManager} = useWalletManager()
  const {languageCode} = useLanguage()

  const plate = React.useMemo(
    () => walletManager.checksum(wallet.publicKeyHex).plate,
    [walletManager, wallet.publicKeyHex],
  )

  const query = useQuery({
    queryKey: ['topStakePool', plate, languageCode, wallet.id],
    queryFn: async () => {
      if (!wallet.isMainnet) {
        // No pool list available for testnets
        return null
      }

      try {
        const lang = languageCode.slice(0, 2)
        const url = `https://adapools.yoroiwallet.com/api/v1/pools?bias=${plate}&lang=${lang}`

        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Failed to fetch pools: ${response.statusText}`)
        }

        const data = await response.json()

        // The API returns an array of pools, the first one is the "top" pool for this wallet
        if (Array.isArray(data) && data.length > 0 && data[0]?.pool_id) {
          return data[0].pool_id as string
        }

        return null
      } catch (error) {
        logger.error('Failed to fetch top stake pool', {error})
        return null
      }
    },
    enabled: wallet.isMainnet,
    staleTime: 1000 * 60 * 60, // 1 hour - pool list doesn't change often
    retry: 2,
  })

  return {
    poolId: query.data,
    isLoading: query.isLoading,
    error: query.error,
  }
}
