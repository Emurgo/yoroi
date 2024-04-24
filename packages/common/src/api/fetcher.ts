import axios, {AxiosRequestConfig, AxiosResponse} from 'axios'

import {ApiError} from '../errors/errors'
import {Api} from '@yoroi/types'

/**
 * @deprecated This function is deprecated and will be removed in a future release. Use `fetchData` instead.
 */
export const fetcher: Fetcher = async <T = any>(
  config: AxiosRequestConfig,
): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await axios(config)
    return response.data
  } catch (error: any) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new ApiError(
        `Api error: ${error.response.data?.message} Status: ${error.response.status}`,
      )
    } else if (error.request) {
      // The request was made but no response was received
      throw new Api.Errors.Network()
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error('An unknown error occurred')
    }
  }
}

export type Fetcher = <T = any>(config: AxiosRequestConfig) => Promise<T>
