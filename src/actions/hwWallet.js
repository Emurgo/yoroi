// @flow
import {hwDeviceInfoSelector} from '../selectors'
import {Logger} from '../utils/logging'

import type {Dispatch} from 'redux'
import type {
  HWDeviceInfo,
  DeviceId,
  DeviceObj,
} from '../crypto/shelley/ledgerUtils'
import type {State} from '../state'

const _saveHW = (hwDeviceInfo) => ({
  path: ['wallet', 'hwDeviceInfo'],
  payload: hwDeviceInfo,
  reducer: (state, value) => value,
  type: 'SAVE_HW',
})

export const saveHW = (hwDeviceInfo: HWDeviceInfo) => (
  dispatch: Dispatch<any>,
) => {
  dispatch(_saveHW(hwDeviceInfo))
}

export const setLedgerDeviceId = (deviceId: DeviceId) => (
  dispatch: Dispatch<any>,
  getState: () => State,
) => {
  Logger.debug('setting deviceId', deviceId)
  const state = getState()
  const hwDeviceInfo = hwDeviceInfoSelector(state)
  if (hwDeviceInfo == null || hwDeviceInfo.hwFeatures == null) {
    Logger.warn('hwDeviceInfo.hwFeatures is null')
    return
  }
  hwDeviceInfo.hwFeatures.deviceId = deviceId
  dispatch(_saveHW(hwDeviceInfo))
}

export const setLedgerDeviceObj = (deviceObj: DeviceObj) => (
  dispatch: Dispatch<any>,
  getState: () => State,
) => {
  Logger.debug('setting deviceObj', deviceObj)
  const state = getState()
  const hwDeviceInfo = hwDeviceInfoSelector(state)
  if (hwDeviceInfo == null || hwDeviceInfo.hwFeatures == null) {
    Logger.warn('hwDeviceInfo.hwFeatures is null')
    return
  }
  hwDeviceInfo.hwFeatures.deviceObj = deviceObj
  dispatch(_saveHW(hwDeviceInfo))
}
