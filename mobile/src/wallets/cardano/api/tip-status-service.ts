/**
 * Network-Level Tip Status Service
 *
 * Singleton service per network that automatically refreshes tip status.
 * Provides a shared tip status cache that can be used by sync manager, UI components, and other services.
 *
 * Benefits:
 * - Single source of truth for tip status per network
 * - Automatic refresh every 10 seconds
 * - Observable for reactive updates
 * - Reduces redundant API calls across the app
 */
import {Chain} from '@yoroi/types'

import {BehaviorSubject, Observable, Subscription, interval} from 'rxjs'

import {logger} from '~/kernel/logger/logger'
import {TipStatusResponse} from '~/wallets/types/other'

import * as yoroiApi from './api'

type TipStatusService = {
  getCurrentTipStatus: () => TipStatusResponse | null
  getTipStatus$: () => Observable<TipStatusResponse | null>
  fetchTipStatus: (forceRefresh?: boolean) => Promise<TipStatusResponse | null>
  start: () => void
  stop: () => void
  destroy: () => void
}

const REFRESH_INTERVAL = 10_000 // 10 seconds
const CACHE_TTL = 10_000 // 10 seconds

/**
 * Create tip status service for a network
 */
const createTipStatusService = (
  network: Chain.SupportedNetworks,
  baseApiUrl: string,
): TipStatusService => {
  const tipStatus$ = new BehaviorSubject<TipStatusResponse | null>(null)
  let refreshSubscription: Subscription | null = null
  let isActive = false
  let lastFetchTime = 0

  const fetchTipStatus = async (
    forceRefresh: boolean = false,
  ): Promise<TipStatusResponse | null> => {
    const now = Date.now()
    const cached = tipStatus$.value
    const timeSinceLastFetch = now - lastFetchTime

    // Return cached if still valid and not forcing refresh
    if (!forceRefresh && cached && timeSinceLastFetch < CACHE_TTL) {
      logger.debug('tipStatusService: Using cached tip status', {
        network,
        age: timeSinceLastFetch,
        origin: 'TipStatusService',
      })
      return cached
    }

    // Fetch fresh tip status
    try {
      logger.debug('tipStatusService: Fetching fresh tip status', {
        network,
        forceRefresh,
        origin: 'TipStatusService',
      })
      const tipStatus = await yoroiApi.getTipStatus(baseApiUrl)
      tipStatus$.next(tipStatus)
      lastFetchTime = now
      return tipStatus
    } catch (error) {
      logger.error('tipStatusService: Failed to fetch tip status', {
        network,
        error,
        origin: 'TipStatusService',
      })
      // Return cached value even if expired, as fallback
      return cached
    }
  }

  const start = (): void => {
    if (isActive) {
      return // Already started
    }

    isActive = true

    // Fetch immediately
    fetchTipStatus().catch((error) => {
      logger.error('tipStatusService: Initial fetch error', {
        network,
        error,
        origin: 'TipStatusService',
      })
    })

    // Set up periodic refresh
    refreshSubscription = interval(REFRESH_INTERVAL).subscribe(() => {
      fetchTipStatus().catch((error) => {
        logger.error('tipStatusService: Periodic refresh error', {
          network,
          error,
          origin: 'TipStatusService',
        })
      })
    })

    logger.debug('tipStatusService: Started automatic refresh', {
      network,
      refreshInterval: REFRESH_INTERVAL,
      origin: 'TipStatusService',
    })
  }

  const stop = (): void => {
    if (!isActive) {
      return
    }

    isActive = false
    refreshSubscription?.unsubscribe()
    refreshSubscription = null

    logger.debug('tipStatusService: Stopped automatic refresh', {
      network,
      origin: 'TipStatusService',
    })
  }

  const destroy = (): void => {
    stop()
    tipStatus$.complete()
  }

  return {
    getCurrentTipStatus: () => tipStatus$.value,
    getTipStatus$: () => tipStatus$.asObservable(),
    fetchTipStatus,
    start,
    stop,
    destroy,
  }
}

/**
 * Singleton instances per network
 */
const tipStatusServices = new Map<Chain.SupportedNetworks, TipStatusService>()

/**
 * Get or create tip status service for a network
 */
export const getTipStatusService = (
  network: Chain.SupportedNetworks,
  baseApiUrl: string,
): TipStatusService => {
  let service = tipStatusServices.get(network)
  if (!service) {
    service = createTipStatusService(network, baseApiUrl)
    tipStatusServices.set(network, service)
    // Auto-start the service
    service.start()
  }
  return service
}

/**
 * Stop and cleanup tip status service for a network
 */
export const stopTipStatusService = (
  network: Chain.SupportedNetworks,
): void => {
  const service = tipStatusServices.get(network)
  if (service) {
    service.stop()
    tipStatusServices.delete(network)
  }
}

/**
 * Stop and cleanup all tip status services
 */
export const stopAllTipStatusServices = (): void => {
  for (const [network, service] of tipStatusServices.entries()) {
    service.destroy()
    tipStatusServices.delete(network)
  }
}
