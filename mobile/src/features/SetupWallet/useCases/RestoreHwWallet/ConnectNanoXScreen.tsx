import {useSetupWallet} from '@yoroi/setup-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'
import {HW} from '@yoroi/types'

import {useFocusEffect, useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {useIntl} from 'react-intl'
import {View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {
  WalletDuplicatedModal,
  WalletDuplicatedModalActions,
} from '~/features/SetupWallet/common/WalletDuplicatedModal/WalletDuplicatedModal'
import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {showErrorDialog} from '~/kernel/dialogs'
import {LocalizableError} from '~/kernel/i18n/LocalizableError'
import {errorMessages} from '~/kernel/i18n/messages/global'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {SetupWalletRouteNavigation} from '~/kernel/navigation/types'
import {LedgerConnect} from '~/ui/LedgerConnect/LedgerConnect'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {StepperProgress} from '~/ui/StepperProgress/StepperProgress'
import {getHWDeviceInfo} from '~/wallets/cardano/hw/hw'
import {Device} from '~/wallets/types/hw'

type Props = {
  defaultDevices: Device[]
}

export const ConnectNanoXScreen = ({defaultDevices}: Props) => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const {walletManager} = useWalletManager()
  const {openModal} = useModal()
  const {track} = useMetrics()

  const navigation = useNavigation<SetupWalletRouteNavigation>()

  const {hwDeviceInfoChanged, walletImplementation, useUSB} = useSetupWallet()
  const intl = useIntl()

  useFocusEffect(
    React.useCallback(() => {
      track.connectWalletConnectPageViewed()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  )

  const onSuccess = (hwDeviceInfo: HW.DeviceInfo) => {
    hwDeviceInfoChanged(hwDeviceInfo)

    const duplicatedAccountWalletMeta =
      walletManager.findWalletMetadataByPublicKeyHex(
        hwDeviceInfo.bip44AccountPublic,
      )

    if (duplicatedAccountWalletMeta) {
      const {plate, seed} = walletManager.checksum(
        hwDeviceInfo.bip44AccountPublic,
      )

      openModal({
        title: strings.setupWallet.restoreDuplicatedWalletModalTitle,
        content: (
          <WalletDuplicatedModal
            plate={plate}
            seed={seed}
            duplicatedAccountWalletMetaName={duplicatedAccountWalletMeta.name}
          />
        ),
        footer: (
          <WalletDuplicatedModalActions
            duplicatedAccountWalletMetaId={duplicatedAccountWalletMeta.id}
          />
        ),
      })
      return
    }

    navigation.navigate('setup-wallet-save-nano-x')
  }

  const onError = (error: Error) => {
    if (error instanceof LocalizableError) {
      showErrorDialog(errorMessages.generalLocalizableError, undefined, {
        message: intl.formatMessage(error.descriptor),
      })
    } else {
      showErrorDialog(errorMessages.hwConnectionError, undefined, {
        message: String(error.message),
      })
    }
  }

  const onConnectBLE = (deviceId: string) => {
    return getHWDeviceInfo(walletImplementation, deviceId, null, useUSB)
      .then(onSuccess)
      .catch(onError)
  }

  const onConnectUSB = (deviceObj: HW.DeviceObj) => {
    return getHWDeviceInfo(walletImplementation, null, deviceObj, useUSB)
      .then(onSuccess)
      .catch(onError)
  }

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[a.flex_1, ta.bg_color_max]}
    >
      <StepperProgress
        style={[a.p_lg]}
        currentStepTitle="Connect"
        currentStep={2}
        totalSteps={3}
      />

      <View style={[a.flex_1, a.px_lg]}>
        <LedgerConnect
          onConnectBLE={onConnectBLE}
          onConnectUSB={onConnectUSB}
          useUSB={useUSB}
          onWaitingMessage={strings.setupWallet.hwExportKey}
          defaultDevices={defaultDevices}
        />
      </View>
    </SafeAreaView>
  )
}
