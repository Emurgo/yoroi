import {App, Chain, Wallet} from '@yoroi/types'
import * as React from 'react'

import {logger} from '../../../kernel/logger/logger'
import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {WalletManager} from '../wallet-manager'
import {
  WalletManagerActions,
  WalletManagerActionType,
  WalletManagerContextType,
  walletManagerDefaultState,
  walletManagerInitialContext,
  walletManagerReducer,
  WalletManagerState,
} from './WalletManagerState'

const WalletManagerContext = React.createContext<WalletManagerContextType>(walletManagerInitialContext)

/**
 * Most wallet manager side effects should be handled on every screen
 * we use react as source input to trigger side effects
 * this way react is just a translator to the wallet manager implementation
 */
export const WalletManagerProvider: React.FC<
  React.PropsWithChildren<{walletManager: WalletManager; initialState?: Partial<WalletManagerState>}>
> = ({children, initialState, walletManager}) => {
  const [state, dispatch] = React.useReducer(walletManagerReducer, {
    ...walletManagerDefaultState,
    ...initialState,
  })

  const actions = React.useRef<WalletManagerActions>({
    networkSelected: (network: Chain.SupportedNetworks) =>
      dispatch({type: WalletManagerActionType.NetworkSelected, network}),
    walletSelected: ({wallet, meta}: {wallet: YoroiWallet | null; meta: Wallet.Meta | null}) =>
      dispatch({type: WalletManagerActionType.WalletSelected, wallet, meta}),
    selectedMetaUpdated: (metas: Map<YoroiWallet['id'], Wallet.Meta>) =>
      dispatch({type: WalletManagerActionType.SelectedMetaUpdated, metas}),
  }).current

  const setWalletSelected = React.useCallback(
    (walletId: YoroiWallet['id'] | null) => {
      if (walletId == null) {
        actions.walletSelected({wallet: null, meta: null})
        return
      }
      const wallet = walletManager.getWalletById(walletId)
      const meta = walletManager.getWalletMetaById(walletId)
      if (wallet == null || meta == null) {
        logger.error('WalletManagerProvider: wallet or meta selected not found', {walletId})
        return
      }
      actions.walletSelected({wallet, meta})
    },
    [actions, walletManager],
  )

  React.useEffect(() => {
    // sync, it doesn't wait for the login
    walletManager.startSyncing()
    return () => walletManager.stopSyncing()
  }, [walletManager])

  React.useEffect(() => {
    // selected wallet: wallet id changed
    const subSelectedWalletId = walletManager.selectedWalletId$.subscribe((id) => {
      setWalletSelected(id)
    })
    return () => subSelectedWalletId.unsubscribe()
  }, [actions, setWalletSelected, walletManager])

  React.useEffect(() => {
    // meta
    const subWalletMeta = walletManager.walletMetas$.subscribe((metas) => {
      actions.selectedMetaUpdated(metas)
    })
    return () => subWalletMeta.unsubscribe()
  }, [actions, walletManager])

  React.useEffect(() => {
    // selected network
    const subSelectedNetwork = walletManager.selectedNetwork$.subscribe((network) => {
      actions.networkSelected(network)

      // NOTE: when switching networks the wallets are recreated, therefore is needed to refresh from manager into state again
      const selectedWalletId = state.selected.wallet?.id ?? null
      setWalletSelected(selectedWalletId)
    })
    return () => subSelectedNetwork.unsubscribe()
  }, [actions, setWalletSelected, state.selected.wallet?.id, walletManager])

  const context = React.useMemo(() => ({...state, walletManager}), [state, walletManager])

  return <WalletManagerContext.Provider value={context}>{children}</WalletManagerContext.Provider>
}

export const useWalletManager = () => {
  const {selected, walletManager} = React.useContext(WalletManagerContext)

  if (walletManager == null) {
    const error = new App.Errors.InvalidState('useWalletManager wallet manager is not set, invalid state reached')
    logger.error(error)
    throw error
  }

  return React.useMemo(() => {
    return {
      selected,
      walletManager,
    }
  }, [selected, walletManager])
}
