import * as React from 'react'

import {useAppState} from '../../../hooks/useAppState'
import {getAuthHostConfig} from '../common/helpers'
import {AuthHostConfig} from '../common/types'

export const useAuthHostConfig = () => {
  const [authHostConfig, setAuthHostConfig] = React.useState<
    AuthHostConfig | undefined
  >(undefined)

  React.useEffect(() => {
    getAuthHostConfig().then(setAuthHostConfig)
  }, [])

  useAppState({
    on: 'active',
    execute: () => {
      getAuthHostConfig().then(setAuthHostConfig)
    },
  })

  return authHostConfig
}
