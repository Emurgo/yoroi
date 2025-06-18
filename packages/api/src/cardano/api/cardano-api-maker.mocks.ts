import {Api} from '@yoroi/types'

import {protocolParamsMockResponse} from './protocol-params.mocks'
import {bestBlockMockResponse} from './best-block.mocks'
import {mockUtxoData} from './utxo-data.mocks'

const loading = () => new Promise(() => {})
const unknownError = () => Promise.reject(new Error('Unknown error'))
const delayedResponse = <T = never>({
  data,
  timeout = 3000,
}: {
  data: T
  timeout?: number
}) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(data), timeout)
  })

const getProtocolParams = {
  success: () => Promise.resolve(protocolParamsMockResponse),
  delayed: (timeout?: number) =>
    delayedResponse({data: protocolParamsMockResponse, timeout}),
  empty: () => Promise.resolve({}),
  loading,
  error: {
    unknown: unknownError,
  },
}

const getBestBlock = {
  success: () => Promise.resolve(bestBlockMockResponse),
  delayed: (timeout?: number) =>
    delayedResponse({data: bestBlockMockResponse, timeout}),
  empty: () => Promise.resolve({}),
  loading,
  error: {
    unknown: unknownError,
  },
}

const getUtxoData = {
  success: () => Promise.resolve(mockUtxoData),
  delayed: (timeout?: number) => delayedResponse({data: mockUtxoData, timeout}),
  empty: () => Promise.resolve({}),
  loading,
  error: {
    unknown: unknownError,
  },
}

export const mockCardanoApi: Api.Cardano.Api = {
  getProtocolParams: getProtocolParams.success,
  getBestBlock: getBestBlock.success,
  getUtxoData: getUtxoData.success,
} as const
