/**
 * ActionHandler Component
 *
 * Handles all link actions (both Yoroi and Cardano links).
 * Watches pending action context and processes actions once prerequisites are met:
 * - User must be logged in (all actions require login for security)
 * - Wallet must be selected (except restore-wallet and view actions)
 *
 * Uses RxJS operators to manage state flow and avoid complex useEffect interdependencies.
 */
import {PendingAction, requiresWallet, useLinks} from '@yoroi/links'
import {useWalletManagerSelector} from '@yoroi/wallet-manager'

import * as React from 'react'
import {InteractionManager} from 'react-native'
import {
  BehaviorSubject,
  Subscription,
  combineLatest,
  delayWhen,
  distinctUntilChanged,
  filter,
  map,
  timer,
} from 'rxjs'

import {useAuth} from '~/features/Auth/context/AuthProvider'
import {useSelectWalletModal} from '~/features/WalletManager/ui/modals/SelectWalletModal'
import {logger} from '~/kernel/logger/logger'
import {isWalletSelectionRoute} from '~/kernel/navigation/common/helpers'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'

import {useActionExecutor} from '../hooks/useActionExecutor'

/**
 * Check if an action shows a modal that will handle its own cleanup.
 * These actions should not be cleared immediately after execution.
 */
const showsModal = (pendingAction: PendingAction): boolean => {
  if (pendingAction.source === 'yoroi') {
    const useCase = pendingAction.action.info.useCase
    // These show modals or screens that handle their own cleanup
    return (
      useCase === 'request/ada-with-link' ||
      useCase === 'launch' ||
      useCase === 'order/show-create-result'
    )
  }
  // Cardano actions: claim shows a modal that handles its own cleanup
  if (pendingAction.source === 'cardano') {
    return pendingAction.action.action === 'claim'
  }
  return false
}

/**
 * Create a safe action ID without circular references
 */
const createActionId = (pendingAction: PendingAction | null): string | null => {
  if (!pendingAction) return null

  if (pendingAction.source === 'yoroi') {
    const useCase = pendingAction.action.info.useCase
    const params = pendingAction.action.info.params
    const keyFields: string[] = []
    if (params) {
      if ('dappUrl' in params && params.dappUrl) {
        keyFields.push(`dappUrl:${params.dappUrl}`)
      }
      if ('link' in params && params.link) {
        keyFields.push(`link:${params.link}`)
      }
      if ('redirectTo' in params && params.redirectTo) {
        keyFields.push(`redirectTo:${params.redirectTo}`)
      }
      if ('targets' in params && Array.isArray(params.targets)) {
        const targetIds = params.targets
          .map((t, i) => {
            if (t?.receiver) return `target${i}:${t.receiver}`
            return null
          })
          .filter((id): id is string => id !== null)
        if (targetIds.length > 0) keyFields.push(...targetIds)
      }
    }
    return `yoroi-${useCase}${keyFields.length > 0 ? `-${keyFields.join('-')}` : ''}`
  } else {
    const actionType = pendingAction.action.action
    const action = pendingAction.action
    const keyFields: string[] = []
    if ('url' in action && action.url) {
      keyFields.push(`url:${action.url}`)
    }
    if ('receiver' in action && action.receiver) {
      keyFields.push(`receiver:${action.receiver}`)
    }
    if ('address' in action && action.address) {
      keyFields.push(`address:${action.address}`)
    }
    if ('hash' in action && action.hash) {
      keyFields.push(`hash:${action.hash}`)
    }
    if ('pool' in action && action.pool) {
      keyFields.push(`pool:${action.pool}`)
    }
    return `cardano-${actionType}${keyFields.length > 0 ? `-${keyFields.join('-')}` : ''}`
  }
}

