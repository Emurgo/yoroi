import {useNavigation} from '@react-navigation/native'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Alert, Platform, StyleSheet, Text, View} from 'react-native'
import DeviceInfo from 'react-native-device-info'

import {Button} from '../../../../components/Button/Button'
import {Icon} from '../../../../components/Icon'
import {Space} from '../../../../components/Space/Space'
import {SetupWalletRouteNavigation} from '../../../../kernel/navigation'
import {HARDWARE_WALLETS, useLedgerPermissions} from '../../../../yoroi-wallets/hw/hw'
import {useStrings} from '../../common/useStrings'

const useIsAndroidUsbSupported = () => {
  const [isAndroidUsbSupported, setIsAndroidUsbSupported] = React.useState(false)
  React.useEffect(() => {
    DeviceInfo.getApiLevel().then((sdk) =>
      setIsAndroidUsbSupported(Platform.OS === 'android' && sdk >= HARDWARE_WALLETS.LEDGER_NANO.USB_MIN_SDK),
    )
  }, [])

  return isAndroidUsbSupported
}

export const SelectHwConnectionModal = () => {
  const {styles} = useStyles()
  const strings = useStrings()

  return (
    <View style={styles.modal}>
      <Text style={styles.modalText}>{strings.hwModalText}</Text>

      <SelectBluetoothSection />

      <SelectUsbSection />
    </View>
  )
}

const SelectBluetoothSection = () => {
  const {styles, colors} = useStyles()
  const strings = useStrings()
  const {useUSBChanged: USBChanged, walletImplementationChanged, setupTypeChanged} = useSetupWallet()
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
      <Space height="xl" />

      <Button
        iconImage={<Icon.Bluetooth color={colors.blue} />}
        textStyles={styles.buttonText}
        title={strings.hwModalBtButton}
        outlineShelley
        onPress={() => request()}
      />
    </>
  )
}

const SelectUsbSection = () => {
  const {styles, colors} = useStyles()
  const strings = useStrings()
  const isAndroidUsbSupported = useIsAndroidUsbSupported()
  const {useUSBChanged: USBChanged, walletImplementationChanged, setupTypeChanged} = useSetupWallet()
  const navigation = useNavigation<SetupWalletRouteNavigation>()

  const navigateHw = () => {
    walletImplementationChanged('cardano-cip1852')
    setupTypeChanged('hw')

    navigation.navigate('setup-wallet-check-nano-x')
  }

  if (Platform.OS === 'ios')
    return (
      <>
        <Space height="lg" />

        <Text style={styles.iosWarning}>{strings.hwModalIosWarning}</Text>
      </>
    )
  if (!isAndroidUsbSupported) {
    return null
  }

  return (
    <>
      <Space height="xl" />

      <Button
        iconImage={<Icon.Usb color={colors.blue} />}
        textStyles={styles.buttonText}
        title={strings.hwModalUsbButton}
        outlineShelley
        onPress={() => {
          USBChanged(true)
          navigateHw()
        }}
      />
    </>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()

  const styles = StyleSheet.create({
    modal: {
      ...atoms.px_lg,
    },
    modalText: {
      ...atoms.body_1_lg_regular,
      color: color.text_gray_medium,
    },
    buttonText: {
      ...atoms.py_lg,
    },
    iosWarning: {
      color: color.text_gray_low,
      ...atoms.body_2_md_regular,
    },
  })

  const colors = {
    blue: color.el_primary_medium,
  }
  return {styles, colors} as const
}
