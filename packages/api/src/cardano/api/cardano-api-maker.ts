import {Fetcher, fetcher} from '@yoroi/common'

import {getProtocolParams as getProtocolParamsWrapper} from './protocol-params'
import {Api} from '@yoroi/types'

export const cardanoApiMaker = ({
  baseUrl,
  request = fetcher,
}: {
  baseUrl: string
  request?: Fetcher
}): Readonly<Api.Cardano.Actions> => {
  const getProtocolParams = getProtocolParamsWrapper(baseUrl, request)

  return {
    getProtocolParams,
  } as const
}
