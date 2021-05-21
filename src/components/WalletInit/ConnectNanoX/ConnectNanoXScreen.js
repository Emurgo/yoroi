// @flow
import React from 'react'
import {SafeAreaView} from 'react-native'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'
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
  route: Object,
  intl: IntlShape,
): Promise<void> => {
  try {
    Logger.debug('deviceId', deviceId)
    Logger.debug('deviceObj', deviceObj)
    const useUSB = route.params?.useUSB === true
    const networkId = route.params?.networkId
    const walletImplementationId = route.params?.walletImplementationId
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
      await showErrorDialog(errorMessages.generalLocalizableError, intl, {
        message: intl.formatMessage(
          {
            id: e.id,
            defaultMessage: e.defaultMessage,
          },
          e.values,
        ),
      })
    } else {
      Logger.info(e)
      await showErrorDialog(errorMessages.hwConnectionError, intl, {
        message: String(e.message),
      })
    }
  }
}

type Props = {
  intl: IntlShape,
  defaultDevices: ?Array<Device>, // for storybook
  navigation: Navigation,
  route: Object, // TODO(navigation): type
  onConnectBLE: (DeviceId) => Promise<void>,
  onConnectUSB: (DeviceObj) => Promise<void>,
}

const ConnectNanoXScreen = ({
  intl,
  defaultDevices,
  navigation,
  route,
  onConnectBLE,
  onConnectUSB,
}: Props) => {
  const useUSB = route.params?.useUSB === true

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
  intl: IntlShape,
  defaultDevices: ?Array<Device>,
  navigation: Navigation,
  route: Object, // TODO(navigation): type
|}

export default injectIntl(
  (compose(
    withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
    withHandlers({
      onConnectBLE: ({navigation, route, intl}) => async (
        deviceId: DeviceId,
      ) => {
        await _navigateToSave(deviceId, null, navigation, route, intl)
      },
      onConnectUSB: ({navigation, route, intl}) => async (
        deviceObj: DeviceObj,
      ) => {
        await _navigateToSave(null, deviceObj, navigation, route, intl)
      },
    }),
  )(ConnectNanoXScreen): ComponentType<ExternalProps>),
)
