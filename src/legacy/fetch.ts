/* eslint-disable @typescript-eslint/no-explicit-any */
import {Platform} from 'react-native'
import DeviceInfo from 'react-native-device-info'

import {Logger} from '../legacy/logging'
import {ApiError, ApiHistoryError, NetworkError} from './errors'
import type {BackendConfig} from './types'
type RequestMethod = 'POST' | 'GET'

const _checkResponse = async (rawResponse: Record<string, any>, requestPayload: Record<string, any>) => {
  let responseBody = {}

  try {
    responseBody = await rawResponse.json()
  } catch (_e) {
    throw new ApiError('unexpected server response')
  }

  const status = rawResponse.status

  if (status !== 200) {
    const resp = (responseBody as any).error?.response

    if (
      resp === 'REFERENCE_TX_NOT_FOUND' ||
      resp === 'REFERENCE_BLOCK_MISMATCH' ||
      resp === 'REFERENCE_BEST_BLOCK_MISMATCH'
    ) {
      throw new ApiHistoryError((responseBody as any).error.response)
    }

    Logger.debug('Bad status code from server', status)
    Logger.debug('Request payload:', requestPayload)
    Logger.info('response', responseBody)
    throw new ApiError((responseBody as any).error?.response)
  }

  return responseBody
}

type FetchRequest = {
  endpoint: string
  payload: any
  method: RequestMethod
  checkResponse?: (arg0: Record<string, any>, arg1: Record<string, any>) => Promise<Record<string, any>>
  headers?: Record<string, string>
}
export const checkedFetch = (request: FetchRequest) => {
  const {endpoint, payload, method, headers} = request
  const checkResponse = request.checkResponse || _checkResponse
  Logger.info(`API call: ${endpoint}`)
  return fetch(endpoint, {
    method,
    headers: headers != null ? headers : undefined,
    body: payload != null ? JSON.stringify(payload) : undefined,
  }) // Fetch throws only for network/dns/related errors, not http statuses
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
      Logger.info(`API call ${endpoint} finished`)
      const response = await checkResponse(r, payload)
      // Logger.debug('Response:', response)
      return response
    })
}
export const fetchDefault = (
  path: string,
  payload: any,
  networkConfig: BackendConfig,
  method: RequestMethod = 'POST',
) => {
  const fullPath = `${networkConfig.API_ROOT}/${path}`
  const platform = Platform.OS === 'android' || Platform.OS === 'ios' ? Platform.OS : '-'
  const yoroiVersion = `${platform} / ${DeviceInfo.getVersion()}`
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'yoroi-version': yoroiVersion,
    'tangata-manu': 'yoroi',
  }
  const request = {
    endpoint: fullPath,
    payload,
    method,
    checkResponse: _checkResponse,
    headers,
  }
  return checkedFetch(request)
}
export default fetchDefault
