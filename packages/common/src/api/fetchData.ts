import axios, {AxiosError, AxiosRequestConfig, AxiosResponse} from 'axios'
import {Api} from '@yoroi/types'

// Module augmentation to extend AxiosRequestConfig
declare module 'axios' {
  export interface AxiosRequestConfig {
    metadata?: {startTime: number; duration: number}
  }
}

type FetcherHandlers = {
  onSuccess?(): void
  onError?(): void
}

type GetRequestConfig = {
  url: string
  method?: 'get'
  headers?: Record<string, string>
} & FetcherHandlers

type OtherRequestConfig<D = any> = {
  url: string
  method: 'post' | 'put' | 'delete'
  data?: D
  headers?: Record<string, string>
} & FetcherHandlers

export type RequestConfig<D = any> = GetRequestConfig | OtherRequestConfig<D>

export type FetchData = <T, D = any>(
  config: RequestConfig<D>,
  fetcherConfig?: AxiosRequestConfig<D>,
) => Promise<Api.Response<T>>

/**
 * Performs an HTTP request using Axios based on the specified configuration.
 * This function simplifies making HTTP requests by handling different
 * request methods and their respective data and headers.
 *
 * @param config - The configuration object for the request.
 *                 This includes the URL, HTTP method, optional data, and headers.
 *                 The type of `config` varies based on the HTTP method:
 *                 - For `GET` requests, `data` should not be provided.
 *                 - For `POST`, `PUT`, and `DELETE` requests, `data` is optional.
 *                 The config also includes optional success and error handlers:
 *                 - `onSuccess`: Callback function called when the request succeeds
 *                 - `onError`: Callback function called when the request fails
 *
 * @note By default, all requests are configured with no-cache headers. If caching is needed,
 *       you should provide custom headers in the config to override the default behavior.
 *
 * @returns A `Promise` that resolves to the response data on a successful request
 *          or an error object on failure. The error object includes the HTTP status
 *          code and error message.
 *
 * @template T - The expected type of the response data.
 * @template D - The type of the data to be sent with the request (for `POST`, `PUT`, `DELETE`).
 *
 * @example
 * ```typescript
 * // Example of a GET request with handlers
 * fetchData<{ someDataType }>({
 *   url: 'https://example.com/data',
 *   onSuccess: () => console.log('Request succeeded'),
 *   onError: () => console.log('Request failed'),
 * }).then(response => {
 *   // Handle response
 * }).catch(error => {
 *   // Handle error
 * })
 * ```
 *
 * @example
 * ```typescript
 * // Example of a POST request with data and handlers
 * fetchData<{ someDataType }, { somePayloadType }>({
 *   url: 'https://example.com/data',
 *   method: 'post',
 *   data: {...somePayload},
 *   onSuccess: () => console.log('Request succeeded'),
 *   onError: () => console.log('Request failed'),
 * }).then(response => {
 *   // Handle response
 * }).catch(error => {
 *   // Handle error
 * })
 * ```
 *
 * @example
 * ```typescript
 * // Example of a GET request with caching enabled
 * fetchData<{ someDataType }>({
 *   url: 'https://example.com/data',
 *   headers: {
 *     'Cache-Control': 'max-age=3600', // Cache for 1 hour
 *   },
 * }).then(response => {
 *   // Handle response
 * }).catch(error => {
 *   // Handle error
 * })
 * ```
 */
export const fetchData: FetchData = <T, D = any>(
  config: RequestConfig<D>,
  fetcherConfig?: AxiosRequestConfig<D>,
): Promise<Api.Response<T>> => {
  const method = config.method ?? 'get'
  const isNotGet = method !== 'get'

  const axiosConfig: AxiosRequestConfig<D> = {
    ...fetcherConfig,
    url: config.url,
    method: method,
    headers: config.headers ?? {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
    ...(isNotGet && 'data' in config && {data: config.data}),

    // updated by the interceptors
    metadata: {startTime: new Date().getTime(), duration: 0},
  }

  return axios(axiosConfig)
    .then(({status, data}: AxiosResponse<T>) => {
      config.onSuccess?.()
      return {
        tag: 'right',
        value: {status, data},
      } as const
    })
    .catch((error: AxiosError) => {
      config.onError?.()
      if (error.response) {
        const status = error.response.status
        const message = error.response.statusText
        const responseData = error.response.data

        return {
          tag: 'left',
          error: {status, message, responseData},
        } as const
      } else if (error.request) {
        return {
          tag: 'left',
          error: {
            status: -1,
            message: 'Network (no response)',
            responseData: null,
          },
        } as const
      } else {
        return {
          tag: 'left',
          error: {
            status: -2,
            message: `Invalid state: ${error.message}`,
            responseData: null,
          },
        } as const
      }
    })
}

/* istanbul ignore next */
axios.interceptors.request.use(
  (config) => {
    config.metadata = {startTime: new Date().getTime(), duration: 0}
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

/* istanbul ignore next */
axios.interceptors.response.use(
  (response) => {
    if (response.config.metadata) {
      const endTime = new Date().getTime()
      const startTime = response.config.metadata.startTime
      const duration = endTime - startTime
      response.config.metadata.duration = duration
    }

    return response
  },
  (error) => {
    return Promise.reject(error)
  },
)
