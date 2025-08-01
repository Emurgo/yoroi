import {defineMessages} from 'react-intl'

export const ledgerMessages = defineMessages({
  connectUsb: {
    id: 'hw.connect.usb',
    defaultMessage: '!!!Connect via USB',
  },
  keepUsbConnected: {
    id: 'hw.connect.keepUsbConnected',
    defaultMessage: '!!!Keep USB connected',
  },
  enableLocation: {
    id: 'hw.connect.enableLocation',
    defaultMessage: '!!!Enable location services',
  },
  enableTransport: {
    id: 'hw.connect.enableTransport',
    defaultMessage: '!!!Enable transport',
  },
  enterPin: {
    id: 'hw.connect.enterPin',
    defaultMessage: '!!!Enter PIN on device',
  },
  openApp: {
    id: 'hw.connect.openApp',
    defaultMessage: '!!!Open Cardano app on device',
  },
  rejectedByUserError: {
    id: 'hw.error.rejectedByUser',
    defaultMessage: '!!!Operation rejected by user',
  },
  continueOnLedger: {
    id: 'hw.connect.continueOnLedger',
    defaultMessage: '!!!Continue on Ledger',
  },
  bluetoothDisabledError: {
    id: 'hw.error.bluetoothDisabled',
    defaultMessage: '!!!Bluetooth is disabled',
  },
  connectionError: {
    id: 'hw.error.connection',
    defaultMessage: '!!!Connection error',
  },
  appOpened: {
    id: 'hw.connect.appOpened',
    defaultMessage: '!!!App opened on device',
  },
}) 