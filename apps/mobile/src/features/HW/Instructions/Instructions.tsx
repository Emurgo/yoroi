import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Platform, Text, View} from 'react-native'

import {ledgerMessages} from '~/kernel/i18n/global-messages'
import {BulletPointItem} from '~/ui/BulletPointItem'
import {Space} from '~/ui/Space/Space'

type Props = {
  useUSB?: boolean
  addMargin?: boolean
}

export const Instructions = ({useUSB, addMargin /* legacy */}: Props) => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()

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
    <View style={[addMargin === true && {marginVertical: 24}]}>
      <Text style={[a.body_1_lg_regular, ta.text_gray_max]}>
        {strings.beforeConfirm}
      </Text>

      <Space.Height.lg />

      {rows.map((row, i) => (
        <BulletPointItem
          textRow={row}
          key={i}
          style={[a.body_1_lg_regular, ta.text_gray_max]}
        />
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
    defaultMessage:
      '!!!Before tapping on confirm, please follow these instructions:',
  },
})
