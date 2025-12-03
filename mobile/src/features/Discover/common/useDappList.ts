import {useEffect, useState} from 'react'

import {useRemoteConfig} from '~/common/hooks/useRemoteConfig'

import {DAPP_LOGO_BASE_URL} from './helpers'

export interface DappListResponse {
  dapps: DappResponse[]
  filters: Record<string, string[]>
}

interface DappResponse {
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
  const {
    config,
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

    try {
      setIsLoading(true)
      setError(null)

      if (configError) {
        setError(configError as Error)
        setData(null)
        return
      }

      if (config?.dapps?.recommended) {
        const dapps = config.dapps.recommended.map((dapp) => ({
          id: dapp.id,
          name: dapp.name,
          description: dapp.description,
          category: dapp.category,
          logo: dapp.logo ? `${DAPP_LOGO_BASE_URL}/${dapp.logo}` : '',
          uri: dapp.uri,
          origins: [...dapp.origins],
          isSingleAddress: dapp.isSingleAddress ?? false,
        }))

        const filters = config.dapps.filters
          ? Object.fromEntries(
              Object.entries(config.dapps.filters).map(([key, value]) => [
                key,
                [...value],
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
  }, [config, configLoading, configError])

  return {
    data,
    error,
    isLoading,
    isError: error !== null,
  }
}
