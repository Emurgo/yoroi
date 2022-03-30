import {useNavigation, useRoute} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {showErrorDialog} from '../../../legacy/actions'
import type {DeviceId, DeviceObj} from '../../../legacy/crypto/shelley/ledgerUtils'
import {getHWDeviceInfo} from '../../../legacy/crypto/shelley/ledgerUtils'
import {errorMessages} from '../../../legacy/i18n/global-messages'
import LocalizableError from '../../../legacy/i18n/LocalizableError'
import {WALLET_INIT_ROUTES} from '../../../legacy/RoutesList'
import {Logger} from '../../../legacy/utils/logging'
import {ProgressStep} from '../../components'
import {LedgerConnect} from '../../HW'
import {Device} from '../../types'
import {NetworkId, WalletImplementationId} from '../../yoroi-wallets'

export type Params = {
  useUSB?: boolean
  walletImplementationId: WalletImplementationId
  networkId: NetworkId
}

type Props = {
  defaultDevices?: Array<Device> // for storybook
}

export const ConnectNanoXScreen = ({defaultDevices}: Props) => {
  const intl = useIntl()
  const strings = useStrings()
  const navigation = useNavigation()
  const route = useRoute()
  const {walletImplementationId, useUSB, networkId} = route.params as Params

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
