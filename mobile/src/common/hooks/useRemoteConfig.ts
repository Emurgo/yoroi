import {fetchData, isLeft, time} from '@yoroi/common'
import {App} from '@yoroi/types'

import {useQuery} from '@tanstack/react-query'

import {persistPrefixKeyword} from '~/kernel/connection/ConnectionProvider'
import {isDev} from '~/kernel/constants'
import {logger} from '~/kernel/logger/logger'

const queryKey = [persistPrefixKeyword, 'yoroi-config', isDev]
const basePath =
  'https://raw.githubusercontent.com/Emurgo/yoroi-config/refs/heads/main/'
const url = `${basePath}${isDev ? 'dev.json' : 'prod.json'}`

export const useRemoteConfig = () => {
  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<App.Config | undefined> => {
      const response = await fetchData<App.Config>({
        url,
      })

      if (isLeft(response)) {
        logger.error('Failed to fetch yoroi config', {
          origin: 'useRemoteConfig',
          response: response,
        })
        return undefined
      }

      return response.value.data
    },
    staleTime: time.minutes(5),
    gcTime: time.hours(24), // Keep in cache for 24 hours for persistence
  })

  return {
    config: query.data,
    ...query,
  }
}
