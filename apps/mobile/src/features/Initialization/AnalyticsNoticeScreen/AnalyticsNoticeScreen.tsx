import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Linking} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useMetrics} from '~/kernel/metrics/metricsManager'
import {Analytics} from '~/ui/Analytics/Analytics'
import {useAgreeWithLegal, useNavigateTo} from '../common'

export const AnalyticsNoticeScreen = () => {
  const navigateTo = useNavigateTo()
  const {atoms: ta} = useTheme()
  const {track} = useMetrics()

  const {agree} = useAgreeWithLegal()

  const onClose = () => {
    agree()
    track.onboardingPinCodePageViewed()
    navigateTo.enableLogingWithPin()
  }

  const onReadMore = () => {
    Linking.openURL(
      'https://emurgohelpdesk.zendesk.com/hc/en-us/articles/7594394140303-What-s-user-insights-',
    )
  }

  return (
    <SafeAreaView style={[a.flex_1, ta.bg_color_max]}>
      <Analytics type="notice" onClose={onClose} onReadMore={onReadMore} />
    </SafeAreaView>
  )
}
