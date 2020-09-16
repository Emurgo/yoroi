// @flow
import DeviceInfo from 'react-native-device-info'
import {Platform} from 'react-native'

import {Logger} from '../utils/logging'
import {NetworkError, ApiError, ApiHistoryError} from './errors'

import type {NetworkConfig} from '../config/types'

type RequestMethod = 'POST' | 'GET'

const _checkResponse = (status, responseBody, requestPayload) => {
  if (status !== 200) {
    if (
      responseBody.error?.response === 'REFERENCE_TX_NOT_FOUND' ||
      responseBody.error?.response === 'REFERENCE_BLOCK_MISMATCH' ||
      responseBody.error?.response === 'REFERENCE_BEST_BLOCK_MISMATCH'
    ) {
      throw new ApiHistoryError(responseBody.error.response)
    }
    Logger.debug('Bad status code from server', status)
    Logger.debug('Request payload:', requestPayload)
    Logger.info('response', responseBody)
    throw new ApiError(responseBody)
  }
}

export default (
  path: string,
  payload: ?any,
  networkConfig: NetworkConfig,
  method?: RequestMethod = 'POST',
  checkResponse?: (number, any, ?any) => void = _checkResponse,
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

        const status = r.status
        const response = await r.json()
        checkResponse(status, response, payload)
        // Logger.debug('Response:', response)
        return response
      })
  )
}
