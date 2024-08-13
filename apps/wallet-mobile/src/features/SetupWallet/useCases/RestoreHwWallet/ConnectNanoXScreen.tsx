import {useNavigation} from '@react-navigation/native'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {useTheme} from '@yoroi/theme'
import {HW, Wallet} from '@yoroi/types'
import React from 'react'
import {useIntl} from 'react-intl'
import {StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {StepperProgress} from '../../../../components/StepperProgress/StepperProgress'
import {showErrorDialog} from '../../../../kernel/dialogs'
import {errorMessages} from '../../../../kernel/i18n/global-messages'
import LocalizableError from '../../../../kernel/i18n/LocalizableError'
import {SetupWalletRouteNavigation} from '../../../../kernel/navigation'
import {LedgerConnect} from '../../../../legacy/HW'
import {getHWDeviceInfo} from '../../../../yoroi-wallets/cardano/hw'
import {Device, NetworkId} from '../../../../yoroi-wallets/types'
import {useStrings} from '../../common/useStrings'

export type Params = {
  useUSB?: boolean
  walletImplementationId: Wallet.Implementation
  networkId: NetworkId
}

type Props = {
  defaultDevices?: Array<Device> // for storybook
}

export const ConnectNanoXScreen = ({defaultDevices}: Props) => {
  const intl = useIntl()
  const strings = useStrings()
  const styles = useStyles()
  const navigation = useNavigation<SetupWalletRouteNavigation>()

  const {hwDeviceInfoChanged, walletImplementation, useUSB} = useSetupWallet()

  const onSuccess = (hwDeviceInfo: HW.DeviceInfo) => {
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

  const onConnectBLE = (deviceId: string) => {
    return getHWDeviceInfo(walletImplementation, deviceId, null, useUSB).then(onSuccess).catch(onError)
  }

  const onConnectUSB = (deviceObj: HW.DeviceObj) => {
    return getHWDeviceInfo(walletImplementation, null, deviceObj, useUSB).then(onSuccess).catch(onError)
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <StepperProgress style={styles.stepper} currentStepTitle="Connect" currentStep={2} totalSteps={3} />

      <View style={styles.content}>
        <LedgerConnect
          onConnectBLE={onConnectBLE}
          onConnectUSB={onConnectUSB}
          useUSB={useUSB}
          onWaitingMessage={strings.hwExportKey}
          defaultDevices={defaultDevices}
        />
      </View>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    safeAreaView: {
      flex: 1,
      backgroundColor: color.bg_color_high,
    },
    stepper: {
      ...atoms.p_lg,
    },
    content: {
      flex: 1,
      ...atoms.px_lg,
    },
  })
  return styles
}
