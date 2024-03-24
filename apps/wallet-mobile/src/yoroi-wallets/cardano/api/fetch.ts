/* eslint-disable @typescript-eslint/no-explicit-any */
import {Platform} from 'react-native'
import DeviceInfo from 'react-native-device-info'

import {Logger} from '../../logging'
import type {BackendConfig} from '../../types/other'
import {ApiError, ApiHistoryError, NetworkError} from '../errors'

type RequestMethod = 'POST' | 'GET'

type ResponseChecker<T> = (rawResponse: Record<string, any>, requestPayload: Record<string, any>) => Promise<T>

const _checkResponse: ResponseChecker<Record<string, any>> = async (rawResponse, requestPayload) => {
  let responseBody = {}

  try {
    responseBody = await rawResponse.json()
  } catch (_e) {
    throw new ApiError('unexpected server response')
  }

  const status = rawResponse.status

  if (status !== 200) {
    const resp = (responseBody as any).error?.response

    if (Object.values(ApiHistoryError.errors).includes(resp)) {
      throw new ApiHistoryError((responseBody as any).error.response)
    }

    Logger.debug('Bad status code from server', status)
    Logger.debug('Request payload:', requestPayload)
    Logger.info('response', responseBody)
    throw new ApiError((responseBody as any).error?.response)
  }

  return responseBody
}

type FetchRequest<T> = {
  endpoint: string
  payload: any
  method: RequestMethod
  checkResponse?: ResponseChecker<T>
  headers?: Record<string, string>
}
export const checkedFetch = (request: FetchRequest<any>) => {
  const {endpoint, payload, method, headers} = request
  const checkResponse = request.checkResponse || _checkResponse

  const args = [
    endpoint,
    {
      method,
      headers: headers != null ? headers : undefined,
      body: payload != null ? JSON.stringify(payload) : undefined,
    },
  ] as const

  return fetch(...args) // Fetch throws only for network/dns/related errors, not http statuses
    .catch((e) => {
      Logger.info(`API call ${endpoint} failed`, e)

      /* It really is TypeError according to
    https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
    */
      if (e instanceof TypeError) {
        throw new NetworkError()
      }

      throw e
    })
    .then(async (r) => {
      const response = await checkResponse(r, payload)
      // Logger.debug('Response:', response)
      return response
    })
}
export const fetchDefault = <T = Record<string, any>>(
  path: string,
  payload: any,
  networkConfig: BackendConfig,
  method: RequestMethod = 'POST',
  options?: {checkResponse?: ResponseChecker<T>},
): Promise<T> => {
  const fullPath = `${networkConfig.API_ROOT}/${path}`
  const yoroiVersion = `${Platform.OS} / ${DeviceInfo.getVersion()}`
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'yoroi-version': yoroiVersion,
  }
  const request = {
    endpoint: fullPath,
    payload,
    method,
    checkResponse: options?.checkResponse ?? _checkResponse,
    headers,
  }
  return checkedFetch(request)
}
export default fetchDefault
