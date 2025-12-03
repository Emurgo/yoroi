import {getHWDeviceInfo} from '@yoroi/cardano-wallet'
import {Device} from '@yoroi/cardano-wallet'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {atoms as a} from '@yoroi/theme'
import {HW} from '@yoroi/types'
import {useWalletManager} from '@yoroi/wallet-manager/context/WalletManagerProvider'

import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {useIntl} from 'react-intl'
import {View} from 'react-native'

import {WalletDuplicatedModal} from '~/features/SetupWallet/common/WalletDuplicatedModal/WalletDuplicatedModal'
import {showErrorDialog} from '~/kernel/dialogs'
import {LocalizableError} from '~/kernel/i18n/LocalizableError'
import {errorMessages} from '~/kernel/i18n/messages/global'
import {useStrings} from '~/kernel/i18n/useStrings'
import {SetupWalletRouteNavigation} from '~/kernel/navigation/types'
import {LedgerConnect} from '~/ui/LedgerConnect/LedgerConnect'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {StepperProgress} from '~/ui/StepperProgress/StepperProgress'

type Props = {
  defaultDevices: Device[]
}

export const ConnectNanoXScreen = ({defaultDevices}: Props) => {
  const strings = useStrings()
  const {walletManager} = useWalletManager()
  const {openModal} = useModal()
  const navigation = useNavigation<SetupWalletRouteNavigation>()

  const {hwDeviceInfoChanged, walletImplementation, useUSB} = useSetupWallet()
  const intl = useIntl()

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
          <Modal.Content>
            <WalletDuplicatedModal.Content
              plate={plate}
              seed={seed}
              duplicatedAccountWalletMetaName={duplicatedAccountWalletMeta.name}
            />
          </Modal.Content>
        ),
        footer: (
          <Modal.Footer>
            <WalletDuplicatedModal.Footer
              duplicatedAccountWalletMetaId={duplicatedAccountWalletMeta.id}
            />
          </Modal.Footer>
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

  const handleOnConnectBLE = (deviceId: string) =>
    getHWDeviceInfo(walletImplementation, deviceId, null, useUSB)
      .then(onSuccess)
      .catch(onError)

  const handleOnConnectUSB = (deviceObj: HW.DeviceObj) =>
    getHWDeviceInfo(walletImplementation, null, deviceObj, useUSB)
      .then(onSuccess)
      .catch(onError)

  return (
    <SafeArea>
      <StepperProgress
        style={[a.p_lg]}
        currentStepTitle={strings.setupWallet.connectNanoXTitle}
        currentStep={2}
        totalSteps={3}
      />

      <View style={[a.flex_1, a.px_lg]}>
        <LedgerConnect
          onConnectBLE={handleOnConnectBLE}
          onConnectUSB={handleOnConnectUSB}
          useUSB={useUSB}
          onWaitingMessage={strings.setupWallet.hwExportKey}
          defaultDevices={defaultDevices}
        />
      </View>
    </SafeArea>
  )
}
