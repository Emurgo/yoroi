import {useNavigation} from '@react-navigation/native'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {useTheme} from '@yoroi/theme'
import {HW} from '@yoroi/types'
import React from 'react'
import {useIntl} from 'react-intl'
import {StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useModal} from '../../../../components/Modal/ModalContext'
import {StepperProgress} from '../../../../components/StepperProgress/StepperProgress'
import {showErrorDialog} from '../../../../kernel/dialogs'
import {errorMessages} from '../../../../kernel/i18n/global-messages'
import {LocalizableError} from '../../../../kernel/i18n/LocalizableError'
import {SetupWalletRouteNavigation} from '../../../../kernel/navigation'
import {LedgerConnect} from '../../../../legacy/HW'
import {getHWDeviceInfo} from '../../../../yoroi-wallets/cardano/hw/hw'
import {Device} from '../../../../yoroi-wallets/types/hw'
import {useWalletManager} from '../../../WalletManager/context/WalletManagerProvider'
import {useStrings} from '../../common/useStrings'
import {WalletDuplicatedModal} from '../../common/WalletDuplicatedModal/WalletDuplicatedModal'

type Props = {
  defaultDevices?: Array<Device> // for storybook
}

export const ConnectNanoXScreen = ({defaultDevices}: Props) => {
  const intl = useIntl()
  const strings = useStrings()
  const {styles} = useStyles()
  const {walletManager} = useWalletManager()
  const {openModal} = useModal()

  const navigation = useNavigation<SetupWalletRouteNavigation>()

  const {hwDeviceInfoChanged, walletImplementation, useUSB} = useSetupWallet()

  const onSuccess = (hwDeviceInfo: HW.DeviceInfo) => {
    hwDeviceInfoChanged(hwDeviceInfo)

    const duplicatedAccountWalletMeta = walletManager.findWalletMetadataByPublicKeyHex(hwDeviceInfo.bip44AccountPublic)

    if (duplicatedAccountWalletMeta) {
      const {plate, seed} = walletManager.checksum(hwDeviceInfo.bip44AccountPublic)

      openModal(
        strings.restoreDuplicatedWalletModalTitle,
        <WalletDuplicatedModal
          plate={plate}
          seed={seed}
          duplicatedAccountWalletMetaId={duplicatedAccountWalletMeta.id}
          duplicatedAccountWalletMetaName={duplicatedAccountWalletMeta.name}
        />,
      )
      return
    }

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
      ...atoms.flex_1,
      backgroundColor: color.bg_color_max,
    },
    stepper: {
      ...atoms.p_lg,
    },
    content: {
      ...atoms.flex_1,
      ...atoms.px_lg,
    },
  })
  return {styles} as const
}
