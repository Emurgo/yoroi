import axios, {AxiosError, AxiosRequestConfig, AxiosResponse} from 'axios'
import {Api} from '@yoroi/types'

type GetRequestConfig = {
  url: string
  method?: 'get'
  headers?: Record<string, string>
}

type OtherRequestConfig<D = any> = {
  url: string
  method: 'post' | 'put' | 'delete'
  data?: D
  headers?: Record<string, string>
}

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
 * // Example of a GET request
 * fetchData<{ someDataType }>({
 *   url: 'https://example.com/data',
 * }).then(response => {
 *   // Handle response
 * }).catch(error => {
 *   // Handle error
 * })
 * ```
 *
 * @example
 * ```typescript
 * // Example of a POST request with data
 * fetchData<{ someDataType }, { somePayloadType }>({
 *   url: 'https://example.com/data',
 *   method: 'post',
 *   data: { /* some data *\/ }
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
    headers: config.headers ?? {'Content-Type': 'application/json'},
    ...(isNotGet && 'data' in config && {data: config.data}),
  }

  return axios(axiosConfig)
    .then((response: AxiosResponse<T>) => {
      return {
        tag: 'right',
        value: {status: response.status, data: response.data},
      } as const
    })
    .catch((error: AxiosError) => {
      if (error.response) {
        const status = error.response.status
        const message = error.response.statusText
        return {
          tag: 'left',
          error: {status, message},
        } as const
      } else if (error.request) {
        return {
          tag: 'left',
          error: {status: -1, message: 'Network (no response)'},
        } as const
      } else {
        return {
          tag: 'left',
          error: {status: -2, message: `Invalid state: ${error.message}`},
        } as const
      }
    })
}
