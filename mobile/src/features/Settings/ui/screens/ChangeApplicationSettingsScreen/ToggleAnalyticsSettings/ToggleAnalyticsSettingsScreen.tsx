import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Analytics} from '~/features/Legal/ui/shared/Analytics/Analytics'

export const ToggleAnalyticsSettingsScreen = () => {
  const {atoms: ta} = useTheme()

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[a.flex_1, a.pt_lg, ta.bg_color_max]}
    >
      <Analytics type="settings" />
    </SafeAreaView>
  )
}
