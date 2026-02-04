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
import {Links} from '@yoroi/types'

import {useFocusEffect} from '@react-navigation/native'
import * as React from 'react'

import {logger} from '~/kernel/logger/logger'

export const ClaimActionHandler = () => {
  const {pendingAction} = useLinks()
  const {reset: resetClaimState, scanActionClaimChanged, address} = useClaim()
  // Track processed claim URLs to prevent re-processing
  const processedClaimUrlsRef = React.useRef<Set<string>>(new Set())

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
        const cardanoAction = pendingAction.action as Links.CardanoActionClaim

        // Check if we've already processed this claim URL
        const claimKey = `${cardanoAction.url}:${cardanoAction.code}`
        if (processedClaimUrlsRef.current.has(claimKey)) {
          logger.info(
            'ClaimActionHandler: action already processed, skipping',
            {
              url: cardanoAction.url,
              code: cardanoAction.code,
            },
          )
          return
        }

        logger.info('ClaimActionHandler: processing claim action', {
          url: cardanoAction.url,
          code: cardanoAction.code,
          address,
        })

        // Reset claim state and set the cardano action
        resetClaimState()
        scanActionClaimChanged(cardanoAction)

        // Mark as processed to prevent re-processing if screen refocuses
        processedClaimUrlsRef.current.add(claimKey)
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
