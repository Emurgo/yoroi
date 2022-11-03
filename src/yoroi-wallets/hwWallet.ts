import {DeviceId, DeviceObj} from '../legacy/ledgerUtils'
import {YoroiWallet} from './cardano'

export const withUSB = (wallet: YoroiWallet, deviceObj: DeviceObj) => {
  if (!wallet.hwDeviceInfo) throw new Error('invalid wallet')
  return {
    ...wallet.hwDeviceInfo,
    hwFeatures: {
      ...wallet.hwDeviceInfo.hwFeatures,
      deviceObj,
    },
  }
}

export const withBLE = (wallet: YoroiWallet, deviceId: DeviceId) => {
  if (!wallet.hwDeviceInfo) throw new Error('invalid wallet')
  return {
    ...wallet.hwDeviceInfo,
    hwFeatures: {
      ...wallet.hwDeviceInfo.hwFeatures,
      deviceId,
    },
  }
}
