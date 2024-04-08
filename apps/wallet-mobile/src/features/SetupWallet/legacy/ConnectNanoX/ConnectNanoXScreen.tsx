import {useNavigation} from '@react-navigation/native'
import {useWalletSetup} from '@yoroi/setup-wallet'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {ProgressStep} from '../../../../components'
import {showErrorDialog} from '../../../../dialogs'
import {LedgerConnect} from '../../../../HW'
import {errorMessages} from '../../../../i18n/global-messages'
import LocalizableError from '../../../../i18n/LocalizableError'
import {WalletInitRouteNavigation} from '../../../../navigation'
import {getHWDeviceInfo} from '../../../../yoroi-wallets/cardano/hw'
import {DeviceId, DeviceObj, HWDeviceInfo} from '../../../../yoroi-wallets/hw'
import {Device, NetworkId, WalletImplementationId} from '../../../../yoroi-wallets/types'

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
  const navigation = useNavigation<WalletInitRouteNavigation>()

  const {hwDeviceInfoChanged, walletImplementationId, useUSB} = useWalletSetup()

  const onSuccess = (hwDeviceInfo: HWDeviceInfo) => {
    hwDeviceInfoChanged(hwDeviceInfo)
    navigation.navigate('setup-wallet-save-nano-x')
  }

  const onError = (error: Error) => {
    if (error instanceof LocalizableError) {
      showErrorDialog(errorMessages.generalLocalizableError, intl, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        message: intl.formatMessage({id: error.id, defaultMessage: error.defaultMessage}, error.values as any),
      })
    } else {
      showErrorDialog(errorMessages.hwConnectionError, intl, {message: String(error.message)})
    }
  }

  const onConnectBLE = (deviceId: DeviceId) => {
    return getHWDeviceInfo(walletImplementationId as WalletImplementationId, deviceId, null, useUSB)
      .then(onSuccess)
      .catch(onError)
  }

  const onConnectUSB = (deviceObj: DeviceObj) => {
    return getHWDeviceInfo(walletImplementationId as WalletImplementationId, null, deviceObj, useUSB)
      .then(onSuccess)
      .catch(onError)
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
