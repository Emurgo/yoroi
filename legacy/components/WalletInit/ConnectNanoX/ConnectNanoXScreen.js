// @flow

import {useNavigation, useRoute} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {showErrorDialog} from '../../../actions'
import type {WalletImplementationId} from '../../../config/types'
import type {DeviceId, DeviceObj} from '../../../crypto/shelley/ledgerUtils'
import {getHWDeviceInfo} from '../../../crypto/shelley/ledgerUtils'
import {errorMessages} from '../../../i18n/global-messages'
import LocalizableError from '../../../i18n/LocalizableError'
import {WALLET_INIT_ROUTES} from '../../../RoutesList'
import {Logger} from '../../../utils/logging'
import LedgerConnect from '../../Ledger/LedgerConnect'
import type {Device} from '../../Ledger/types'
import {ProgressStep} from '../../UiKit'

const messages = defineMessages({
  exportKey: {
    id: 'components.walletinit.connectnanox.connectnanoxscreen.exportKey',
    defaultMessage: '!!!Action needed: Please, export public key from your Ledger device.',
  },
})

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: '#fff',
  },
})

type Props = {
  defaultDevices: ?Array<Device>, // for storybook
}

const ConnectNanoXScreen = ({defaultDevices}: Props) => {
  const intl = useIntl()
  const navigation = useNavigation()
  const route = useRoute()
  const walletImplementationId: WalletImplementationId = (route.params?.walletImplementationId: any)
  const useUSB = route.params?.useUSB === true
  const networkId = route.params?.networkId

  const onSuccess = (hwDeviceInfo) =>
    navigation.navigate(WALLET_INIT_ROUTES.SAVE_NANO_X, {
      hwDeviceInfo,
      networkId,
      walletImplementationId,
    })

  const onError = (error) => {
    if (error instanceof LocalizableError) {
      showErrorDialog(errorMessages.generalLocalizableError, intl, {
        message: intl.formatMessage({id: error.id, defaultMessage: error.defaultMessage}, error.values),
      })
    } else {
      showErrorDialog(errorMessages.hwConnectionError, intl, {message: String(error.message)})
    }
  }

  const onConnectBLE = (deviceId: DeviceId) => {
    Logger.debug('deviceId', deviceId)
    getHWDeviceInfo(walletImplementationId, deviceId, null, useUSB).then(onSuccess).catch(onError)
  }

  const onConnectUSB = (deviceObj: DeviceObj) => {
    Logger.debug('deviceObj', deviceObj)
    getHWDeviceInfo(walletImplementationId, null, deviceObj, useUSB).then(onSuccess).catch(onError)
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <ProgressStep currentStep={2} totalSteps={3} displayStepNumber />
      <LedgerConnect
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

export default ConnectNanoXScreen
