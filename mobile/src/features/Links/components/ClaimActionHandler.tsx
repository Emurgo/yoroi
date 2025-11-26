/**
 * ClaimActionHandler Component
 *
 * Handles claim actions from pendingAction context.
 * This is separate from scan - scan is only for obtaining links via QR code.
 * This component processes claim actions that come from deep links.
 * It sets up the claim state, but the UI is handled by ClaimScreen.
 */
import {useClaim} from '@yoroi/claim'
import {useLinks} from '@yoroi/links'
import {Scan} from '@yoroi/types'

import {useFocusEffect} from '@react-navigation/native'
import * as React from 'react'

import {logger} from '~/kernel/logger/logger'

export const ClaimActionHandler = () => {
  const {pendingAction} = useLinks()
  const {reset: resetClaimState, scanActionClaimChanged, address} = useClaim()
  const processedActionRef = React.useRef<Scan.ActionClaim | null>(null)

  // Handle claim action from pendingAction context
  // Use useFocusEffect to ensure we process when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      logger.info('ClaimActionHandler: screen focused', {
        hasPendingAction: !!pendingAction,
        pendingActionSource: pendingAction?.source,
        pendingActionType:
          pendingAction?.source === 'cardano'
            ? pendingAction.action.action
            : pendingAction?.source === 'yoroi'
              ? pendingAction.action.info.useCase
              : undefined,
        address,
      })

      // Only process if:
      // 1. There's a pending action
      // 2. It's a Cardano action
      // 3. It's a claim action
      // 4. We haven't processed this specific action yet
      if (
        pendingAction &&
        pendingAction.source === 'cardano' &&
        pendingAction.action.action === 'claim'
      ) {
        const scanAction = pendingAction.action as Scan.ActionClaim

        // Check if we've already processed this action
        if (
          processedActionRef.current &&
          processedActionRef.current.url === scanAction.url &&
          processedActionRef.current.code === scanAction.code
        ) {
          logger.info(
            'ClaimActionHandler: action already processed, skipping',
            {
              url: scanAction.url,
              code: scanAction.code,
            },
          )
          return
        }

        logger.info('ClaimActionHandler: processing claim action', {
          url: scanAction.url,
          code: scanAction.code,
          address,
        })

        // Reset claim state and set the scan action
        resetClaimState()
        scanActionClaimChanged(scanAction)

        // Mark as processed to prevent re-processing if screen refocuses
        processedActionRef.current = scanAction
      } else {
        logger.info('ClaimActionHandler: conditions not met', {
          hasPendingAction: !!pendingAction,
          isCardano: pendingAction?.source === 'cardano',
          isClaim:
            pendingAction?.source === 'cardano'
              ? pendingAction.action.action === 'claim'
              : false,
        })
      }
    }, [pendingAction, resetClaimState, scanActionClaimChanged, address]),
  )

  return null
}
