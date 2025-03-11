import {Banners} from '@yoroi/types'
import {freeze} from 'immer'
import * as React from 'react'

/**
 * Custom hook to manage the state of a banner.
 *
 * @param {Object} params - The parameters for the hook.
 * @param {string} params.id - The unique identifier for the banner.
 * @param {Banners.Manager} params.manager - The manager responsible for handling banner state.
 * @param {Function} params.shouldShowCb - Callback function to determine if the banner should be shown.
 * @param {Object} params.shouldShowCb.params - Parameters for the callback function.
 * @param {number} params.shouldShowCb.params.dismissedAt - The timestamp when the banner was dismissed.
 * @returns {Object} An object containing the banner's dismissed timestamp, a function to dismiss the banner, and a boolean indicating if the banner should be shown.
 * @note Remember wrapping the shouldShowCb function in a useCallback hook to prevent unnecessary re-renders.
 */
export function useBanner({
  id,
  manager,
  shouldShowCb,
}: Readonly<{
  id: string
  manager: Readonly<Banners.Manager>
  shouldShowCb: ({dismissedAt}: {dismissedAt: number}) => boolean
}>) {
  return React.useMemo(() => {
    const dismissedAt = manager.dismissedAt(id)
    const dismiss = () => manager.dismiss(id)
    const shouldShow = shouldShowCb({dismissedAt})

    return freeze({dismissedAt, dismiss, shouldShow})
  }, [id, manager, shouldShowCb])
}
