import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useLegalAgreement} from '~/features/Legal/hooks/useLegalAgreement'
import {Analytics} from '~/features/Legal/ui/shared/Analytics/Analytics'

export const AnalyticsChangedScreen = () => {
  const {agree} = useLegalAgreement()
  const {atoms: ta} = useTheme()

  const handleOnNext = () => {
    agree()
  }

  return (
    <SafeAreaView style={[a.flex_1, ta.bg_color_max]}>
      <Analytics type="notice" onNext={handleOnNext} />
    </SafeAreaView>
  )
}
