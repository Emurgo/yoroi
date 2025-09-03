import {fetchData, isLeft, time} from '@yoroi/common'

import {useQuery} from '@tanstack/react-query'

import {isDev} from '~/kernel/constants'
import {logger} from '~/kernel/logger/logger'
import {YoroiConfig} from '~/wallets/types/yoroi'

const queryKey = ['persist', 'yoroi-config', isDev]
const basePath =
  'https://raw.githubusercontent.com/Emurgo/yoroi-config/refs/heads/main/'
const url = `${basePath}${isDev ? 'dev.json' : 'prod.json'}`

export const useRemoteConfig = () => {
  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<YoroiConfig> => {
      const response = await fetchData<YoroiConfig>({
        url,
      })

      if (isLeft(response)) {
        logger.error('Failed to fetch yoroi config', {
          origin: 'useRemoteConfig',
          response: response,
        })
        return {} as YoroiConfig
      }

      return response.value.data
    },
    staleTime: time.minutes(5),
  })

  return {
    config: query.data,
    ...query,
  }
}
