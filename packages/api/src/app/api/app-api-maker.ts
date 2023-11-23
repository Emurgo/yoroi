import {Fetcher, fetcher} from '@yoroi/common'
import {App} from '@yoroi/types'

import {getFrontendFees as getFrontendFeesWrapper} from './frontend-fees'
import {getProtocolParams as getProtocolParamsWrapper} from './protocol-params'

export const appApiMaker = ({
  baseUrl,
  request = fetcher,
}: {
  baseUrl: string
  request?: Fetcher
}): Readonly<App.Api> => {
  const getFrontendFees = getFrontendFeesWrapper(baseUrl, request)
  const getProtocolParams = getProtocolParamsWrapper(baseUrl, request)

  return {
    getFrontendFees,
    getProtocolParams,
  } as const
}
