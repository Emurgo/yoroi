import {defineMessages} from 'react-intl'

export const ledgerMessages = defineMessages({
  // prerequisites
  bluetoothEnabled: {
    id: 'global.ledgerMessages.bluetoothEnabled',
    defaultMessage: '!!!Bluetooth is enabled on your smartphone.',
  },
  locationEnabled: {
    id: 'global.ledgerMessages.locationEnabled',
    defaultMessage:
      '!!!Location is enabled on your device.' +
      'Android requires location to be enabled to provide access to Bluetooth,' +
      ' but EMURGO will never store any location data.',
  },
  haveOTGAdapter: {
    id: 'global.ledgerMessages.haveOTGAdapter',
    defaultMessage:
      '!!!You have an on-the-go adapter allowing you to connect your Ledger' +
      'device with your smartphone using a USB cable.',
  },
  usbAlwaysConnected: {
    id: 'global.ledgerMessages.usbAlwaysConnected',
    defaultMessage:
      '!!!Your Ledger device remains connected through USB until the process' +
      'is completed.',
  },
  appInstalled: {
    id: 'global.ledgerMessages.appInstalled',
    defaultMessage: '!!!Cardano ADA app is installed on your Ledger device.',
  },
  appOpened: {
    id: 'global.ledgerMessages.appOpened',
    defaultMessage:
      '!!!Cardano ADA app must remain open on your Ledger device.',
  },
  // connection requisites
  enableTransport: {
    id: 'global.ledgerMessages.enableTransport',
    defaultMessage: '!!!Enable bluetooth.',
  },
  enableLocation: {
    id: 'global.ledgerMessages.enableLocation',
    defaultMessage: '!!!Enable location services.',
  },
  connectUsb: {
    id: 'global.ledgerMessages.connectUsb',
    defaultMessage:
      "!!!Connect your Ledger device through your smartphone's" +
      'USB port using your OTG adapter.',
  },
  keepUsbConnected: {
    id: 'global.ledgerMessages.keepUsbConnected',
    defaultMessage:
      '!!!Make sure your device remains connected until the ' +
      'operation is completed.',
  },
  enterPin: {
    id: 'global.ledgerMessages.enterPin',
    defaultMessage: '!!!Power on your ledger device and enter your PIN.',
  },
  openApp: {
    id: 'global.ledgerMessages.openApp',
    defaultMessage: '!!!Open Cardano ADA app on the Ledger device.',
  },
  followSteps: {
    id: 'global.ledgerMessages.followSteps',
    defaultMessage: '!!!Please, follow the steps shown in your Ledger device',
  },
  // common errors
  bluetoothDisabledError: {
    id: 'global.ledgerMessages.bluetoothDisabledError',
    defaultMessage: '!!!Bluetooth is disabled in your smartphone',
  },
  connectionError: {
    id: 'global.ledgerMessages.connectionError',
    defaultMessage:
      '!!!An error occurred while trying to connect with your ' +
      'hardware wallet. Please, make sure you are following the steps' +
      'correctly. Restarting your hardware wallet may also fix the problem.',
  },
  deprecatedAdaAppError: {
    id: 'global.ledgerMessages.deprecatedAdaAppError',
    defaultMessage:
      '!!!The Cardano ADA app installed in your Ledger device' +
      'is not up-to-date. Required version: {version}',
  },
  rejectedByUserError: {
    id: 'global.ledgerMessages.rejectedByUserError',
    defaultMessage: '!!!Operation rejected by user.',
  },
  noDeviceInfoError: {
    id: 'global.ledgerMessages.noDeviceInfoError',
    defaultMessage:
      '!!!Device metadata was lost or corrupted. To fix this issue' +
      ', please add a new wallet and connect it with your device.',
  },
  continueOnLedger: {
    id: 'global.ledgerMessages.continueOnLedger',
    defaultMessage: '!!!Continue on Ledger',
  },
})
