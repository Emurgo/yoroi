import {fetchData} from '@yoroi/common'

import {logger} from '~/kernel/logger/logger'

import type {
  BuildTransactionRequest,
  BuildTransactionResponse,
  GetTransactionResponse,
  PhaseConfigResponse,
  ThawScheduleResponse,
  ThawTransactionRequest,
  ThawTransactionResponse,
} from '../types'
import {REDEMPTION_API_BASE_URL} from '../types'

const getApiUrl = (path: string) => `${REDEMPTION_API_BASE_URL}${path}`

type ApiErrorResponse = {
  type?: string
  info?: string
  message?: string
}

const parseErrorResponse = (responseData: unknown): ApiErrorResponse | null => {
  if (
    responseData &&
    typeof responseData === 'object' &&
    ('type' in responseData ||
      'info' in responseData ||
      'message' in responseData)
  ) {
    return responseData as ApiErrorResponse
  }
  return null
}

// Headers to match browser requests and avoid 403 errors
const getApiHeaders = () => ({
  'accept': 'application/json, text/plain, */*',
  'accept-language': 'en-US,en;q=0.9',
  'cache-control': 'no-cache',
  'origin': 'https://redeem.midnight.gd',
  'referer': 'https://redeem.midnight.gd/',
  'user-agent':
    'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
})

