import {Fetcher, fetcher} from '@yoroi/common'
import {App} from '@yoroi/types'

import {getFrontendFees as getFrontendFeesWrapper} from './frontend-fees'
import {getSwapConfigWrapper} from './swap-config'

export const appApiMaker = ({
  baseUrl,
  request = fetcher,
}: {
  baseUrl: string
  request?: Fetcher
}): Readonly<App.Api> => {
  // @deprecated in favour of getSwapConfig
  const getFrontendFees = getFrontendFeesWrapper(baseUrl, request)
  const getSwapConfig = getSwapConfigWrapper(baseUrl, request)

  return {
    getFrontendFees,
    getSwapConfig,
  } as const
}
