import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {View} from 'react-native'
import {SystemBars} from 'react-native-edge-to-edge'

import {DevMenu} from './DevMenu'
// import {LoginWithHostScreen} from './src/features/Auth/screens/LoginWithHostScreen'
// import {LoginWithPinScreen} from './src/features/Auth/screens/LoginWithPinScreen'
import {ChangePinScreen} from './src/features/Auth/screens/ChangePinScreen'
import {Boundary} from './src/ui/Boundary/Boundary'

export function Dev() {
  const {isDark, atoms: ta} = useTheme()

  return (
    <View style={[a.full_screen, a.flex_1, ta.bg_color_max]}>
      <SystemBars style={isDark ? 'light' : 'dark'} />

      <Boundary
        loading={{
          enabled: true,
          size: 'full',
        }}
      >
        <ChangePinScreen onDone={() => console.log('----change---')} />
        {/* <CreatePinScreen onDone={() => console.log('----change---')} /> */}
        {/* <LoginWithPinScreen /> */}
        {/* <LoginWithHostScreen /> */}
      </Boundary>

      <DevMenu />
    </View>
  )
}
