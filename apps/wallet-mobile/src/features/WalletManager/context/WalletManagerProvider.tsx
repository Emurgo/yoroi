import {Chain, Wallet} from '@yoroi/types'
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
    walletSelected: ({wallet, meta}: {wallet: YoroiWallet | null; meta: Wallet.Meta | null}) =>
      dispatch({type: WalletManagerActionType.WalletSelected, wallet, meta}),
    selectedMetaUpdated: (metas: Map<YoroiWallet['id'], Wallet.Meta>) =>
      dispatch({type: WalletManagerActionType.SelectedMetaUpdated, metas}),
  }).current

  React.useEffect(() => {
    // sync, it doesn't wait for the login
    const unsubscribeSync = walletManager.startSyncing()
    return () => unsubscribeSync()
  }, [walletManager])

  React.useEffect(() => {
    // selected wallet
    const subSelectedWalletId = walletManager.selectedWalletId$.subscribe((id) => {
      if (id == null) {
        actions.walletSelected({wallet: null, meta: null})
        return
      }
      const wallet = walletManager.getWalletById(id)
      const meta = walletManager.getWalletMetaById(id)
      if (wallet == null || meta == null) {
        logger.error('WalletManagerProvider: wallet or meta selected not found', {id})
        return
      }
      actions.walletSelected({wallet, meta})
    })
    return () => subSelectedWalletId.unsubscribe()
  }, [actions, walletManager])

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
    })
    return () => subSelectedNetwork.unsubscribe()
  }, [actions, walletManager])

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
