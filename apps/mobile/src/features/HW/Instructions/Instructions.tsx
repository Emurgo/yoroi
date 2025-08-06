import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Platform, Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
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
    rows.push(strings.hw.connectUsb, strings.hw.keepUsbConnected)
  } else {
    if (Platform.OS === 'android') {
      rows.push(strings.hw.enableLocation)
    }
    rows.push(strings.hw.enableTransport)
  }
  rows.push(strings.hw.enterPin, strings.hw.openApp)

  return (
    <View style={[addMargin === true && {marginVertical: 24}]}>
      <Text style={[a.body_1_lg_regular, ta.text_gray_max]}>
        {strings.hw.beforeConfirm}
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
