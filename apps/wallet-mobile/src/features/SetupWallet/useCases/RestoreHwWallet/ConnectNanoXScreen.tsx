import {WalletChecksum, walletChecksum} from '@emurgo/cip4-js'
import {useNavigation} from '@react-navigation/native'
import {Blockies} from '@yoroi/identicon'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {useTheme} from '@yoroi/theme'
import {HW, Wallet} from '@yoroi/types'
import React from 'react'
import {useIntl} from 'react-intl'
import {StyleSheet, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Icon, useModal} from '../../../../components'
import {Space} from '../../../../components/Space/Space'
import {StepperProgress} from '../../../../components/StepperProgress/StepperProgress'
import {showErrorDialog} from '../../../../kernel/dialogs'
import {errorMessages} from '../../../../kernel/i18n/global-messages'
import LocalizableError from '../../../../kernel/i18n/LocalizableError'
import {SetupWalletRouteNavigation, useWalletNavigation} from '../../../../kernel/navigation'
import {LedgerConnect} from '../../../../legacy/HW'
import {getHWDeviceInfo} from '../../../../yoroi-wallets/cardano/hw'
import {Device, NetworkId} from '../../../../yoroi-wallets/types'
import {useWalletManager} from '../../../WalletManager/context/WalletManagerProvider'
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
  const {styles} = useStyles()
  const {walletManager} = useWalletManager()
  const {openModal} = useModal()
  const {resetToTxHistory} = useWalletNavigation()
  const navigation = useNavigation<SetupWalletRouteNavigation>()

  const {hwDeviceInfoChanged, walletImplementation, useUSB} = useSetupWallet()

  const onSuccess = (hwDeviceInfo: HW.DeviceInfo) => {
    hwDeviceInfoChanged(hwDeviceInfo)
    const plate = walletChecksum(hwDeviceInfo.bip44AccountPublic)

    const duplicatedWalletMeta = Array.from(walletManager.walletMetas.values()).find(
      (walletMeta) => walletMeta.plate === plate.TextPart,
    )

    if (duplicatedWalletMeta) {
      openModal(
        strings.restoreDuplicatedWalletModalTitle,
        <Modal
          walletName={duplicatedWalletMeta.name}
          plate={plate}
          onPress={() => handleOpenWalletWithDuplicatedName(duplicatedWalletMeta)}
        />,
      )

      return
    }
    navigation.navigate('setup-wallet-save-nano-x')
  }

  const handleOpenWalletWithDuplicatedName = React.useCallback(
    (walletMeta: Wallet.Meta) => {
      walletManager.setSelectedWalletId(walletMeta.id)
      resetToTxHistory()
    },
    [walletManager, resetToTxHistory],
  )

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

const Modal = ({onPress, plate, walletName}: {onPress: () => void; plate: WalletChecksum; walletName: string}) => {
  const {styles} = useStyles()
  const strings = useStrings()

  return (
    <View style={styles.modal}>
      <Text style={styles.modalText}>{strings.restoreDuplicatedWalletModalText}</Text>

      <Space height="lg" />

      <View style={styles.checksum}>
        <Icon.WalletAvatar
          image={new Blockies({seed: plate.ImagePart}).asBase64()}
          style={styles.walletChecksum}
          size={38}
        />

        <Space width="sm" />

        <View>
          <Text style={styles.plateName}>{walletName}</Text>

          <Text style={styles.plateText}>{plate.TextPart}</Text>
        </View>
      </View>

      <Space fill />

      <Button title={strings.restoreDuplicatedWalletModalButton} style={styles.button} onPress={onPress} />

      <Space height="xl" />
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    safeAreaView: {
      flex: 1,
      backgroundColor: color.bg_color_max,
    },
    stepper: {
      ...atoms.p_lg,
    },
    content: {
      flex: 1,
      ...atoms.px_lg,
    },
    plateName: {
      ...atoms.body_2_md_medium,
      color: color.gray_900,
    },
    modal: {
      flex: 1,
      ...atoms.px_lg,
    },
    walletChecksum: {
      width: 38,
      height: 38,
      borderRadius: 8,
    },
    checksum: {
      ...atoms.flex_row,
      ...atoms.align_center,
      textAlignVertical: 'center',
    },
    plateText: {
      ...atoms.body_3_sm_regular,
      ...atoms.text_center,
      ...atoms.justify_center,
      color: color.gray_600,
    },
    button: {
      backgroundColor: color.primary_500,
    },
    modalText: {
      ...atoms.body_1_lg_regular,
      color: color.gray_900,
    },
  })
  return {styles} as const
}
