import {Api} from '@yoroi/types'

import {Platform} from 'react-native'
import DeviceInfo from 'react-native-device-info'

import {logger} from '~/kernel/logger/logger'
import {BackendConfig} from '~/wallets/types/other'

import {ApiError, ApiHistoryError} from '../errors'

type RequestMethod = 'POST' | 'GET'

type ResponseChecker<T> = (
  rawResponse: Record<string, any>,
  requestPayload: Record<string, any>,
) => Promise<T>

const _checkResponse: ResponseChecker<Record<string, any>> = async (
  rawResponse,
) => {
  const status = rawResponse.status
  const contentType = rawResponse.headers.get('content-type') || ''

  let responseBody = {}

  // Try to parse as JSON
  try {
    responseBody = await rawResponse.json()
  } catch (parseError) {
    // If it's not JSON, log what we can and throw appropriate error
    logger.error('fetchDefault: Failed to parse response as JSON', {
      origin: 'fetchDefault',
      type: 'http',
      status,
      statusText: rawResponse.statusText,
      contentType,
      parseError:
        parseError instanceof Error ? parseError.message : String(parseError),
    })

    // For server errors (5xx), provide more descriptive error messages
    if (status >= 500 && status < 600) {
      const errorMessage = rawResponse.statusText || 'Bad Gateway'
      throw new ApiError(`Server error (${status}): ${errorMessage}`)
    }

    throw new ApiError('unexpected server response')
  }

  if (status !== 200) {
    const resp = (responseBody as any).error?.response

    // Log the actual backend response for debugging
    logger.error('fetchDefault: Backend returned error response', {
      origin: 'fetchDefault',
      type: 'http',
      status,
      statusText: rawResponse.statusText,
      responseBody,
      errorResponse: resp,
    })

    if (Object.values(ApiHistoryError.errors).includes(resp)) {
      throw new ApiHistoryError((responseBody as any).error.response)
    }

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
const checkedFetch = (request: FetchRequest<any>) => {
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
    .catch(async (error) => {
      logger.error(`API call ${endpoint} failed`, {error, type: 'http'})

      // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
      if (error instanceof TypeError) {
        throw new Api.Errors.Network()
      }

      throw error
    })
    .then(async (r) => {
      // Clone response to read it for logging without consuming the stream
      const responseClone = r.clone()

      try {
        const response = await checkResponse(r, payload)
        return response
      } catch (checkError) {
        // If checkResponse throws, try to log the actual response body
        try {
          const responseBody = await responseClone.json()
          logger.error('fetchDefault: Response check failed', {
            origin: 'fetchDefault',
            type: 'http',
            endpoint,
            status: responseClone.status,
            statusText: responseClone.statusText,
            responseBody,
            checkError,
          })
        } catch (parseError) {
          // If we can't parse JSON, try to read as text for better error info
          try {
            const textResponse = await responseClone.text()
            logger.error(
              'fetchDefault: Response check failed (could not parse response)',
              {
                origin: 'fetchDefault',
                type: 'http',
                endpoint,
                status: responseClone.status,
                statusText: responseClone.statusText,
                contentType: responseClone.headers.get('content-type') || '',
                responsePreview: textResponse.substring(0, 200), // First 200 chars
                checkError,
                parseError:
                  parseError instanceof Error
                    ? parseError.message
                    : String(parseError),
              },
            )
          } catch (textError) {
            // If even text reading fails, log what we can
            logger.error(
              'fetchDefault: Response check failed (could not read response)',
              {
                origin: 'fetchDefault',
                type: 'http',
                endpoint,
                status: responseClone.status,
                statusText: responseClone.statusText,
                checkError,
                parseError:
                  parseError instanceof Error
                    ? parseError.message
                    : String(parseError),
                textError:
                  textError instanceof Error
                    ? textError.message
                    : String(textError),
              },
            )
          }
        }
        throw checkError
      }
    })
}

export const fetchDefault = <T = Record<string, any>>(
  path: string,
  payload: any,
  apiBaseUrl: BackendConfig['API_ROOT'],
  method: RequestMethod = 'POST',
  options?: {checkResponse?: ResponseChecker<T>},
): Promise<T> => {
  const fullPath = `${apiBaseUrl}/${path}`
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
  // when full request needs to be logged
  // logger.debug(`fetchDefault: API call ${fullPath}`, {request})
  return checkedFetch(request).catch((error) => {
    logger.error(error, {origin: 'fetchDefault', type: 'http', fullPath})
    throw error
  })
}
