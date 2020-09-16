// @flow
import React from 'react'
import {SafeAreaView} from 'react-native'
import {injectIntl, defineMessages, intlShape} from 'react-intl'
import {compose} from 'redux'
import {withHandlers} from 'recompose'

import LedgerConnect from '../../Ledger/LedgerConnect'
import {getHWDeviceInfo} from '../../../crypto/shelley/ledgerUtils'
import {ProgressStep} from '../../UiKit'
import {withNavigationTitle} from '../../../utils/renderUtils'
import {WALLET_INIT_ROUTES} from '../../../RoutesList'
import {Logger} from '../../../utils/logging'
import {errorMessages} from '../../../i18n/global-messages'
import {showErrorDialog} from '../../../actions'
import LocalizableError from '../../../i18n/LocalizableError'

import styles from './styles/ConnectNanoXScreen.style'

import type {ComponentType} from 'react'
import type {Device} from '@ledgerhq/react-native-hw-transport-ble'
import type {Navigation} from '../../../types/navigation'
import type {DeviceId, DeviceObj} from '../../../crypto/shelley/ledgerUtils'

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
  intl: intlShape,
): Promise<void> => {
  try {
    Logger.debug('deviceId', deviceId)
    Logger.debug('deviceObj', deviceObj)
    const useUSB = navigation.getParam('useUSB') === true
    const networkId = navigation.getParam('networkId')
    const walletImplementationId = navigation.getParam('walletImplementationId')
    if (deviceId == null && deviceObj == null) {
      throw new Error('null descriptor, should never happen')
    }
    const hwDeviceInfo = await getHWDeviceInfo(
      walletImplementationId,
      deviceId,
      deviceObj,
      useUSB,
    )
    navigation.navigate(WALLET_INIT_ROUTES.SAVE_NANO_X, {
      hwDeviceInfo,
      networkId,
      walletImplementationId,
    })
  } catch (e) {
    if (e instanceof LocalizableError) {
      await showErrorDialog(errorMessages.hwConnectionError, intl, {
        message: intl.formatMessage({
          id: e.id,
          defaultMessage: e.defaultMessage,
        }),
      })
    } else {
      Logger.error(e)
      await showErrorDialog(errorMessages.hwConnectionError, intl, {
        message: String(e.message),
      })
    }
  }
}

type Props = {
  intl: intlShape,
  defaultDevices: ?Array<Device>, // for storybook
  navigation: Navigation,
  onConnectBLE: (DeviceId) => Promise<void>,
  onConnectUSB: (DeviceObj) => Promise<void>,
}

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
        fillSpace
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
      onConnectBLE: ({navigation, intl}) => async (deviceId: DeviceId) => {
        await _navigateToSave(deviceId, null, navigation, intl)
      },
      onConnectUSB: ({navigation, intl}) => async (deviceObj: DeviceObj) => {
        await _navigateToSave(null, deviceObj, navigation, intl)
      },
    }),
  )(ConnectNanoXScreen): ComponentType<ExternalProps>),
)
