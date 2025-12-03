import {
  HARDWARE_WALLETS,
  useLedgerPermissions,
} from '@yoroi/cardano-wallet/hw/hw'
import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Alert, View} from 'react-native'

import {useIsUsbSupported} from '~/features/HW/LedgerTransportSwitchModal/LedgerTransportSwitchModal'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Text} from '~/ui/Text/Text'

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
    onError: () => Alert.alert(strings.hw.error, strings.hw.bluetoothError),
    onSuccess: onSelectBLE,
  })

  return (
    <View style={[a.flex_1, {marginBottom: 24}, a.px_lg]}>
      <Text style={{marginBottom: 16, fontSize: 14, lineHeight: 22}}>
        {strings.hw.bluetoothExplanation}
      </Text>

      <Button
        type={ButtonType.Secondary}
        onPress={() => request()}
        title={strings.hw.bluetoothButton}
        testID="connectWithBLEButton"
      />

      <Space.Height.md />

      <Text style={{marginBottom: 16, fontSize: 14, lineHeight: 22}}>
        {strings.hw.usbExplanation}
      </Text>

      <Button
        type={ButtonType.Secondary}
        onPress={onSelectUSB}
        title={strings.hw.usbButton}
        disabled={
          !isUSBSupported || !HARDWARE_WALLETS.LEDGER_NANO.ENABLE_USB_TRANSPORT
        }
        testID="connectWithUSBButton"
      />

      <Text style={[a.pt_md, a.flex_1, a.w_full, {color: p.gray_600}]}>
        {strings.swap.usbConnectionIsBlocked}
      </Text>
    </View>
  )
}

export const LedgerTransportSwitch = LedgerTransportSwitchView