export const ActionHandler = () => {
  const {isLoggedIn} = useAuth()
  const {pendingAction, markActionProcessed} = useLinks()
  const wallet = useWalletManagerSelector((ctx) => ctx.selected.wallet)
  const executeAction = useActionExecutor()
  const {openSelectWalletModal} = useSelectWalletModal()
  const walletNavigation = useWalletNavigation()

  // Create observables from React state (created once, updated via .next())
  const pendingAction$Ref = React.useRef(
    new BehaviorSubject<PendingAction | null>(pendingAction),
  )
  const isLoggedIn$Ref = React.useRef(new BehaviorSubject<boolean>(isLoggedIn))
  const wallet$Ref = React.useRef(new BehaviorSubject<typeof wallet>(wallet))

  // Update observables when React state changes
  React.useEffect(() => {
    if (pendingAction) {
      const newActionId = createActionId(pendingAction)
      // If this actionId was processed before, check if it's a new instance
      if (newActionId && processedActionsRef.current.has(newActionId)) {
        const previousAction = processedActionsRef.current.get(newActionId)
        // If the action object reference is different, it's a new trigger
        if (previousAction !== pendingAction) {
          // Same actionId but new instance - clear to allow reprocessing
          processedActionsRef.current.delete(newActionId)
          isProcessingRef.current = false
        }
      }
      currentActionIdRef.current = newActionId
    } else {
      currentActionIdRef.current = null
    }
    pendingAction$Ref.current.next(pendingAction)
  }, [pendingAction])

  React.useEffect(() => {
    isLoggedIn$Ref.current.next(isLoggedIn)
  }, [isLoggedIn])

  React.useEffect(() => {
    wallet$Ref.current.next(wallet)
    // Update prevWalletRef after observable is updated
    prevWalletRef.current = wallet
  }, [wallet])

  // Track processing state
  // Map actionId -> pendingAction object reference to detect new triggers
  const processedActionsRef = React.useRef<Map<string, PendingAction | null>>(
    new Map(),
  )
  const isProcessingRef = React.useRef(false)
  const hasShownModalRef = React.useRef(false)
  const prevWalletRef = React.useRef<typeof wallet>(wallet)
  const currentActionIdRef = React.useRef<string | null>(null)

  // Store functions in refs
  const executeActionRef = React.useRef(executeAction)
  const markActionProcessedRef = React.useRef(markActionProcessed)
  const openSelectWalletModalRef = React.useRef(openSelectWalletModal)
  const walletNavigationRef = React.useRef(walletNavigation)

  // Wrap markActionProcessed to also clear the processed actionId
  const markActionProcessedWrapper = React.useCallback(() => {
    // Clear the current actionId from processed map when action is marked as processed
    // This allows the same link to be triggered again
    if (currentActionIdRef.current) {
      processedActionsRef.current.delete(currentActionIdRef.current)
    }
    markActionProcessed()
  }, [markActionProcessed])

  React.useEffect(() => {
    executeActionRef.current = executeAction
    markActionProcessedRef.current = markActionProcessedWrapper
    openSelectWalletModalRef.current = openSelectWalletModal
    walletNavigationRef.current = walletNavigation
  }, [
    executeAction,
    markActionProcessedWrapper,
    openSelectWalletModal,
    walletNavigation,
  ])

  // Main RxJS stream: Handle wallet selection modal and action processing
  React.useEffect(() => {
    const subscription = new Subscription()

    // Stream for wallet modal logic
    const walletModalStream$ = combineLatest([
      pendingAction$Ref.current,
      isLoggedIn$Ref.current,
      wallet$Ref.current,
    ]).pipe(
      distinctUntilChanged(
        (prev, curr) =>
          prev[0] === curr[0] && prev[1] === curr[1] && prev[2] === curr[2],
      ),
    )

    subscription.add(
      walletModalStream$.subscribe(([action, loggedIn, currentWallet]) => {
        if (!action || !loggedIn) {
          hasShownModalRef.current = false
          return
        }

        const needsWallet = requiresWallet(action)

        if (needsWallet && !currentWallet && !hasShownModalRef.current) {
          // Check if we're already on the wallet selection screen
          const navState = walletNavigationRef.current.navigation.getState()
          const isOnWalletSelectionScreen = navState
            ? isWalletSelectionRoute(navState)
            : false

          if (isOnWalletSelectionScreen) {
            // Already on wallet selection screen - don't show modal
            // User can select wallet from the screen, PendingActionBanner will show context
            return
          }

          // Not on wallet selection screen - show modal
          hasShownModalRef.current = true
          openSelectWalletModalRef.current({
            onSelect: () => {
              hasShownModalRef.current = false
            },
            onCancel: () => {
              hasShownModalRef.current = false
              markActionProcessedRef.current()
            },
          })
        } else if (currentWallet) {
          hasShownModalRef.current = false
        }
      }),
    )

    // Stream for action processing
    // Add delay when wallet transitions from null to available to allow modal to close
    const actionProcessingStream$ = combineLatest([
      pendingAction$Ref.current,
      isLoggedIn$Ref.current,
      wallet$Ref.current,
    ]).pipe(
      distinctUntilChanged(
        (prev, curr) =>
          prev[0] === curr[0] && prev[1] === curr[1] && prev[2] === curr[2],
      ),
      filter(([action]) => action !== null),
      // Delay when wallet transitions from null to available (modal closing)
      delayWhen(([_action, _loggedIn, currentWallet]) => {
        const prevWallet = prevWalletRef.current
        const walletJustBecameAvailable = !prevWallet && currentWallet
        // Add 300ms delay to allow wallet selection modal to close
        return walletJustBecameAvailable ? timer(300) : timer(0)
      }),
      map(([action, loggedIn, currentWallet]) => ({
        action: action!,
        isLoggedIn: loggedIn,
        wallet: currentWallet,
        actionId: createActionId(action!),
        // Include action object reference to detect new triggers
        actionRef: action!,
      })),
      // Compare action object reference to allow same link to be triggered multiple times
      // We rely on processedActionsRef for deduplication, not distinctUntilChanged
      distinctUntilChanged(
        (prev, curr) =>
          prev.actionRef === curr.actionRef &&
          prev.isLoggedIn === curr.isLoggedIn &&
          prev.wallet === curr.wallet,
      ),
    )

    subscription.add(
      actionProcessingStream$.subscribe(
        ({action, isLoggedIn: loggedIn, wallet: currentWallet, actionId}) => {
          // Allow restore-wallet actions even when not logged in
          const isRestoreWalletAction =
            action.source === 'cardano' &&
            action.action.action === 'restore-wallet'

          if (!loggedIn && !isRestoreWalletAction) {
            return
          }

          const needsWallet = requiresWallet(action)

          if (needsWallet && !currentWallet) {
            // Clear processed state when waiting for wallet
            if (actionId) {
              processedActionsRef.current.delete(actionId)
            }
            return
          }

          // Check if we've already processed this exact action instance
          if (actionId && processedActionsRef.current.has(actionId)) {
            const processedAction = processedActionsRef.current.get(actionId)
            // If it's the same action object reference, skip (already processing)
            if (processedAction === action) {
              return
            }
            // Different action object with same actionId - new trigger, allow it
            processedActionsRef.current.delete(actionId)
            isProcessingRef.current = false
          }

          if (!actionId) {
            return
          }

          if (isProcessingRef.current) {
            return
          }

          isProcessingRef.current = true
          // Store action object reference, not just actionId
          processedActionsRef.current.set(actionId, action)

          InteractionManager.runAfterInteractions(() => {
            try {
              executeActionRef.current(action)
              if (!showsModal(action)) {
                // For non-modal actions, mark as processed immediately
                markActionProcessedRef.current()
                // Clear processing flag after a short delay to prevent rapid re-processing
                setTimeout(() => {
                  isProcessingRef.current = false
                }, 100)
              } else {
                // For modal actions, clear processing flag after modal is shown
                // The modal will call markActionProcessed when it closes
                setTimeout(() => {
                  isProcessingRef.current = false
                }, 1000)
              }
            } catch (error) {
              logger.error('ActionHandler: error executing action', {
                error,
                errorMessage:
                  error instanceof Error ? error.message : String(error),
                source: action.source,
                actionType:
                  action.source === 'yoroi'
                    ? action.action.info.useCase
                    : action.action.action,
              })
              isProcessingRef.current = false
              // Remove from processed map to allow retry
              if (actionId) {
                processedActionsRef.current.delete(actionId)
              }
            }
          })
        },
      ),
    )

    // Cleanup when pendingAction becomes null
    subscription.add(
      pendingAction$Ref.current
        .pipe(filter((action) => action === null))
        .subscribe(() => {
          processedActionsRef.current.clear()
          isProcessingRef.current = false
        }),
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return null
}
