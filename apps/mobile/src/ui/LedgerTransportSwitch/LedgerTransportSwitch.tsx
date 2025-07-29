import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {Alert, View} from 'react-native'

import {useStrings} from '~/features/Swap/common/strings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Text} from '~/ui/Text/Text'
import {
  HARDWARE_WALLETS,
  useIsUsbSupported,
  useLedgerPermissions,
} from '~/wallets/hw/hw'
import {Space} from '../Space/Space'

type Props = {
  onSelectUSB: () => void
  onSelectBLE: () => void
}

const LedgerTransportSwitchView = ({onSelectUSB, onSelectBLE}: Props) => {
  const strings = useStrings()
  const isUSBSupported = useIsUsbSupported()
  const {palette: p} = useTheme()

  const {request} = useLedgerPermissions({
    onError: () => Alert.alert(strings.error, strings.bluetoothError),
    onSuccess: onSelectBLE,
  })

  return (
    <View style={[a.flex_1, {marginBottom: 24}, a.px_lg]}>
      <Text style={{marginBottom: 16, fontSize: 14, lineHeight: 22}}>
        {strings.bluetoothExplanation}
      </Text>

      <Button
        type={ButtonType.Secondary}
        onPress={() => request()}
        title={strings.bluetoothButton}
        testID="connectWithBLEButton"
      />

      <Space.Height.md />

      <Text style={{marginBottom: 16, fontSize: 14, lineHeight: 22}}>
        {strings.usbExplanation}
      </Text>

      <Button
        type={ButtonType.Secondary}
        onPress={onSelectUSB}
        title={strings.usbButton}
        disabled={
          !isUSBSupported || !HARDWARE_WALLETS.LEDGER_NANO.ENABLE_USB_TRANSPORT
        }
        testID="connectWithUSBButton"
      />

      <Text
        style={[{paddingTop: 16, flex: 1, width: '100%'}, {color: p.gray_600}]}
      >
        {strings.usbConnectionIsBlocked}
      </Text>
    </View>
  )
}

export const LedgerTransportSwitch = LedgerTransportSwitchView
