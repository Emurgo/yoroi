// @flow
import walletManager, {WalletClosed} from '../crypto/wallet'
import {Logger} from '../utils/logging'
import {ApiHistoryError} from '../api/errors'

import {type Dispatch} from 'redux'

const _startFetch = () => ({
  type: 'Fetch transaction history',
  path: ['txHistory', 'isSynchronizing'],
  payload: null,
  reducer: (state, payload) => true,
})

const _endFetch = () => ({
  type: 'Finished fetching transaction history',
  path: ['txHistory', 'isSynchronizing'],
  payload: null,
  reducer: (state, payload) => false,
})

const _setSyncError = (message: ?string): any => ({
  type: 'Set history sync error',
  path: ['txHistory', 'lastSyncError'],
  payload: message,
  reducer: (state, message) => message,
})

export const _setWarningBannerNote = (mode: ?boolean): any => ({
  type: 'Set Warning Note',
  path: ['txHistory', 'isWarningBannerOpen'],
  payload: mode,
  reducer: (state, mode) => mode,
})

export const closeWarningBannerNote = (mode: boolean) => (
  dispatch: Dispatch<any>,
) => {
  dispatch(_setWarningBannerNote(mode))
}

export const setBackgroundSyncError = _setSyncError

export const updateHistory = () => async (dispatch: Dispatch<any>) => {
  // TODO(ppershing): abort previous request if still fetching
  dispatch(_startFetch())
  try {
    await walletManager.doFullSync()
    dispatch(_setSyncError(null))
  } catch (e) {
    if (e instanceof ApiHistoryError) {
      // try again after wiping out state
      // (note(v-almonacid): I'm deliberately avoiding calling updateHistory
      // recursively to prevent an infinite loop in case ApiHistoryError persists)
      try {
        await walletManager.doFullSync()
        dispatch(_setSyncError(null))
      } catch (e) {
        Logger.error('Sync error', e)
        dispatch(_setSyncError(e.message))
      }
    } else if (e instanceof WalletClosed) {
      // do nothing
    } else {
      // TODO(ppershing): should we set error object or just
      // some message code?
      Logger.error('Sync error', e)
      dispatch(_setSyncError(e.message))
    }
  } finally {
    dispatch(_endFetch())
  }
}

export const mirrorTxHistory = () => (dispatch: Dispatch<any>) => {
  // Note(ppershing): this runs through getters
  const {
    walletName: name,
    isInitialized,
    isShelley,
    isHW,
    hwDeviceInfo,
    transactions,
    internalAddresses,
    externalAddresses,
    confirmationCounts,
    isUsedAddressIndex,
    numReceiveAddresses,
    canGenerateNewReceiveAddress,
    isEasyConfirmationEnabled,
  } = walletManager

  dispatch({
    type: 'Mirror walletManager TxHistory',
    path: ['wallet'],
    payload: {
      name,
      isEasyConfirmationEnabled,
      isInitialized,
      isShelley,
      isHW,
      hwDeviceInfo,
      transactions,
      internalAddresses,
      externalAddresses,
      confirmationCounts,
      isUsedAddressIndex,
      numReceiveAddresses,
      canGenerateNewReceiveAddress,
    },
    reducer: (state, payload) => payload,
  })
}
