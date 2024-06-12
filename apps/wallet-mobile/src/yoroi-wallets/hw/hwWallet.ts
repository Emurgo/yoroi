import {HW} from '@yoroi/types'

import {YoroiWallet} from '../cardano/types'

export const withUSB = (wallet: YoroiWallet, deviceObj: HW.DeviceObj) => {
  if (!wallet.hwDeviceInfo) throw new Error('invalid wallet')
  return {
    ...wallet.hwDeviceInfo,
    hwFeatures: {
      ...wallet.hwDeviceInfo.hwFeatures,
      deviceObj,
    },
  }
}

export const withBLE = (wallet: YoroiWallet, deviceId: string) => {
  if (!wallet.hwDeviceInfo) throw new Error('invalid wallet')
  return {
    ...wallet.hwDeviceInfo,
    hwFeatures: {
      ...wallet.hwDeviceInfo.hwFeatures,
      deviceId,
    },
  }
}
