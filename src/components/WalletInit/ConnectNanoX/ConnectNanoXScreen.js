// @flow
import React from 'react'
import {SafeAreaView} from 'react-native'
import {injectIntl, defineMessages, intlShape} from 'react-intl'
import {compose} from 'redux'
import {withHandlers} from 'recompose'

import LedgerConnect from '../../Ledger/LedgerConnect'
import {getHWDeviceInfo} from '../../../crypto/byron/ledgerUtils'
import {ProgressStep} from '../../UiKit'
import {withNavigationTitle} from '../../../utils/renderUtils'
import {WALLET_INIT_ROUTES} from '../../../RoutesList'
import {Logger} from '../../../utils/logging'

import styles from './styles/ConnectNanoXScreen.style'

import type {ComponentType} from 'react'
import type {Device} from '@ledgerhq/react-native-hw-transport-ble'
import type {Navigation} from '../../../types/navigation'
import type {DeviceId, DeviceObj} from '../../../crypto/byron/ledgerUtils'

const messages = defineMessages({
  title: {
    id: 'components.walletinit.connectnanox.connectnanoxscreen.title',
    defaultMessage: '!!!Connect to Ledger Device',
  },
  exportKey: {
    id: 'components.walletinit.connectnanox.connectnanoxscreen.exportKey',
    defaultMessage:
      '!!!Action needed: Please, export public key from your Ledger device.',
  },
})

const _navigateToSave = async (
  deviceId: ?DeviceId,
  deviceObj: ?DeviceObj,
  navigation: Navigation,
): Promise<void> => {
  Logger.debug('deviceId', deviceId)
  Logger.debug('deviceObj', deviceObj)
  const useUSB = navigation.getParam('useUSB') === true
  if (deviceId == null && deviceObj == null) {
    throw new Error('null descriptor, should never happen')
  }
  const hwDeviceInfo = await getHWDeviceInfo(deviceId, deviceObj, useUSB)
  navigation.navigate(WALLET_INIT_ROUTES.SAVE_NANO_X, {hwDeviceInfo})
}

type Props = {|
  intl: intlShape,
  defaultDevices: ?Array<Device>, // for storybook
  navigation: Navigation,
  onConnectBLE: (DeviceId) => Promise<void>,
  onConnectUSB: (DeviceObj) => Promise<void>,
|}

const ConnectNanoXScreen = ({
  intl,
  defaultDevices,
  navigation,
  onConnectBLE,
  onConnectUSB,
}: Props) => {
  const useUSB = navigation.getParam('useUSB') === true

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <ProgressStep currentStep={2} totalSteps={3} displayStepNumber />
      <LedgerConnect
        navigation={navigation}
        onConnectBLE={onConnectBLE}
        onConnectUSB={onConnectUSB}
        useUSB={useUSB}
        onWaitingMessage={intl.formatMessage(messages.exportKey)}
        defaultDevices={defaultDevices}
      />
    </SafeAreaView>
  )
}

type ExternalProps = {|
  intl: intlShape,
  defaultDevices: ?Array<Device>,
  navigation: Navigation,
|}

export default injectIntl(
  (compose(
    withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
    withHandlers({
      onConnectBLE: ({navigation}) => async (deviceId: DeviceId) => {
        await _navigateToSave(deviceId, null, navigation)
      },
      onConnectUSB: ({navigation}) => async (deviceObj: DeviceObj) => {
        await _navigateToSave(null, deviceObj, navigation)
      },
    }),
  )(ConnectNanoXScreen): ComponentType<ExternalProps>),
)
