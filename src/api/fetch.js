// @flow
import DeviceInfo from 'react-native-device-info'
import {Platform} from 'react-native'

import {Logger} from '../utils/logging'
import {NetworkError, ApiError, ApiHistoryError} from './errors'

type RequestMethod = 'POST' | 'GET'

const _checkResponse = async (response, requestPayload) => {
  if (response.status === 404) {
    const responseBody = await response.json()
    if (
      responseBody.status === 'REFERENCE_TX_NOT_FOUND' ||
      responseBody.status === 'REFERENCE_BLOCK_MISMATCH' ||
      responseBody.status === 'REFERENCE_BEST_BLOCK_MISMATCH'
    ) {
      throw new ApiHistoryError(responseBody.status)
    }
  }
  if (response.status !== 200) {
    Logger.debug('Bad status code from server', response.status)
    Logger.debug('Request payload:', requestPayload)
    throw new ApiError(response)
  }
}

export default (
  path: string,
  payload: ?any,
  networkConfig: any,
  method?: RequestMethod = 'POST',
  checkResponse?: () => void = _checkResponse
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

        await _checkResponse(r, payload)
        const response = await r.json()
        // Logger.debug('Response:', response)
        return response
      })
  )
}
