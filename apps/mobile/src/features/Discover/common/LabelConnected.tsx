import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'

export const LabelConnected = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  return (
    <View
      style={[a.px_sm, styles.container, {backgroundColor: p.secondary_600}]}
    >
      <Text style={[a.body_3_sm_medium, styles.text, {color: p.gray_min}]}>
        {strings.discover.connected}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 3,
    borderRadius: 999,
  },
  text: {
    fontWeight: '500',
  },
})
