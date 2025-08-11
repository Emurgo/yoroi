import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'

export const LabelSingleAddress = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  return (
    <View style={[a.px_sm, styles.container, {backgroundColor: p.el_gray_min}]}>
      <Text style={[a.body_3_sm_medium, {color: p.gray_min}]}>
        {strings.receive.singleAddress}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 3,
    borderRadius: 999,
  },
})
