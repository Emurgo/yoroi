/* istanbul ignore file */

import {App} from '@yoroi/types'
import {mockGetFrontendFees} from './frontend-fees.mocks'
import {paramParsedsMockResponse} from './protocol-params.mocks'

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

const getFrontendFees = {
  success: () => Promise.resolve(mockGetFrontendFees.withFees),
  delayed: (timeout?: number) =>
    delayedResponse({data: mockGetFrontendFees.withFees, timeout}),
  empty: () => Promise.resolve(mockGetFrontendFees.empty),
  loading,
  error: {
    unknown: unknownError,
  },
}

const getProtocolParams = {
  success: () => Promise.resolve(paramParsedsMockResponse),
  delayed: (timeout?: number) =>
    delayedResponse({data: paramParsedsMockResponse, timeout}),
  empty: () => Promise.resolve({}),
  loading,
  error: {
    unknown: unknownError,
  },
}

export const mockAppApi: App.Api = {
  getFrontendFees: getFrontendFees.success,
  getProtocolParams: getProtocolParams.success,
} as const
