import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Platform, StyleSheet, Text, View} from 'react-native'

import {BulletPointItem} from '../../components'
import {ledgerMessages} from '../../i18n/global-messages'

type Props = {
  useUSB?: boolean
  addMargin?: boolean
}

export const Instructions = ({useUSB, addMargin}: Props) => {
  const strings = useStrings()
  const rows: Array<string> = []
  if (useUSB) {
    rows.push(strings.connectUsb, strings.keepUsbConnected)
  } else {
    if (Platform.OS === 'android') {
      rows.push(strings.enableLocation)
    }
    rows.push(strings.enableTransport)
  }
  rows.push(strings.enterPin, strings.openApp)

  return (
    <View style={[addMargin === true && styles.blockMargin]}>
      <Text style={styles.paragraphText}>{strings.beforeConfirm}</Text>
      {rows.map((row, i) => (
        <BulletPointItem textRow={row} key={i} style={styles.paragraphText} />
      ))}
    </View>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    connectUsb: intl.formatMessage(ledgerMessages.connectUsb),
    keepUsbConnected: intl.formatMessage(ledgerMessages.keepUsbConnected),
    enableLocation: intl.formatMessage(ledgerMessages.enableLocation),
    enableTransport: intl.formatMessage(ledgerMessages.enableTransport),
    enterPin: intl.formatMessage(ledgerMessages.enterPin),
    openApp: intl.formatMessage(ledgerMessages.openApp),
    beforeConfirm: intl.formatMessage(messages.beforeConfirm),
  }
}

const messages = defineMessages({
  beforeConfirm: {
    id: 'components.send.confirmscreen.beforeConfirm',
    defaultMessage: '!!!Before tapping on confirm, please follow these instructions:',
  },
})

const styles = StyleSheet.create({
  paragraphText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },
  blockMargin: {
    marginVertical: 24,
  },
})
