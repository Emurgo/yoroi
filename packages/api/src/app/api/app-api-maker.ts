import {Fetcher, fetcher} from '@yoroi/common'
import {App} from '@yoroi/types'

import {getFrontendFees as getFrontendFeesWrapper} from './frontend-fees'

export const appApiMaker = ({
  baseUrl,
  request = fetcher,
}: {
  baseUrl: string
  request?: Fetcher
}): Readonly<App.Api> => {
  const getFrontendFees = getFrontendFeesWrapper(baseUrl, request)

  return {
    getFrontendFees,
  } as const
}
