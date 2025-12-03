import {
  HARDWARE_WALLETS,
  useLedgerPermissions,
} from '@yoroi/cardano-wallet/hw/hw'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'

import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {Alert, Platform, Text} from 'react-native'
import DeviceInfo from 'react-native-device-info'

import {useStrings} from '~/kernel/i18n/useStrings'
import {SetupWalletRouteNavigation} from '~/kernel/navigation/types'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'

const useIsAndroidUsbSupported = () => {
  const [isAndroidUsbSupported, setIsAndroidUsbSupported] =
    React.useState(false)
  React.useEffect(() => {
    DeviceInfo.getApiLevel().then((sdk) =>
      setIsAndroidUsbSupported(
        Platform.OS === 'android' &&
          sdk >= HARDWARE_WALLETS.LEDGER_NANO.USB_MIN_SDK,
      ),
    )
  }, [])

  return isAndroidUsbSupported
}

const SelectHwConnectionModalContent = () => {
  const {atoms: ta} = useTheme()
  const strings = useStrings()

  return (
    <Modal.Content>
      <Text style={[a.body_1_lg_regular, ta.text_gray_medium]}>
        {strings.setupWallet.hwModalText}
      </Text>
    </Modal.Content>
  )
}

const SelectHwConnectionModalFooter = () => {
  return (
    <Modal.Footer>
      <SelectBluetoothSection />
      <SelectUsbSection />
    </Modal.Footer>
  )
}

export const SelectHwConnectionModal = {
  Content: SelectHwConnectionModalContent,
  Footer: SelectHwConnectionModalFooter,
}

const SelectBluetoothSection = () => {
  const strings = useStrings()
  const {
    useUSBChanged: USBChanged,
    walletImplementationChanged,
    setupTypeChanged,
  } = useSetupWallet()
  const navigation = useNavigation<SetupWalletRouteNavigation>()
  const {closeModal} = useModal()

  const handleOnSuccess = () => {
    USBChanged(false)
    walletImplementationChanged('cardano-cip1852')
    setupTypeChanged('hw')

    navigation.navigate('setup-wallet-check-nano-x')
    closeModal()
  }

  const {request} = useLedgerPermissions({
    onError: () =>
      Alert.alert(strings.global.error, strings.setupWallet.bluetoothError),
    onSuccess: () => {
      handleOnSuccess()
    },
  })

  return (
    <Button
      type={ButtonType.Secondary}
      title={strings.setupWallet.hwModalBtButton}
      icon={Icon.Bluetooth}
      onPress={() => request()}
    />
  )
}

const SelectUsbSection = () => {
  const strings = useStrings()
  const isAndroidUsbSupported = useIsAndroidUsbSupported()
  const {
    useUSBChanged: USBChanged,
    walletImplementationChanged,
    setupTypeChanged,
  } = useSetupWallet()
  const navigation = useNavigation<SetupWalletRouteNavigation>()
  const {closeModal} = useModal()

  const handleOnPress = () => {
    USBChanged(true)
    walletImplementationChanged('cardano-cip1852')
    setupTypeChanged('hw')

    navigation.navigate('setup-wallet-check-nano-x')
    closeModal()
  }

  if (!isAndroidUsbSupported) {
    return null
  }

  return (
    <Button
      type={ButtonType.Secondary}
      title={strings.setupWallet.hwModalUsbButton}
      icon={Icon.Usb}
      onPress={handleOnPress}
    />
  )
}
