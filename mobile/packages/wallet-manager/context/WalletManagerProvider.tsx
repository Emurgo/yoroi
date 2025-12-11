import {YoroiWallet} from '@yoroi/cardano-wallet'
import {getLogger, throwLoggedError} from '@yoroi/logger'
import {App, Chain, Wallet} from '@yoroi/types'

import * as React from 'react'

import {WalletManager} from '../wallet-manager'
import {
  WalletManagerAction,
  WalletManagerActionType,
  WalletManagerActions,
  WalletManagerContextType,
  WalletManagerState,
  createWalletManagerDefaultState,
  walletManagerReducer,
} from './wallet-manager-state'

// Context will be initialized with proper networkManagers in the provider
const WalletManagerContext =
  React.createContext<WalletManagerContextType | null>(null)

/**
 * Most wallet manager side effects should be handled on every screen
 * we use react as source input to trigger side effects
 * this way react is just a translator to the wallet manager implementation
 */
export const WalletManagerProvider: React.FC<
  React.PropsWithChildren<{
    walletManager: WalletManager
    initialState?: Partial<WalletManagerState>
  }>
> = ({children, initialState, walletManager}) => {
  // Get networkManagers from walletManager instance
  const networkManagers = React.useMemo(
    () => ({
      [Chain.Network.Mainnet]: walletManager.getNetworkManager(
        Chain.Network.Mainnet,
      ),
      [Chain.Network.Preprod]: walletManager.getNetworkManager(
        Chain.Network.Preprod,
      ),
    }),
    [walletManager],
  )

  const defaultState = React.useMemo(
    () => createWalletManagerDefaultState(networkManagers),
    [networkManagers],
  )

  const reducer = React.useCallback(
    (state: WalletManagerState, action: WalletManagerAction) =>
      walletManagerReducer(state, action, networkManagers),
    [networkManagers],
  )

  const [state, dispatch] = React.useReducer(reducer, {
    ...defaultState,
    ...initialState,
  })

  const actions = React.useRef<WalletManagerActions>({
    networkSelected: (network: Chain.SupportedNetworks) =>
      dispatch({type: WalletManagerActionType.NetworkSelected, network}),
    walletSelected: ({
      wallet,
      meta,
    }: {
      wallet: YoroiWallet | null
      meta: Wallet.Meta | null
    }) =>
      dispatch({type: WalletManagerActionType.WalletSelected, wallet, meta}),
    selectedMetaUpdated: (metas: Map<YoroiWallet['id'], Wallet.Meta>) =>
      dispatch({type: WalletManagerActionType.SelectedMetaUpdated, metas}),
  }).current

  const setWalletSelected = React.useCallback(
    async (walletId: YoroiWallet['id'] | null) => {
      if (walletId == null) {
        actions.walletSelected({wallet: null, meta: null})
        return
      }

      const meta = walletManager.getWalletMetaById(walletId)
      if (meta == null) {
        getLogger().error(
          'WalletManagerProvider: wallet meta selected not found',
          {
            walletId,
          },
        )
        return
      }

      let wallet = walletManager.getWalletById(walletId)

      // If wallet is not loaded, trigger loading via hydrate
      if (wallet == null) {
        try {
          await walletManager.hydrate({isForced: false})
          wallet = walletManager.getWalletById(walletId)
        } catch (error) {
          getLogger().error(
            'WalletManagerProvider: failed to load wallet during selection',
            {
              walletId,
              error: error instanceof Error ? error.message : String(error),
            },
          )
        }
      }

      if (wallet == null) {
        getLogger().error('WalletManagerProvider: wallet could not be loaded', {
          walletId,
        })
        return
      }

      actions.walletSelected({wallet, meta})
    },
    [actions, walletManager],
  )

  // Sync manager lifecycle
  React.useEffect(() => {
    // sync, it doesn't wait for the login
    walletManager.startSyncing()
    return () => walletManager.stopSyncing()
  }, [walletManager])

  // Optimized: Combine all observable subscriptions into a single effect
  // This reduces the number of effects and subscription overhead
  React.useEffect(() => {
    // selected wallet: wallet id changed
    const subSelectedWalletId = walletManager.selectedWalletId$.subscribe(
      (id) => {
        // setWalletSelected is async, but we don't need to await it
        // The loading state will be handled by WithWalletOpened
        setWalletSelected(id).catch((error) => {
          getLogger().error(
            'WalletManagerProvider: failed to set wallet selected',
            {
              id,
              error,
            },
          )
        })
      },
    )

    // meta updates
    const subWalletMeta = walletManager.walletMetas$.subscribe((metas) => {
      actions.selectedMetaUpdated(metas)
    })

    // selected network changes
    const subSelectedNetwork = walletManager.selectedNetwork$.subscribe(
      (network) => {
        actions.networkSelected(network)

        // NOTE: when switching networks the wallets are recreated, therefore is needed to refresh from manager into state again
        // Get the current selected wallet ID from the manager's getter
        const selectedWalletId = walletManager.selectedWalledId
        setWalletSelected(selectedWalletId)
      },
    )

    // Cleanup all subscriptions together
    return () => {
      subSelectedWalletId.unsubscribe()
      subWalletMeta.unsubscribe()
      subSelectedNetwork.unsubscribe()
    }
  }, [actions, setWalletSelected, walletManager])

  const context = React.useMemo(
    () => ({...state, walletManager}),
    [state, walletManager],
  )

  return (
    <WalletManagerContext.Provider value={context}>
      {children}
    </WalletManagerContext.Provider>
  )
}

