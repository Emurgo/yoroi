import {Api} from '@yoroi/types'

import axios, {AxiosRequestConfig, AxiosResponse} from 'axios'

import {ApiError} from '../errors/errors'
import {hasRequest, hasResponse, isError, isRecord} from '../utils/parsers'

/**
 * @deprecated This function is deprecated and will be removed in a future release. Use `fetchData` instead.
 */
export const fetcher: Fetcher = async <T = unknown>(
  config: AxiosRequestConfig,
): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await axios(config)
    return response.data
  } catch (error: unknown) {
    if (hasResponse(error)) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const message =
        isRecord(error.response.data) &&
        typeof error.response.data.message === 'string'
          ? error.response.data.message
          : 'Unknown error'
      const status = error.response.status ?? 'Unknown'
      throw new ApiError(`Api error: ${message} Status: ${status}`)
    } else if (hasRequest(error)) {
      // The request was made but no response was received
      throw new Api.Errors.Network()
    } else {
      // Something happened in setting up the request that triggered an Error
      const errorMessage = isError(error)
        ? error.message
        : 'An unknown error occurred'
      throw new Error(errorMessage)
    }
  }
}

export type Fetcher = <T = unknown>(config: AxiosRequestConfig) => Promise<T>
