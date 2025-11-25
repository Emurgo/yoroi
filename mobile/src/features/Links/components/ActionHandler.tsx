/**
 * ActionHandler Component
 *
 * Handles all link actions (both Yoroi and Cardano links).
 * Watches pending action context and processes actions once prerequisites are met:
 * - User must be logged in (all actions require login for security)
 * - Wallet must be selected (except restore-wallet and view actions)
 */
import {PendingAction, requiresWallet, useLinks} from '@yoroi/links'

import * as React from 'react'
import {InteractionManager} from 'react-native'

import {useAuth} from '~/features/Auth/context/AuthProvider'
import {useWalletManagerSelector} from '~/features/WalletManager/context/WalletManagerProvider'
import {useSelectWalletModal} from '~/features/WalletManager/ui/modals/SelectWalletModal'
import {logger} from '~/kernel/logger/logger'

import {useActionExecutor} from '../hooks/useActionExecutor'

/**
 * Check if an action shows a modal that will handle its own cleanup.
 * These actions should not be cleared immediately after execution.
 */
const showsModal = (pendingAction: PendingAction): boolean => {
  if (pendingAction.source === 'yoroi') {
    const useCase = pendingAction.action.info.useCase
    // These show modals that handle their own cleanup
    return useCase === 'request/ada-with-link' || useCase === 'launch'
  }
  // Cardano actions don't show modals (except claim which handles its own)
  return false
}

export const ActionHandler = () => {
  const {isLoggedIn} = useAuth()
  const {pendingAction, markActionProcessed} = useLinks()
  const wallet = useWalletManagerSelector((ctx) => ctx.selected.wallet)
  const executeAction = useActionExecutor()
  const {openSelectWalletModal} = useSelectWalletModal()

  // Track the last processed action to prevent infinite loops
  const lastProcessedActionRef = React.useRef<string | null>(null)
  const isProcessingRef = React.useRef(false)
  const hasShownWalletModalRef = React.useRef(false)
  // Track if we were waiting for wallet to allow reprocessing when wallet becomes available
  const wasWaitingForWalletRef = React.useRef(false)

  // Store functions in refs to avoid stale closures
  const executeActionRef = React.useRef(executeAction)
  const markActionProcessedRef = React.useRef(markActionProcessed)

  React.useEffect(() => {
    executeActionRef.current = executeAction
    markActionProcessedRef.current = markActionProcessed
  }, [executeAction, markActionProcessed])

  // Create unique identifier for action
  const actionId = React.useMemo(() => {
    if (!pendingAction) return null
    const actionData =
      pendingAction.source === 'yoroi'
        ? pendingAction.action.info
        : pendingAction.action
    return `${pendingAction.source}-${JSON.stringify(actionData)}`
  }, [pendingAction])

  // Handle wallet selection modal
  React.useEffect(() => {
    if (!pendingAction || !isLoggedIn) {
      hasShownWalletModalRef.current = false
      return
    }

    // Check if action requires wallet
    const needsWallet = requiresWallet(pendingAction)

    // If wallet is needed but not selected, show modal
    if (needsWallet && !wallet && !hasShownWalletModalRef.current) {
      hasShownWalletModalRef.current = true
      openSelectWalletModal({
        onSelect: () => {
          hasShownWalletModalRef.current = false
          // Wallet will be selected, component will re-render and process action
        },
        onCancel: () => {
          hasShownWalletModalRef.current = false
          // User cancelled, clear the action
          markActionProcessedRef.current()
        },
      })
    } else if (wallet) {
      // Wallet is now selected, reset modal flag
      hasShownWalletModalRef.current = false
    }
  }, [pendingAction, isLoggedIn, wallet, openSelectWalletModal])

  // Process action when prerequisites are met
  React.useEffect(() => {
    if (!pendingAction) {
      lastProcessedActionRef.current = null
      isProcessingRef.current = false
      wasWaitingForWalletRef.current = false
      return
    }

    // All actions require login for security
    // This includes restore-wallet - user must authenticate first
    if (!isLoggedIn) {
      logger.debug('ActionHandler: waiting for login', {
        action:
          pendingAction.source === 'yoroi'
            ? pendingAction.action.info.useCase
            : pendingAction.action.action,
      })
      return
    }

    // Check if wallet is required
    const needsWallet = requiresWallet(pendingAction)

    // If wallet is required but not selected, wait (modal is handled above)
    if (needsWallet && !wallet) {
      wasWaitingForWalletRef.current = true
      logger.debug('ActionHandler: waiting for wallet selection', {
        action:
          pendingAction.source === 'yoroi'
            ? pendingAction.action.info.useCase
            : pendingAction.action.action,
        hasWallet: !!wallet,
      })
      return
    }

    // If wallet was just selected (we were waiting and now have wallet), reset processing state
    if (wasWaitingForWalletRef.current && wallet) {
      logger.debug(
        'ActionHandler: wallet selected, resetting processing state',
        {
          action:
            pendingAction.source === 'yoroi'
              ? pendingAction.action.info.useCase
              : pendingAction.action.action,
          hasWallet: !!wallet,
        },
      )
      lastProcessedActionRef.current = null
      isProcessingRef.current = false
      wasWaitingForWalletRef.current = false
    }

    if (
      !isProcessingRef.current &&
      actionId !== lastProcessedActionRef.current
    ) {
      isProcessingRef.current = true
      lastProcessedActionRef.current = actionId

      logger.debug('ActionHandler: processing action', {
        action:
          pendingAction.source === 'yoroi'
            ? pendingAction.action.info.useCase
            : pendingAction.action.action,
        hasWallet: !!wallet,
        isLoggedIn,
      })

      InteractionManager.runAfterInteractions(() => {
        try {
          executeActionRef.current(pendingAction)
          // Only clear actions that don't show modals
          // Modals (request/ada-with-link, launch) will clear themselves
          // Exchange result screen will clear when done
          if (!showsModal(pendingAction)) {
            markActionProcessedRef.current()
          }
          setTimeout(() => {
            isProcessingRef.current = false
          }, 1000)
        } catch (error) {
          logger.error('ActionHandler: error executing action', {
            error,
            errorMessage:
              error instanceof Error ? error.message : String(error),
            source: pendingAction.source,
            actionType:
              pendingAction.source === 'yoroi'
                ? pendingAction.action.info.useCase
                : pendingAction.action.action,
          })
          isProcessingRef.current = false
          // Reset lastProcessedActionRef to allow retry on error
          lastProcessedActionRef.current = null
          // Don't clear the action on error - let user retry
        }
      })
    }
  }, [pendingAction, isLoggedIn, wallet, actionId])

  return null
}
