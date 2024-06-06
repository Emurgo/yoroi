import {Chain} from '@yoroi/types'
import * as React from 'react'

import {logger} from '../../../kernel/logger/logger'
import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {WalletMeta} from '../common/types'
import {WalletManager} from '../wallet-manager'
import {
  WalletManagerActions,
  WalletManagerActionType,
  WalletManagerContextType,
  walletManagerDefaultState,
  walletManagerInitialContext,
  walletManagerReducer,
  WalletManagerState,
} from './state'

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
    walletSelected: ({wallet, meta}: {wallet: YoroiWallet | null; meta: WalletMeta | null}) =>
      dispatch({type: WalletManagerActionType.WalletSelected, wallet, meta}),
    selectedMetaUpdated: (meta: WalletMeta) => dispatch({type: WalletManagerActionType.SelectedMetaUpdated, meta}),
  }).current

  React.useEffect(() => {
    // it doesn't wait for the login
    // sync
    const unsubscribeSync = walletManager.startSyncing()

    // selected wallet
    const subSelectedWalletId = walletManager.selectedWalletId$.subscribe((id) => {
      if (id == null) {
        actions.walletSelected({wallet: null, meta: null})
        return
      }
      const wallet = walletManager.getWalletById(id)
      const meta = walletManager.getWalletMetaById(id)
      if (wallet == null || meta == null) {
        logger.error('WalletManagerProvider: subscriptions wallet or meta not found', {id})
        return
      }
      actions.walletSelected({wallet, meta})
    })

    // meta
    const subWalletMeta = walletManager.walletMetas$.subscribe((metas) => {
      if (state.selected.meta == null || state.selected.wallet == null) return
      const meta = metas.get(state.selected.meta?.id)
      if (meta == null) {
        logger.error('WalletManagerProvider: subscriptions meta not found', {meta})
        return
      }
      actions.selectedMetaUpdated(meta)
    })

    // selected network
    const subSelectedNetwork = walletManager.selectedNetwork$.subscribe((network) => {
      actions.networkSelected(network)
    })

    // unsubscribe
    return () => {
      unsubscribeSync()
      subSelectedWalletId.unsubscribe()
      subSelectedNetwork.unsubscribe()
      subWalletMeta.unsubscribe()
    }
  }, [actions, walletManager, state.selected.meta, state.selected.wallet])

  const context = React.useMemo(() => ({...state, walletManager}), [state, walletManager])

  return <WalletManagerContext.Provider value={context}>{children}</WalletManagerContext.Provider>
}

export const useWalletManager = () => {
  const {walletManager, ...context} = React.useContext(WalletManagerContext)

  if (walletManager == null) {
    const error = new Error('useWalletManager wallet manager is not set, invalid state reached')
    logger.error(error)
    throw error
  }

  return React.useMemo(() => ({...context, walletManager}), [context, walletManager])
}
