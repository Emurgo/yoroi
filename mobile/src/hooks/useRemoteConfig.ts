import {fetchData, isLeft, time} from '@yoroi/common'
import {App} from '@yoroi/types'

import {useQuery} from '@tanstack/react-query'

import {isDev} from '~/kernel/constants'
import {logger} from '~/kernel/logger/logger'

const queryKey = ['persist', 'yoroi-config', isDev]
const basePath =
  'https://raw.githubusercontent.com/Emurgo/yoroi-config/refs/heads/main/'
const url = `${basePath}${isDev ? 'dev.json' : 'prod.json'}`

export const useRemoteConfig = () => {
  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<App.Config> => {
      const response = await fetchData<App.Config>({
        url,
      })

      if (isLeft(response)) {
        logger.error('Failed to fetch yoroi config', {
          origin: 'useRemoteConfig',
          response: response,
        })
        return {} as App.Config
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