/**
 * Hook to access the wallet manager context.
 * Returns the entire context - use selector hooks for better performance.
 *
 * @see useWalletManagerSelector - For selecting specific parts of the context
 */
export const useWalletManager = () => {
  const context = React.useContext(WalletManagerContext)

  if (context == null) {
    throwLoggedError(getLogger())(
      new App.Errors.InvalidState(
        'useWalletManager must be used within WalletManagerProvider',
      ),
    )
  }

  // TypeScript: context is guaranteed non-null after the check above
  const nonNullContext = context as WalletManagerContextType

  const {selected, walletManager} = nonNullContext

  if (walletManager == null) {
    throwLoggedError(getLogger())(
      new App.Errors.InvalidState(
        'useWalletManager wallet manager is not set, invalid state reached',
      ),
    )
  }

  // TypeScript: walletManager is guaranteed non-null after the check above
  const nonNullWalletManager = walletManager as WalletManager

  return React.useMemo(() => {
    return {
      selected,
      walletManager: nonNullWalletManager,
    }
  }, [selected, nonNullWalletManager])
}

/**
 * Hook to select a specific part of the wallet manager context.
 * Prevents unnecessary re-renders when other parts of the context change.
 *
 * **Usage**:
 * ```tsx
 * const wallet = useWalletManagerSelector((ctx) => ctx.selected.wallet)
 * const network = useWalletManagerSelector((ctx) => ctx.selected.network)
 * ```
 *
 * @param selector - Function that selects the desired value from the context
 * @returns The selected value
 */
export const useWalletManagerSelector = <T,>(
  selector: (context: WalletManagerContextType) => T,
): T => {
  const context = React.useContext(WalletManagerContext)

  if (context == null) {
    throwLoggedError(getLogger())(
      new App.Errors.InvalidState(
        'useWalletManagerSelector must be used within WalletManagerProvider',
      ),
    )
  }

  // TypeScript: context is guaranteed non-null after the check above
  const nonNullContext = context as WalletManagerContextType

  if (nonNullContext.walletManager == null) {
    throwLoggedError(getLogger())(
      new App.Errors.InvalidState(
        'useWalletManagerSelector wallet manager is not set, invalid state reached',
      ),
    )
  }

  // TypeScript: context is guaranteed non-null after the check above
  const typedContext = context as WalletManagerContextType

  return React.useMemo(() => selector(typedContext), [typedContext, selector])
}
