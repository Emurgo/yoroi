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

interface ApiErrorResponse {
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
    logger.debug('redemptionApi.getPhaseConfig: Requesting phase config', {
      url,
    })

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

    logger.debug('redemptionApi.getPhaseConfig: Success', {
      data: response.value.data,
    })
    return response.value.data
  },

  /**
   * Get the thaw schedule for a destination address
   */
  getThawSchedule: async (
    destAddress: string,
  ): Promise<ThawScheduleResponse> => {
    const url = getApiUrl(`/thaws/${encodeURIComponent(destAddress)}/schedule`)
    logger.debug('redemptionApi.getThawSchedule: Requesting thaw schedule', {
      url,
      destAddress,
    })

    const response = await fetchData<ThawScheduleResponse>({
      url,
      method: 'get',
      headers: getApiHeaders(),
    })

    if (response.tag === 'left') {
      const errorResponse = parseErrorResponse(response.error.responseData)
      const errorType = errorResponse?.type

      // Log full error details for debugging, especially for 403
      logger.debug('redemptionApi.getThawSchedule: Error response', {
        status: response.error.status,
        message: response.error.message,
        errorType,
        errorInfo: errorResponse?.info,
        errorMessage: errorResponse?.message,
        responseData:
          typeof response.error.responseData === 'string'
            ? response.error.responseData.substring(0, 200)
            : response.error.responseData,
      })

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
        logger.debug(
          'redemptionApi.getThawSchedule: Address has no redeemable thaws',
          {
            destAddress,
            errorInfo: errorResponse?.info,
          },
        )
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
        logger.debug(
          'redemptionApi.getThawSchedule: Network error, treating as no allocations',
          {
            destAddress,
            status: response.error.status,
          },
        )
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

    logger.debug('redemptionApi.getThawSchedule: Success', {
      destAddress,
      numberOfClaimedAllocations:
        response.value.data.numberOfClaimedAllocations,
      thawsCount: response.value.data.thaws.length,
    })
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
    logger.debug('redemptionApi.buildTransaction: Building transaction', {
      url,
      destAddress,
      changeAddress: request.change_address,
      fundingUtxosCount: request.funding_utxos.length,
      collateralUtxosCount: request.collateral_utxos.length,
      fundingUtxos: request.funding_utxos.map(
        (utxo) => `${utxo.substring(0, 16)}...`,
      ),
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

    logger.debug('redemptionApi.buildTransaction: Success', {
      destAddress,
      transactionId: response.value.data.transaction_id,
      redeemedAmount: response.value.data.redeemed_amount,
      requireThawingExtraSignature:
        response.value.data.require_thawing_extra_signature,
      transactionLength: response.value.data.transaction.length,
    })
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
    logger.debug('redemptionApi.submitTransaction: Submitting transaction', {
      url,
      destAddress,
      transactionLength: request.transaction.length,
      witnessSetLength: request.transaction_witness_set.length,
      transactionPreview: `${request.transaction.substring(0, 32)}...`,
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

    logger.debug('redemptionApi.submitTransaction: Success', {
      destAddress,
      transactionId: response.value.data.transaction_id,
      estimatedSubmissionTime: response.value.data.estimated_submission_time,
    })
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
    logger.debug(
      'redemptionApi.getTransactionStatus: Getting transaction status',
      {
        url,
        destAddress,
        transactionId,
      },
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

    logger.debug('redemptionApi.getTransactionStatus: Success', {
      destAddress,
      transactionId: response.value.data.transaction_id,
      status: response.value.data.status,
      redeemedAmount: response.value.data.redeemed_amount,
    })
    return response.value.data
  },
}
