import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Boundary} from '~/ui/Boundary/Boundary'
import {CurrencyPickerList} from './CurrencyPickerList'

export const ChangeCurrencyScreen = () => {
  const {atoms: ta} = useTheme()

  return (
    <SafeAreaView
      edges={['bottom', 'right', 'left']}
      style={[a.flex_1, ta.bg_color_max]}
    >
      <Boundary>
        <CurrencyPickerList />
      </Boundary>
    </SafeAreaView>
  )
}
