// @flow
import DeviceInfo from 'react-native-device-info'
import {Platform} from 'react-native'

import {Logger} from '../utils/logging'
import {NetworkError, ApiError, ApiHistoryError} from './errors'

import type {BackendConfig} from '../config/types'

type RequestMethod = 'POST' | 'GET'

const _checkResponse = async (rawResponse: Object, requestPayload: Object) => {
  let responseBody = {}
  try {
    responseBody = await rawResponse.json()
  } catch (_e) {
    throw new ApiError('unexpected server response')
  }
  const status = rawResponse.status
  if (status !== 200) {
    const resp = responseBody.error?.response
    if (
      resp === 'REFERENCE_TX_NOT_FOUND' ||
      resp === 'REFERENCE_BLOCK_MISMATCH' ||
      resp === 'REFERENCE_BEST_BLOCK_MISMATCH'
    ) {
      throw new ApiHistoryError(responseBody.error.response)
    }
    Logger.debug('Bad status code from server', status)
    Logger.debug('Request payload:', requestPayload)
    Logger.info('response', responseBody)
    throw new ApiError(responseBody.error?.response)
  }
  return responseBody
}

export default (
  path: string,
  payload: ?any,
  networkConfig: BackendConfig,
  method?: RequestMethod = 'POST',
  checkResponse?: (Object, Object) => Promise<Object> = _checkResponse,
) => {
  const fullPath = `${networkConfig.API_ROOT}/${path}`
  const platform =
    Platform.OS === 'android' || Platform.OS === 'ios' ? Platform.OS : '-'
  const yoroiVersion = `${platform} / ${DeviceInfo.getVersion()}`
  Logger.info(`API call: ${fullPath}`)
  return (
    fetch(fullPath, {
      method,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'yoroi-version': yoroiVersion,
        'tangata-manu': 'yoroi',
      },
      body: payload != null ? JSON.stringify(payload) : undefined,
    })
      // Fetch throws only for network/dns/related errors, not http statuses
      .catch((e) => {
        Logger.info(`API call ${path} failed`, e)
        /* It really is TypeError according to
        https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
        */
        if (e instanceof TypeError) {
          throw new NetworkError()
        }
        throw e
      })
      .then(async (r) => {
        Logger.info(`API call ${path} finished`)
        const response = await checkResponse(r, payload)
        // Logger.debug('Response:', response)
        return response
      })
  )
}
