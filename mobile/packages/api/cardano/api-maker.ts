import {backendZeroApiMaker} from './adapters/backend-zero/api-maker'
import {legacyApiMaker} from './adapters/legacy/api-maker'
import {cardanoApiManagerMaker} from './manager'
import {CardanoBackend, EndpointPreference, ManagedCardanoApi} from './types'
import {getBackendZeroUrl} from './utils/url-mapping'

export const cardanoWalletApiMaker = ({
  baseApiUrl,
  getSpendingKey,
}: {
  baseApiUrl: string
  getSpendingKey: (address: string) => string | null
}): ManagedCardanoApi => {
  const backendZeroUrl = getBackendZeroUrl(baseApiUrl)
  const backendZeroAdapter = backendZeroApiMaker({
    baseApiUrl,
    backendZeroUrl,
    getSpendingKey,
  })
  const legacyAdapter = legacyApiMaker({baseApiUrl})

  // Default preferences (all backend-zero where available, otherwise legacy)
  const defaultPreferences: EndpointPreference = {
    getTipStatus: 'backend-zero',
    fetchNewTxHistory: 'backend-zero',
    filterUsedAddresses: 'backend-zero',
    submitTransaction: 'backend-zero',
    getAccountState: 'backend-zero',
    bulkGetAccountState: 'backend-zero',
    getPoolInfo: 'backend-zero',
    fetchTxStatus: 'backend-zero',
    checkServerStatus: 'legacy', // Legacy only
    getFundInfo: 'legacy', // Legacy only
  } as const

  return cardanoApiManagerMaker({
    backendZeroAdapter,
    legacyAdapter,
    preferences: defaultPreferences,
  })
}

