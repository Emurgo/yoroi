import {App, HW, Wallet} from '@yoroi/types'

import {logger} from '../../kernel/logger/logger'

export const withUSB = (meta: Wallet.Meta, deviceObj: HW.DeviceObj) => {
  if (!meta.hwDeviceInfo) {
    logger.error(`HW device info not found in meta, reached invalid state`, {id: meta.name})
    throw new App.Errors.InvalidState('HW device info not found')
  }

  return {
    ...meta.hwDeviceInfo,
    hwFeatures: {
      ...meta.hwDeviceInfo.hwFeatures,
      deviceObj,
    },
  }
}

export const withBLE = (meta: Wallet.Meta, deviceId: string) => {
  if (!meta.hwDeviceInfo) {
    logger.error(`HW device info not found in meta, reached invalid state`, {id: meta.name})
    throw new App.Errors.InvalidState('HW device info not found')
  }

  return {
    ...meta.hwDeviceInfo,
    hwFeatures: {
      ...meta.hwDeviceInfo.hwFeatures,
      deviceId,
    },
  }
}
