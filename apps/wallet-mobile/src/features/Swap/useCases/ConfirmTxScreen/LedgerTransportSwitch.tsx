import React from 'react'
import {Alert, ScrollView, StyleSheet, View} from 'react-native'

import {Button, Spacer, Text} from '../../../../components'
import {useIsUsbSupported} from '../../../../legacy/HW'
import {HARDWARE_WALLETS, useLedgerPermissions} from '../../../../yoroi-wallets/hw'
import {useStrings} from '../../common/strings'

type Props = {
  onSelectUSB: () => void
  onSelectBLE: () => void
}

export const LedgerTransportSwitchView = ({onSelectUSB, onSelectBLE}: Props) => {
  const strings = useStrings()
  const isUSBSupported = useIsUsbSupported()

  const {request} = useLedgerPermissions({
    onError: () => Alert.alert(strings.error, strings.bluetoothError),
    onSuccess: onSelectBLE,
  })

  return (
    <ScrollView>
      <View style={styles.content}>
        <Text style={styles.paragraph}>{strings.bluetoothExplanation}</Text>

        <Button
          outlineShelley
          onPress={() => request()}
          title={strings.bluetoothButton}
          testID="connectWithBLEButton"
        />

        <Spacer height={16} />

        <Text style={styles.paragraph}>{strings.usbExplanation}</Text>

        <Button
          outlineShelley
          onPress={onSelectUSB}
          title={strings.usbButton}
          disabled={!isUSBSupported || !HARDWARE_WALLETS.LEDGER_NANO.ENABLE_USB_TRANSPORT}
          testID="connectWithUSBButton"
        />

        <Text style={styles.infoText}>{strings.usbConnectionIsBlocked}</Text>
      </View>
    </ScrollView>
  )
}

export const LedgerTransportSwitch = LedgerTransportSwitchView

const styles = StyleSheet.create({
  paragraph: {
    marginBottom: 16,
    fontSize: 14,
    lineHeight: 22,
  },
  content: {
    flex: 1,
    marginBottom: 24,
  },
  infoText: {
    paddingTop: 16,
    flex: 1,
    width: '100%',
    color: '#6B7384',
  },
})
