/* istanbul ignore file */

import {App} from '@yoroi/types'
import {mockGetFrontendFees} from './frontend-fees.mocks'
import {mockGetSwapConfig} from './swap-config.mocks'

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

const getSwapConfig = {
  success: () => Promise.resolve(mockGetSwapConfig.withFees),
  delayed: (timeout?: number) =>
    delayedResponse({data: mockGetSwapConfig.withFees, timeout}),
  empty: () => Promise.resolve(mockGetSwapConfig.empty),
  loading,
  error: {
    unknown: unknownError,
  },
}

export const mockAppApi: App.Api = {
  getFrontendFees: getFrontendFees.success,
  getSwapConfig: getSwapConfig.success,
} as const
