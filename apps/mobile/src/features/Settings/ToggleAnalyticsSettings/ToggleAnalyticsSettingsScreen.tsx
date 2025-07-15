import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Linking} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Analytics} from '../../ui/Analytics/Analytics'

export const ToggleAnalyticsSettingsScreen = () => {
  const {palette: p} = useTheme()
  const onReadMore = () => {
    Linking.openURL(
      'https://emurgohelpdesk.zendesk.com/hc/en-us/articles/7594394140303-What-s-user-insights-',
    )
  }

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[{flex: 1}, {backgroundColor: p.bg_color_max}]}
    >
      <Analytics type="settings" onReadMore={onReadMore} />
    </SafeAreaView>
  )
}
