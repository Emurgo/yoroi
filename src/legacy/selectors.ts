/* eslint-disable @typescript-eslint/no-explicit-any */
import {fromPairs} from 'lodash'
import {createSelector} from 'reselect'

import type {State} from '../legacy/state'
import {RawUtxo} from '../yoroi-wallets/types/other'

export const internalAddressIndexSelector: (state: State) => Record<string, number> = createSelector(
  (state: State) => state.wallet.internalAddresses,
  (addresses) => fromPairs(addresses.map((addr, i) => [addr, i])),
)
export const externalAddressIndexSelector: (state: State) => Record<string, number> = createSelector(
  (state: State) => state.wallet.externalAddresses,
  (addresses) => fromPairs(addresses.map((addr, i) => [addr, i])),
)
export const isUsedAddressIndexSelector = (state: State) => state.wallet.isUsedAddressIndex

export const receiveAddressesSelector: (state: State) => Array<string> = createSelector(
  (state: State) => state.wallet.externalAddresses,
  (state: State) => state.wallet.numReceiveAddresses,
  (addresses, count) => addresses.slice(0, count),
)
export const canGenerateNewReceiveAddressSelector = (state: State) => state.wallet.canGenerateNewReceiveAddress

export const isSynchronizingHistorySelector = (state: State): boolean => state.txHistory.isSynchronizing
export const lastHistorySyncErrorSelector = (state: State) => state.txHistory.lastSyncError
// TokenInfo
export const isFetchingUtxosSelector = (state: State): boolean => state.balance.isFetching
export const lastUtxosFetchErrorSelector = (state: State) => state.balance.lastFetchingError
export const utxosSelector = (state: State): Array<RawUtxo> | null | undefined => state.balance.utxos
// app-related selectors
export const biometricHwSupportSelector = (state: State): boolean => state.appSettings.isBiometricHardwareSupported
export const canEnableBiometricSelector = (state: State): boolean => state.appSettings.canEnableBiometricEncryption
export const isSystemAuthEnabledSelector = (state: State): boolean => state.appSettings.isSystemAuthEnabled
export const sendCrashReportsSelector = (state: State): boolean => state.appSettings.sendCrashReports
export const isAppInitializedSelector = (state: State): boolean => state.isAppInitialized
export const installationIdSelector = (state: State) => state.appSettings.installationId
export const isMaintenanceSelector = (state: State): boolean => state.serverStatus.isMaintenance

/**
 * Before users can actually create a wallet, 3 steps must be completed:
 * - language selection (though en-US is set by default)
 * - Terms of service acceptance
 * - Authentication system setup (based on pin or biometrics)
 */
export const isAppSetupCompleteSelector: (state: State) => boolean = createSelector(
  (state: State): boolean => state.appSettings.acceptedTos,
  isSystemAuthEnabledSelector,
  (state: State) => state.appSettings.customPinHash,
  (acceptedTos, isSystemAuthEnabled, customPinHash) => acceptedTos && (isSystemAuthEnabled || customPinHash != null),
)
