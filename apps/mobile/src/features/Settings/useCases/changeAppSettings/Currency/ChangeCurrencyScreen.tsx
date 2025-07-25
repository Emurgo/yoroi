import {useTheme} from '@yoroi/theme'
import React from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Boundary} from '../../../../../ui/Boundary/Boundary'

export const ChangeCurrencyScreen = () => {
  const {palette: p} = useTheme()

  return (
    <SafeAreaView
      edges={['bottom', 'right', 'left']}
      style={{
        flex: 1,
        backgroundColor: p.bg_color_max,
      }}
    >
      <Boundary>{/*<CurrencyPickerList />*/}</Boundary>
    </SafeAreaView>
  )
}
