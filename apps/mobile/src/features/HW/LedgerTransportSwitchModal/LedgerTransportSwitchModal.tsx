import {atoms as a} from '@yoroi/theme'
import React from 'react'
import {Alert, Platform, ScrollView, Text} from 'react-native'
import DeviceInfo from 'react-native-device-info'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {Space} from '~/ui/Space/Space'
import {HARDWARE_WALLETS, useLedgerPermissions} from '~/wallets/hw/hw'

type Props = {
  onSelectUSB: () => void
  onSelectBLE: () => void
}

export const useIsUsbSupported = () => {
  const [isUSBSupported, setUSBSupported] = React.useState(false)
  React.useEffect(() => {
    DeviceInfo.getApiLevel().then((sdk) =>
      setUSBSupported(
        Platform.OS === 'android' &&
          sdk >= HARDWARE_WALLETS.LEDGER_NANO.USB_MIN_SDK,
      ),
    )
  }, [])

  return isUSBSupported
}

export const LedgerTransportSwitchView = ({
  onSelectUSB,
  onSelectBLE,
}: Props) => {
  const strings = useStrings()
  const isUSBSupported = useIsUsbSupported()

  const {request} = useLedgerPermissions({
    onError: () => Alert.alert(strings.hw.error, strings.hw.bluetoothError),
    onSuccess: onSelectBLE,
  })

  const getUsbButtonTitle = (): string => {
    if (Platform.OS === 'ios') {
      return strings.hw.usbButtonDisabled
    } else if (
      !HARDWARE_WALLETS.LEDGER_NANO.ENABLE_USB_TRANSPORT ||
      !isUSBSupported
    ) {
      return strings.hw.usbButtonNotSupported
    } else {
      return strings.hw.usbButton
    }
  }

  return (
    <ScrollView style={[a.flex_1, a.px_lg]}>
      <Text style={[a.heading_3_medium, a.text_center]}>
        {strings.hw.title}
      </Text>

      <Space.Height.lg />

      <Text style={a.body_1_lg_regular}>{strings.hw.usbExplanation}</Text>

      <Space.Height.md />

      <Button
        onPress={onSelectUSB}
        title={getUsbButtonTitle()}
        disabled={
          !isUSBSupported || !HARDWARE_WALLETS.LEDGER_NANO.ENABLE_USB_TRANSPORT
        }
        testID="connectWithUSBButton"
      />

      <Space.Height.md />

      <Text style={a.body_1_lg_regular}>{strings.hw.bluetoothExplanation}</Text>

      <Space.Height.md />

      <Button
        onPress={() => request()}
        title={strings.hw.bluetoothButton}
        testID="connectWithBLEButton"
      />
    </ScrollView>
  )
}

export const LedgerTransportSwitch = LedgerTransportSwitchView
