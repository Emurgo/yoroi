import {Chain, Wallet} from '@yoroi/types'

import {freeze} from 'immer'
import {BehaviorSubject, Observable} from 'rxjs'

import {YoroiWallet} from '~/wallets/cardano/types'

import {SyncWalletInfos} from '../common/types'

/**
 * Wallet Manager State
 * Functional state management for wallet operations
 */
export type WalletManagerState = {
  wallets: Map<YoroiWallet['id'], YoroiWallet>
  walletMetas: Map<YoroiWallet['id'], Wallet.Meta>
  selectedWalletId: YoroiWallet['id'] | null
  selectedNetwork: Chain.SupportedNetworks
  syncWalletInfos: SyncWalletInfos
  isSyncing: boolean
  syncControl: boolean
}

/**
 * Create initial wallet manager state
 */
export const createInitialWalletManagerState = (
  initialNetwork: Chain.SupportedNetworks = Chain.Network.Mainnet,
): WalletManagerState =>
  freeze({
    wallets: new Map(),
    walletMetas: new Map(),
    selectedWalletId: null,
    selectedNetwork: initialNetwork,
    syncWalletInfos: freeze(new Map()),
    isSyncing: false,
    syncControl: true,
  })

/**
 * Wallet Manager State Observables
 * Provides reactive streams for state changes
 */
export type WalletManagerStateObservables = {
  wallets$: Observable<Map<YoroiWallet['id'], YoroiWallet>>
  walletMetas$: Observable<Map<YoroiWallet['id'], Wallet.Meta>>
  selectedWalletId$: Observable<YoroiWallet['id'] | null>
  selectedNetwork$: Observable<Chain.SupportedNetworks>
  syncWalletInfos$: Observable<SyncWalletInfos>
  isSyncing$: Observable<boolean>
  syncControl$: Observable<boolean>
}

/**
 * Create state observables from state subjects
 */
export const createWalletManagerStateObservables = (
  state: WalletManagerStateSubjects,
): WalletManagerStateObservables => ({
  wallets$: state.wallets.asObservable(),
  walletMetas$: state.walletMetas.asObservable(),
  selectedWalletId$: state.selectedWalletId.asObservable(),
  selectedNetwork$: state.selectedNetwork.asObservable(),
  syncWalletInfos$: state.syncWalletInfos.asObservable(),
  isSyncing$: state.isSyncing.asObservable(),
  syncControl$: state.syncControl.asObservable(),
})

/**
 * Wallet Manager State Subjects
 * Internal state management using RxJS BehaviorSubjects
 */
export type WalletManagerStateSubjects = {
  wallets: BehaviorSubject<Map<YoroiWallet['id'], YoroiWallet>>
  walletMetas: BehaviorSubject<Map<YoroiWallet['id'], Wallet.Meta>>
  selectedWalletId: BehaviorSubject<YoroiWallet['id'] | null>
  selectedNetwork: BehaviorSubject<Chain.SupportedNetworks>
  syncWalletInfos: BehaviorSubject<SyncWalletInfos>
  isSyncing: BehaviorSubject<boolean>
  syncControl: BehaviorSubject<boolean>
}

/**
 * Create state subjects from initial state
 */
export const createWalletManagerStateSubjects = (
  initialState: WalletManagerState = createInitialWalletManagerState(),
): WalletManagerStateSubjects => ({
  wallets: new BehaviorSubject(initialState.wallets),
  walletMetas: new BehaviorSubject(initialState.walletMetas),
  selectedWalletId: new BehaviorSubject(initialState.selectedWalletId),
  selectedNetwork: new BehaviorSubject(initialState.selectedNetwork),
  syncWalletInfos: new BehaviorSubject(initialState.syncWalletInfos),
  isSyncing: new BehaviorSubject(initialState.isSyncing),
  syncControl: new BehaviorSubject(initialState.syncControl),
})

/**
 * State update functions
 */
export const updateWallets = (
  subjects: WalletManagerStateSubjects,
  wallets: Map<YoroiWallet['id'], YoroiWallet>,
) => {
  subjects.wallets.next(freeze(wallets))
}

export const updateWalletMetas = (
  subjects: WalletManagerStateSubjects,
  metas: Map<YoroiWallet['id'], Wallet.Meta>,
) => {
  subjects.walletMetas.next(freeze(metas))
}

export const setSelectedWalletId = (
  subjects: WalletManagerStateSubjects,
  id: YoroiWallet['id'] | null,
) => {
  subjects.selectedWalletId.next(id)
}

export const setSelectedNetwork = (
  subjects: WalletManagerStateSubjects,
  network: Chain.SupportedNetworks,
) => {
  subjects.selectedNetwork.next(network)
}

export const updateSyncWalletInfos = (
  subjects: WalletManagerStateSubjects,
  infos: SyncWalletInfos,
) => {
  subjects.syncWalletInfos.next(freeze(infos))
}

export const setIsSyncing = (
  subjects: WalletManagerStateSubjects,
  isSyncing: boolean,
) => {
  subjects.isSyncing.next(isSyncing)
}

export const setSyncControl = (
  subjects: WalletManagerStateSubjects,
  control: boolean,
) => {
  subjects.syncControl.next(control)
}

/**
 * Get current state values
 */
export const getCurrentState = (
  subjects: WalletManagerStateSubjects,
): WalletManagerState => ({
  wallets: subjects.wallets.value,
  walletMetas: subjects.walletMetas.value,
  selectedWalletId: subjects.selectedWalletId.value,
  selectedNetwork: subjects.selectedNetwork.value,
  syncWalletInfos: subjects.syncWalletInfos.value,
  isSyncing: subjects.isSyncing.value,
  syncControl: subjects.syncControl.value,
})
