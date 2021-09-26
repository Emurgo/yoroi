// @flow

import React from 'react'
import {Platform, Text, View, StyleSheet} from 'react-native'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'

import {BulletPointItem} from '../UiKit'
import {ledgerMessages} from '../../i18n/global-messages'

const messages = defineMessages({
  beforeConfirm: {
    id: 'components.send.confirmscreen.beforeConfirm',
    defaultMessage: '!!!Before tapping on confirm, please follow these instructions:',
  },
})

type Props = {|
  intl: IntlShape,
  useUSB: boolean,
  addMargin?: boolean,
|}

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

const HWInstructions = ({intl, useUSB, addMargin}: Props) => {
  const rows = []
  if (useUSB) {
    rows.push(intl.formatMessage(ledgerMessages.connectUsb), intl.formatMessage(ledgerMessages.keepUsbConnected))
  } else {
    if (Platform.OS === 'android') {
      rows.push(intl.formatMessage(ledgerMessages.enableLocation))
    }
    rows.push(intl.formatMessage(ledgerMessages.enableTransport))
  }
  rows.push(intl.formatMessage(ledgerMessages.enterPin), intl.formatMessage(ledgerMessages.openApp))
  return (
    <View style={[addMargin === true && styles.blockMargin]}>
      <Text style={styles.paragraphText}>{intl.formatMessage(messages.beforeConfirm)}</Text>
      {rows.map((row, i) => (
        <BulletPointItem textRow={row} key={i} style={styles.paragraphText} />
      ))}
    </View>
  )
}

export default injectIntl(HWInstructions)
