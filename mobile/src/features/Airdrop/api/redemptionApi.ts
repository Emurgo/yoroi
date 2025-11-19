import {fetchData} from '@yoroi/common'

import {REDEMPTION_API_BASE_URL} from '../types'
import type {
  BuildTransactionRequest,
  BuildTransactionResponse,
  GetTransactionResponse,
  PhaseConfigResponse,
  ThawScheduleResponse,
  ThawTransactionRequest,
  ThawTransactionResponse,
} from '../types'

const getApiUrl = (path: string) => `${REDEMPTION_API_BASE_URL}${path}`

export const redemptionApi = {
  /**
   * Get the current phase configuration
   */
  getPhaseConfig: async (): Promise<PhaseConfigResponse> => {
    const response = await fetchData<PhaseConfigResponse>({
      url: getApiUrl('/thaws/phase-config'),
      method: 'get',
    })

    if (response.tag === 'left') {
      throw new Error(
        `Failed to get phase config: ${response.error.message} (${response.error.status})`,
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
    const response = await fetchData<ThawScheduleResponse>({
      url: getApiUrl(`/thaws/${encodeURIComponent(destAddress)}/schedule`),
      method: 'get',
    })

    if (response.tag === 'left') {
      if (response.error.status === 404) {
        // Address not found - no allocations
        throw new Error('ADDRESS_NOT_FOUND')
      }
      // Network errors (DNS resolution failures, no response) are expected if API is not deployed yet
      const isNetworkError = response.error.status === -1 || response.error.message?.includes('Network')
      if (isNetworkError) {
        throw new Error('ADDRESS_NOT_FOUND') // Treat as no allocations to avoid error spam
      }
      throw new Error(
        `Failed to get thaw schedule: ${response.error.message} (${response.error.status})`,
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
    const response = await fetchData<BuildTransactionResponse, BuildTransactionRequest>({
      url: getApiUrl(
        `/thaws/${encodeURIComponent(destAddress)}/transactions/build`,
      ),
      method: 'post',
      data: request,
    })

    if (response.tag === 'left') {
      throw new Error(
        `Failed to build transaction: ${response.error.message} (${response.error.status})`,
      )
    }

    return response.value.data
  },

  /**
   * Submit a signed redemption transaction
   */
  submitTransaction: async (
    destAddress: string,
    request: ThawTransactionRequest,
  ): Promise<ThawTransactionResponse> => {
    const response = await fetchData<ThawTransactionResponse, ThawTransactionRequest>({
      url: getApiUrl(`/thaws/${encodeURIComponent(destAddress)}/transactions`),
      method: 'post',
      data: request,
    })

    if (response.tag === 'left') {
      throw new Error(
        `Failed to submit transaction: ${response.error.message} (${response.error.status})`,
      )
    }

    return response.value.data
  },

  /**
   * Get the status of a redemption transaction
   */
  getTransactionStatus: async (
    destAddress: string,
    transactionId: string,
  ): Promise<GetTransactionResponse> => {
    const response = await fetchData<GetTransactionResponse>({
      url: getApiUrl(
        `/thaws/${encodeURIComponent(destAddress)}/transactions/${encodeURIComponent(transactionId)}`,
      ),
      method: 'get',
    })

    if (response.tag === 'left') {
      throw new Error(
        `Failed to get transaction status: ${response.error.message} (${response.error.status})`,
      )
    }

    return response.value.data
  },
}

