import {fetchData, getLogger, isRight} from '@yoroi/common'

import {Platform} from 'react-native'
import DeviceInfo from 'react-native-device-info'

import {ApiError, ApiHistoryError} from '../errors'

type RequestMethod = 'POST' | 'GET'

type ErrorResponse = {
  error?: {
    response?: string | null
  }
}

/**
 * Fetch utility that throws errors (compatible with existing fetchDefault API)
 * Uses fetchData from @yoroi/common under the hood
 */
export const fetchDefault = async <T = Record<string, unknown>>(
  path: string,
  payload: unknown,
  apiBaseUrl: string,
  method: RequestMethod = 'POST',
): Promise<T> => {
  const fullPath = `${apiBaseUrl}/${path}`
  const yoroiVersion = `${Platform.OS} / ${DeviceInfo.getVersion()}`
  const logger = getLogger()

  const response = await fetchData<T>(
    {
      url: fullPath,
      method: method.toLowerCase() as 'get' | 'post',
      ...(method === 'POST' && payload != null && {data: payload}),
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'yoroi-version': yoroiVersion,
      },
    },
    {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'yoroi-version': yoroiVersion,
      },
    },
  )

  if (isRight(response)) {
    return response.value.data
  }

  // Handle error response
  const {status, message, responseData} = response.error

  // Log error
  logger.error('fetchDefault: Backend returned error response', {
    origin: 'fetchDefault',
    type: 'http',
    status,
    message,
    responseData,
    fullPath,
  })

  // Parse error response if available
  let errorResponse: ErrorResponse | null = null
  if (responseData && typeof responseData === 'object') {
    errorResponse = responseData as ErrorResponse
  }

  const resp = errorResponse?.error?.response

  // Check for ApiHistoryError cases
  if (
    resp &&
    Object.values(ApiHistoryError.errors).includes(
      resp as (typeof ApiHistoryError.errors)[keyof typeof ApiHistoryError.errors],
    )
  ) {
    throw new ApiHistoryError(resp)
  }

  // Throw ApiError for other cases
  if (status >= 500 && status < 600) {
    throw new ApiError(`Server error (${status}): ${message}`)
  }

  throw new ApiError(resp ?? message ?? 'unexpected server response')
}
