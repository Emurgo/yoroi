import {Fetcher, fetcher} from '@yoroi/common'

import {getProtocolParams as getProtocolParamsWrapper} from './protocol-params'
import {Api, Chain} from '@yoroi/types'
import {API_ENDPOINTS} from './config'

export const cardanoApiMaker = ({
  network,
  request = fetcher,
}: {
  network: Chain.SupportedNetworks
  request?: Fetcher
}): Readonly<Api.Cardano.Actions> => {
  const baseUrl = API_ENDPOINTS[network].root
  const getProtocolParams = getProtocolParamsWrapper(baseUrl, request)

  return {
    getProtocolParams,
  } as const
}
