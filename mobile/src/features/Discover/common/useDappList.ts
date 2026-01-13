import {Chain} from '@yoroi/types'
import {useSelectedWallet} from '@yoroi/wallet-manager'

import {useEffect, useState} from 'react'

import {useRemoteConfig} from '~/common/hooks/useRemoteConfig'

import {DAPP_LOGO_BASE_URL} from './helpers'

export type DappListResponse = {
  dapps: DappResponse[]
  filters: Record<string, string[]>
}

type DappResponse = {
  id: string
  name: string
  description: string
  category: string
  logo: string
  uri: string
  origins: string[]
  isSingleAddress: boolean
}

export const useDappList = () => {
  const {wallet} = useSelectedWallet()
  const isPreprod = wallet.networkManager.network === Chain.Network.Preprod

  const {
    config: remoteConfig,
    isLoading: configLoading,
    error: configError,
  } = useRemoteConfig()
  const [data, setData] = useState<DappListResponse | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (configLoading) {
      setIsLoading(true)
      return
    }

    if (configError) {
      setError(configError as Error)
      setData(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const config = isPreprod
        ? remoteConfig?.dappsPreprod
        : remoteConfig?.dapps

      if (config?.recommended) {
        const dapps = config.recommended.map((dapp) => ({
          id: dapp.id,
          name: dapp.name,
          description: dapp.description,
          category: dapp.category,
          logo: dapp.logo ? `${DAPP_LOGO_BASE_URL}/${dapp.logo}` : '',
          uri: dapp.uri,
          origins: [...dapp.origins],
          isSingleAddress: dapp.isSingleAddress ?? false,
        }))

        const filters = config.filters
          ? Object.fromEntries(
              Object.entries(config.filters).map(([key, value]) => [
                key,
                [...(value as string[])],
              ]),
            )
          : {}
        setData({
          dapps,
          filters,
        })
      } else {
        setData({dapps: [], filters: {}})
      }
    } catch (err) {
      setError(err as Error)
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [remoteConfig, configLoading, configError, isPreprod])

  return {
    data,
    error,
    isLoading,
    isError: error !== null,
  }
}
