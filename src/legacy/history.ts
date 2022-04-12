/* eslint-disable @typescript-eslint/no-explicit-any */

import type {Dispatch} from 'redux'

import {Logger} from '../legacy/logging'
import {WalletClosed, walletManager} from '../yoroi-wallets'
import {ApiHistoryError} from './errors'

const _startFetch = () => ({
  type: 'Fetch transaction history',
  path: ['txHistory', 'isSynchronizing'],
  payload: null,
  reducer: (_state, _payload) => true,
})

const _endFetch = () => ({
  type: 'Finished fetching transaction history',
  path: ['txHistory', 'isSynchronizing'],
  payload: null,
  reducer: (_state, _payload) => false,
})

const _setSyncError = (message: null | undefined | string) => ({
  type: 'Set history sync error',
  path: ['txHistory', 'lastSyncError'],
  payload: message,
  reducer: (state, message) => message,
})

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
        dispatch(_setSyncError((e as Error).message))
      }
    } else if (e instanceof WalletClosed) {
      // do nothing
    } else {
      // TODO(ppershing): should we set error object or just
      // some message code?
      Logger.error('Sync error', e)
      dispatch(_setSyncError((e as Error).message))
    }
  } finally {
    dispatch(_endFetch())
  }
}

export const mirrorTxHistory = () => (dispatch: Dispatch<any>) => {
  const {
    isInitialized,
    networkId,
    walletImplementationId,
    isHW,
    hwDeviceInfo,
    isReadOnly,
    transactions,
    internalAddresses,
    externalAddresses,
    rewardAddressHex,
    confirmationCounts,
    isUsedAddressIndex,
    numReceiveAddresses,
    canGenerateNewReceiveAddress,
    isEasyConfirmationEnabled,
    checksum,
    provider,
    id,
  } = walletManager

  dispatch({
    type: 'Mirror walletManager TxHistory',
    path: ['wallet'],
    payload: {
      id,
      isEasyConfirmationEnabled,
      isInitialized,
      networkId,
      walletImplementationId,
      isHW,
      hwDeviceInfo,
      isReadOnly,
      transactions,
      internalAddresses,
      externalAddresses,
      rewardAddressHex,
      confirmationCounts,
      isUsedAddressIndex,
      numReceiveAddresses,
      canGenerateNewReceiveAddress,
      checksum,
      provider,
    },
    reducer: (state, payload) => payload,
  })
}
