import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {View} from 'react-native'

export const Line = () => {
  const {palette: p} = useTheme()
  return <View style={[{height: 1}, a.w_full, {backgroundColor: p.gray_200}]} />
}
