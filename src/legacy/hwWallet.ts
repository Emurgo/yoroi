/* eslint-disable @typescript-eslint/no-explicit-any */
import type {Dispatch} from 'redux'

import {Logger} from '../legacy/logging'
import {walletManager} from '../yoroi-wallets'
import type {DeviceId, DeviceObj, HWDeviceInfo} from './ledgerUtils'
import {NoDeviceInfoError} from './ledgerUtils'
import {hwDeviceInfoSelector} from './selectors'
import type {State} from './state'

const _saveHW = (hwDeviceInfo) => ({
  path: ['wallet', 'hwDeviceInfo'],
  payload: hwDeviceInfo,
  reducer: (state, value) => value,
  type: 'SAVE_HW',
})

export const saveHW = (hwDeviceInfo: HWDeviceInfo) => (dispatch: Dispatch<any>) => {
  dispatch(_saveHW(hwDeviceInfo))
}

export const setLedgerDeviceId =
  (deviceId: DeviceId): any =>
  async (dispatch: Dispatch<any>, getState: () => State) => {
    Logger.debug('setting deviceId', deviceId)
    const state = getState()
    const hwDeviceInfo = hwDeviceInfoSelector(state)
    if (hwDeviceInfo == null || hwDeviceInfo.hwFeatures == null) {
      throw new NoDeviceInfoError()
    }
    const updatedInfo = {
      ...hwDeviceInfo,
      hwFeatures: {
        ...hwDeviceInfo.hwFeatures,
        deviceId,
      },
    }
    Logger.debug('updating hwDeviceInfo', updatedInfo)
    // saved in redux state internally through notify()
    await walletManager.updateHWDeviceInfo(updatedInfo)
  }

export const setLedgerDeviceObj =
  (deviceObj: DeviceObj): any =>
  async (dispatch: Dispatch<any>, getState: () => State) => {
    Logger.debug('setting deviceObj', deviceObj)
    const state = getState()
    const hwDeviceInfo = hwDeviceInfoSelector(state)
    if (hwDeviceInfo == null || hwDeviceInfo.hwFeatures == null) {
      throw new NoDeviceInfoError()
    }
    const updatedInfo = {
      ...hwDeviceInfo,
      hwFeatures: {
        ...hwDeviceInfo.hwFeatures,
        deviceObj,
      },
    }
    Logger.debug('updating hwDeviceInfo', updatedInfo)
    // saved in redux state internally through notify()
    await walletManager.updateHWDeviceInfo(updatedInfo)
  }
