import {Fetcher, fetcher} from '@yoroi/common'
import {freeze} from 'immer'
import {Api, Chain} from '@yoroi/types'

import {getProtocolParams as getProtocolParamsWrapper} from './protocol-params'
import {getBestBlock as getBestBlockWrapper} from './best-block'
import {API_ENDPOINTS} from './config'

export const cardanoApiMaker = ({
  network,
  request = fetcher,
}: {
  network: Chain.SupportedNetworks
  request?: Fetcher
}): Readonly<Api.Cardano.Api> => {
  const baseUrl = API_ENDPOINTS[network].root
  const getProtocolParams = getProtocolParamsWrapper(baseUrl, request)
  const getBestBlock = getBestBlockWrapper(baseUrl, request)

  return freeze({
    getProtocolParams,
    getBestBlock,
  } as const)
}
