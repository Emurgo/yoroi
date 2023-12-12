import {Fetcher, fetcher} from '@yoroi/common'

import {getProtocolParams as getProtocolParamsWrapper} from './protocol-params'
import {CardanoApi} from '../../index'
export const cardanoApiMaker = ({
  baseUrl,
  request = fetcher,
}: {
  baseUrl: string
  request?: Fetcher
}): Readonly<CardanoApi.api> => {
  const getProtocolParams = getProtocolParamsWrapper(baseUrl, request)

  return {
    getProtocolParams,
  } as const
}
