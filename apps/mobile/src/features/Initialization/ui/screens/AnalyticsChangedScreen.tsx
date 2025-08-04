import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Linking} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useLegalAgreement} from '~/features/Legal/hooks/useLegalAgreement'
import {Analytics} from '~/ui/Analytics/Analytics'

export const AnalyticsChangedScreen = () => {
  const {agree} = useLegalAgreement()
  const {atoms: ta} = useTheme()

  const onReadMore = () => {
    Linking.openURL(
      'https://emurgohelpdesk.zendesk.com/hc/en-us/articles/7594394140303-What-s-user-insights-',
    )
  }

  const handleClose = () => {
    agree()
  }

  return (
    <SafeAreaView style={[a.flex_1, ta.bg_color_max]}>
      <Analytics type="notice" onClose={handleClose} onReadMore={onReadMore} />
    </SafeAreaView>
  )
}
