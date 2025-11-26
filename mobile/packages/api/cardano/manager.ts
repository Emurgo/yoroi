import {freeze} from 'immer'

import {
  BACKEND_ZERO_REQUIRES_CONTEXT,
  ENDPOINT_AVAILABILITY,
} from './config/endpoint-availability'
import {
  CardanoApiAdapter,
  EndpointPreference,
  ManagedCardanoApi,
  WalletContext,
} from './types'

export const cardanoApiManagerMaker = ({
  backendZeroAdapter,
  legacyAdapter,
  preferences,
}: {
  backendZeroAdapter: CardanoApiAdapter
  legacyAdapter: CardanoApiAdapter
  preferences: EndpointPreference
}): ManagedCardanoApi => {
  const getAdapter = (
    endpoint: keyof EndpointPreference,
    walletContext?: WalletContext,
  ): CardanoApiAdapter => {
    const preference = preferences[endpoint]
    const availableBackends = ENDPOINT_AVAILABILITY[endpoint]
    if (!availableBackends || availableBackends.length === 0) {
      throw new Error(`Endpoint ${endpoint} is not available in any backend`)
    }

    if (!availableBackends.includes(preference)) {
      throw new Error(
        `Backend ${preference} does not support endpoint ${endpoint}. Available: ${availableBackends.join(', ')}`,
      )
    }

    // Check if backend-zero requires wallet context
    if (
      preference === 'backend-zero' &&
      BACKEND_ZERO_REQUIRES_CONTEXT.has(endpoint) &&
      !walletContext
    ) {
      throw new Error(
        `Backend-zero endpoint ${endpoint} requires wallet context`,
      )
    }

    return preference === 'backend-zero' ? backendZeroAdapter : legacyAdapter
  }

  return freeze({
    async getTipStatus() {
      const adapter = getAdapter('getTipStatus')
      return adapter.getTipStatus()
    },

    async fetchNewTxHistory(request, walletContext?: WalletContext) {
      const adapter = getAdapter('fetchNewTxHistory', walletContext)
      return adapter.fetchNewTxHistory(request, walletContext)
    },

    async filterUsedAddresses(addresses, walletContext?: WalletContext) {
      const adapter = getAdapter('filterUsedAddresses', walletContext)
      return adapter.filterUsedAddresses(addresses, walletContext)
    },

    async submitTransaction(signedTx: string) {
      const adapter = getAdapter('submitTransaction')
      return adapter.submitTransaction(signedTx)
    },

    async getAccountState(request, walletContext?: WalletContext) {
      const adapter = getAdapter('getAccountState', walletContext)
      return adapter.getAccountState(request, walletContext)
    },

    async bulkGetAccountState(addresses, walletContext?: WalletContext) {
      const adapter = getAdapter('bulkGetAccountState', walletContext)
      return adapter.bulkGetAccountState(addresses, walletContext)
    },

    async getPoolInfo(request) {
      const adapter = getAdapter('getPoolInfo')
      return adapter.getPoolInfo(request)
    },

    async fetchTxStatus(request) {
      const adapter = getAdapter('fetchTxStatus')
      return adapter.fetchTxStatus(request)
    },

    async checkServerStatus() {
      const adapter = getAdapter('checkServerStatus')
      if (!adapter.checkServerStatus) {
        throw new Error('checkServerStatus not available')
      }
      return adapter.checkServerStatus()
    },

    async getFundInfo() {
      const adapter = getAdapter('getFundInfo')
      if (!adapter.getFundInfo) {
        throw new Error('getFundInfo not available')
      }
      return adapter.getFundInfo()
    },
  } as ManagedCardanoApi)
}
