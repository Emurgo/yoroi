import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {SystemBars} from 'react-native-edge-to-edge'
import {SafeAreaView} from 'react-native-safe-area-context'

import {DevMenu} from './DevMenu'
import {Boundary} from './src/ui/Boundary/Boundary'

export function Dev() {
  const {isDark, atoms: ta} = useTheme()

  return (
    <SafeAreaView
      style={[a.flex_1, ta.bg_color_max, a.gap_sm, a.flex_row, a.flex_wrap]}
    >
      <SystemBars style={isDark ? 'light' : 'dark'} />

      <Boundary
        loading={{
          enabled: true,
          size: 'full',
        }}
      >
        {/* <LoginWithPinScreen /> */}
        {/* <LoginWithHostScreen /> */}
      </Boundary>

      <DevMenu visible={true} />
    </SafeAreaView>
  )
}
