import {Fetcher, fetcher} from '@yoroi/common'
import {Api, Chain} from '@yoroi/types'

import {freeze} from 'immer'

import {getBestBlock as getBestBlockWrapper} from './best-block'
import {API_ENDPOINTS} from './config'
import {getProtocolParams as getProtocolParamsWrapper} from './protocol-params'
import {getUtxoData as getUtxoDataWapper} from './utxo-data'

export const cardanoApiMaker = ({
  network,
  request = fetcher,
}: {
  network: Chain.SupportedNetworks
  request?: Fetcher
}): Readonly<Api.Cardano.Api> => {
  const baseUrl = API_ENDPOINTS[network].root
  const legacyBaseUrl = API_ENDPOINTS[network].legacy
  const getProtocolParams = getProtocolParamsWrapper(baseUrl, request)
  const getBestBlock = getBestBlockWrapper(baseUrl, request)
  const getUtxoData = getUtxoDataWapper(legacyBaseUrl, request)

  return freeze({
    getProtocolParams,
    getBestBlock,
    getUtxoData,
  } as const)
}
