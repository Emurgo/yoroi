import {useNavigation} from '@react-navigation/native'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Alert, Platform, Text, View} from 'react-native'
import DeviceInfo from 'react-native-device-info'

import {SetupWalletRouteNavigation} from '~/kernel/navigation'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {Space} from '~/ui/Space/Space'
import {HARDWARE_WALLETS, useLedgerPermissions} from '~/wallets/hw/hw'
import {useStrings} from '../../common/useStrings'

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

export const SelectHwConnectionModal = () => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  return (
    <View style={[{paddingHorizontal: 16}]}>
      <Text
        style={[
          {
            fontSize: 16,
            lineHeight: 24,
            fontWeight: '400',
            color: p.text_gray_medium,
          },
        ]}
      >
        {strings.hwModalText}
      </Text>

      <SelectBluetoothSection />

      <SelectUsbSection />
    </View>
  )
}

const SelectBluetoothSection = () => {
  const strings = useStrings()
  const {
    useUSBChanged: USBChanged,
    walletImplementationChanged,
    setupTypeChanged,
  } = useSetupWallet()
  const navigation = useNavigation<SetupWalletRouteNavigation>()

  const navigateHw = () => {
    walletImplementationChanged('cardano-cip1852')
    setupTypeChanged('hw')

    navigation.navigate('setup-wallet-check-nano-x')
  }

  const {request} = useLedgerPermissions({
    onError: () => Alert.alert(strings.error, strings.bluetoothError),
    onSuccess: () => {
      USBChanged(false)
      navigateHw()
    },
  })

  return (
    <>
      <Space.Height.xl />

      <Button
        type={ButtonType.Secondary}
        title={strings.hwModalBtButton}
        icon={Icon.Bluetooth}
        onPress={() => request()}
      />
    </>
  )
}

const SelectUsbSection = () => {
  const {palette: p} = useTheme()
  const strings = useStrings()
  const isAndroidUsbSupported = useIsAndroidUsbSupported()
  const {
    useUSBChanged: USBChanged,
    walletImplementationChanged,
    setupTypeChanged,
  } = useSetupWallet()
  const navigation = useNavigation<SetupWalletRouteNavigation>()

  const navigateHw = () => {
    walletImplementationChanged('cardano-cip1852')
    setupTypeChanged('hw')

    navigation.navigate('setup-wallet-check-nano-x')
  }

  if (Platform.OS === 'ios')
    return (
      <>
        <Space.Height.lg />

        <Text
          style={[
            {
              color: p.text_gray_low,
              fontSize: 14,
              lineHeight: 20,
              fontWeight: '400',
            },
          ]}
        >
          {strings.hwModalIosWarning}
        </Text>
      </>
    )
  if (!isAndroidUsbSupported) {
    return null
  }

  return (
    <>
      <Space.Height.xl />

      <Button
        type={ButtonType.Secondary}
        title={strings.hwModalUsbButton}
        icon={Icon.Usb}
        onPress={() => {
          USBChanged(true)
          navigateHw()
        }}
      />
    </>
  )
}