export const redemptionApi = {
  /**
   * Get the current phase configuration
   */
  getPhaseConfig: async (): Promise<PhaseConfigResponse> => {
    const url = getApiUrl('/thaws/phase-config')

    const response = await fetchData<PhaseConfigResponse>({
      url,
      method: 'get',
      headers: getApiHeaders(),
    })

    if (response.tag === 'left') {
      const errorResponse = parseErrorResponse(response.error.responseData)
      logger.error('redemptionApi.getPhaseConfig: Failed to get phase config', {
        status: response.error.status,
        message: response.error.message,
        errorType: errorResponse?.type,
        errorInfo: errorResponse?.info,
        errorMessage: errorResponse?.message,
      })

      const errorMsg =
        errorResponse?.info ||
        errorResponse?.message ||
        response.error.message ||
        'Unknown error'
      throw new Error(
        `Failed to get phase config: ${errorMsg} (${response.error.status})`,
      )
    }

    return response.value.data
  },

  /**
   * Get the thaw schedule for a destination address
   */
  getThawSchedule: async (
    destAddress: string,
  ): Promise<ThawScheduleResponse> => {
    const url = getApiUrl(`/thaws/${encodeURIComponent(destAddress)}/schedule`)

    const response = await fetchData<ThawScheduleResponse>({
      url,
      method: 'get',
      headers: getApiHeaders(),
    })

    if (response.tag === 'left') {
      const errorResponse = parseErrorResponse(response.error.responseData)
      const errorType = errorResponse?.type

      // Handle 403 Forbidden - might be rate limiting or missing headers
      if (response.error.status === 403) {
        logger.warn('redemptionApi.getThawSchedule: 403 Forbidden', {
          destAddress,
          responseData:
            typeof response.error.responseData === 'string'
              ? response.error.responseData.substring(0, 200)
              : response.error.responseData,
        })
        // Treat 403 as temporary access issue - don't cache as not eligible
        // Use a different error type so it doesn't get cached
        throw new Error('API_ACCESS_FORBIDDEN')
      }

      // Handle 404 or 400 with "no_redeemable_thaws" as "no allocations"
      if (
        response.error.status === 404 ||
        (response.error.status === 400 && errorType === 'no_redeemable_thaws')
      ) {
        // Address not found - no allocations
        throw new Error('ADDRESS_NOT_FOUND')
      }

      // Handle invalid address format
      if (errorType === 'incorrect_shelley_address') {
        logger.error('redemptionApi.getThawSchedule: Invalid address format', {
          destAddress,
          errorInfo: errorResponse?.info,
        })
        throw new Error(
          `Invalid address format: ${errorResponse?.info || errorResponse?.message || 'Invalid Cardano address'}`,
        )
      }

      // Network errors (DNS resolution failures, no response) are expected if API is not deployed yet
      const isNetworkError =
        response.error.status === -1 ||
        response.error.message?.includes('Network')
      if (isNetworkError) {
        throw new Error('ADDRESS_NOT_FOUND') // Treat as no allocations to avoid error spam
      }

      const errorMsg =
        errorResponse?.info ||
        errorResponse?.message ||
        response.error.message ||
        'Unknown error'
      logger.error(
        'redemptionApi.getThawSchedule: Failed to get thaw schedule',
        {
          destAddress,
          status: response.error.status,
          errorType,
          errorMsg,
          responseData:
            typeof response.error.responseData === 'string'
              ? response.error.responseData.substring(0, 200)
              : response.error.responseData,
        },
      )
      throw new Error(
        `Failed to get thaw schedule: ${errorMsg} (${response.error.status})`,
      )
    }

    return response.value.data
  },

  /**
   * Build a redemption transaction
   */
  buildTransaction: async (
    destAddress: string,
    request: BuildTransactionRequest,
  ): Promise<BuildTransactionResponse> => {
    const url = getApiUrl(
      `/thaws/${encodeURIComponent(destAddress)}/transactions/build`,
    )

    logger.info('redemptionApi.buildTransaction: Sending request to backend', {
      url,
      destAddress,
      request: {
        changeAddress: request.change_address,
        fundingUtxosCount: request.funding_utxos.length,
        fundingUtxosPreview: request.funding_utxos
          .slice(0, 2)
          .map((utxo) => `${utxo.substring(0, 32)}...`),
        collateralUtxosCount: request.collateral_utxos.length,
        collateralUtxosPreview: request.collateral_utxos
          .slice(0, 2)
          .map((utxo) => `${utxo.substring(0, 32)}...`),
      },
    })

    const response = await fetchData<
      BuildTransactionResponse,
      BuildTransactionRequest
    >({
      url,
      method: 'post',
      data: request,
      headers: getApiHeaders(),
    })

    if (response.tag === 'left') {
      const errorResponse = parseErrorResponse(response.error.responseData)
      logger.error(
        'redemptionApi.buildTransaction: Failed to build transaction',
        {
          destAddress,
          status: response.error.status,
          message: response.error.message,
          errorType: errorResponse?.type,
          errorInfo: errorResponse?.info,
          errorMessage: errorResponse?.message,
          responseData:
            typeof response.error.responseData === 'string'
              ? response.error.responseData.substring(0, 500)
              : response.error.responseData,
          request: {
            changeAddress: request.change_address,
            fundingUtxosCount: request.funding_utxos.length,
            collateralUtxosCount: request.collateral_utxos.length,
          },
        },
      )

      const errorMsg =
        errorResponse?.info ||
        errorResponse?.message ||
        response.error.message ||
        'Unknown error'
      throw new Error(
        `Failed to build transaction: ${errorMsg} (${response.error.status})`,
      )
    }

    logger.info(
      'redemptionApi.buildTransaction: Received response from backend',
      {
        destAddress,
        status: response.value.status,
        response: {
          redeemedAmount: response.value.data.redeemed_amount,
          requireThawingExtraSignature:
            response.value.data.require_thawing_extra_signature,
          transactionId: response.value.data.transaction_id,
          transactionCborLength: response.value.data.transaction.length,
          transactionCborPreview: `${response.value.data.transaction.substring(0, 64)}...`,
        },
      },
    )

    return response.value.data
  },

  /**
   * Submit a signed redemption transaction
   */
  submitTransaction: async (
    destAddress: string,
    request: ThawTransactionRequest,
  ): Promise<ThawTransactionResponse> => {
    const url = getApiUrl(
      `/thaws/${encodeURIComponent(destAddress)}/transactions`,
    )

    logger.info('redemptionApi.submitTransaction: Sending request to backend', {
      url,
      destAddress,
      request: {
        transactionLength: request.transaction.length,
        transactionPreview: `${request.transaction.substring(0, 64)}...`,
        witnessSetLength: request.transaction_witness_set.length,
        witnessSetPreview: `${request.transaction_witness_set.substring(0, 64)}...`,
      },
    })

    const response = await fetchData<
      ThawTransactionResponse,
      ThawTransactionRequest
    >({
      url,
      method: 'post',
      data: request,
      headers: getApiHeaders(),
    })

    if (response.tag === 'left') {
      const errorResponse = parseErrorResponse(response.error.responseData)
      logger.error(
        'redemptionApi.submitTransaction: Failed to submit transaction',
        {
          destAddress,
          status: response.error.status,
          message: response.error.message,
          errorType: errorResponse?.type,
          errorInfo: errorResponse?.info,
          errorMessage: errorResponse?.message,
          transactionPreview: `${request.transaction.substring(0, 32)}...`,
        },
      )

      const errorMsg =
        errorResponse?.info ||
        errorResponse?.message ||
        response.error.message ||
        'Unknown error'
      throw new Error(
        `Failed to submit transaction: ${errorMsg} (${response.error.status})`,
      )
    }

    logger.info(
      'redemptionApi.submitTransaction: Received response from backend',
      {
        destAddress,
        status: response.value.status,
        response: {
          transactionId: response.value.data.transaction_id,
        },
      },
    )

    return response.value.data
  },

  /**
   * Get the status of a redemption transaction
   */
  getTransactionStatus: async (
    destAddress: string,
    transactionId: string,
  ): Promise<GetTransactionResponse> => {
    const url = getApiUrl(
      `/thaws/${encodeURIComponent(destAddress)}/transactions/${encodeURIComponent(transactionId)}`,
    )

    const response = await fetchData<GetTransactionResponse>({
      url,
      method: 'get',
      headers: getApiHeaders(),
    })

    if (response.tag === 'left') {
      const errorResponse = parseErrorResponse(response.error.responseData)
      logger.error(
        'redemptionApi.getTransactionStatus: Failed to get transaction status',
        {
          destAddress,
          transactionId,
          status: response.error.status,
          message: response.error.message,
          errorType: errorResponse?.type,
          errorInfo: errorResponse?.info,
          errorMessage: errorResponse?.message,
        },
      )

      const errorMsg =
        errorResponse?.info ||
        errorResponse?.message ||
        response.error.message ||
        'Unknown error'
      throw new Error(
        `Failed to get transaction status: ${errorMsg} (${response.error.status})`,
      )
    }

    return response.value.data
  },
}
