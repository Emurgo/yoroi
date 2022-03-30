import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {showErrorDialog} from '../../../legacy/actions'
import LedgerConnect from '../../../legacy/components/Ledger/LedgerConnect'
import {ProgressStep} from '../../../legacy/components/UiKit'
import type {DeviceId, DeviceObj} from '../../../legacy/crypto/shelley/ledgerUtils'
import {getHWDeviceInfo} from '../../../legacy/crypto/shelley/ledgerUtils'
import {errorMessages} from '../../../legacy/i18n/global-messages'
import LocalizableError from '../../../legacy/i18n/LocalizableError'
import {Logger} from '../../../legacy/utils/logging'
import {WalletInitRouteParams, WalletInitRoutes} from '../../navigation'
import {Device} from '../../types'

type Props = {
  defaultDevices?: Array<Device> // for storybook
}

export const ConnectNanoXScreen = ({defaultDevices}: Props) => {
  const intl = useIntl()
  const strings = useStrings()
  const navigation = useNavigation<WalletInitRouteParams>()
  const route = useRoute<RouteProp<WalletInitRoutes, 'connect-nano-x'>>()
  const {walletImplementationId, useUSB, networkId} = route.params

  const onSuccess = (hwDeviceInfo) =>
    navigation.navigate('save-nano-x', {
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
        onWaitingMessage={strings.exportKey}
        defaultDevices={defaultDevices}
        fillSpace
      />
    </SafeAreaView>
  )
}

const messages = defineMessages({
  exportKey: {
    id: 'components.walletinit.connectnanox.connectnanoxscreen.exportKey',
    defaultMessage: '!!!Action needed: Please, export public key from your Ledger device.',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    exportKey: intl.formatMessage(messages.exportKey),
  }
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: '#fff',
  },
})
