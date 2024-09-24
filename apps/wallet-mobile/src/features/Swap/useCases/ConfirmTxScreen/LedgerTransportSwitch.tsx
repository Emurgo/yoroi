import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Alert, ScrollView, StyleSheet, View} from 'react-native'

import {Button} from '../../../../components/Button/Button'
import {Spacer} from '../../../../components/Spacer/Spacer'
import {Text} from '../../../../components/Text'
import {useIsUsbSupported} from '../../../../legacy/HW'
import {HARDWARE_WALLETS, useLedgerPermissions} from '../../../../yoroi-wallets/hw/hw'
import {useStrings} from '../../common/strings'

type Props = {
  onSelectUSB: () => void
  onSelectBLE: () => void
}

const LedgerTransportSwitchView = ({onSelectUSB, onSelectBLE}: Props) => {
  const strings = useStrings()
  const isUSBSupported = useIsUsbSupported()
  const styles = useStyles()

  const {request} = useLedgerPermissions({
    onError: () => Alert.alert(strings.error, strings.bluetoothError),
    onSuccess: onSelectBLE,
  })

  return (
    <ScrollView>
      <View style={styles.content}>
        <Text style={styles.paragraph}>{strings.bluetoothExplanation}</Text>

        <Button
          outlineOnLight
          onPress={() => request()}
          title={strings.bluetoothButton}
          testID="connectWithBLEButton"
        />

        <Spacer height={16} />

        <Text style={styles.paragraph}>{strings.usbExplanation}</Text>

        <Button
          outlineOnLight
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

const useStyles = () => {
  const {atoms} = useTheme()
  const styles = StyleSheet.create({
    paragraph: {
      marginBottom: 16,
      fontSize: 14,
      lineHeight: 22,
    },
    content: {
      flex: 1,
      marginBottom: 24,
      ...atoms.px_lg,
    },
    infoText: {
      paddingTop: 16,
      flex: 1,
      width: '100%',
      color: '#6B7384',
    },
  })

  return styles
}
