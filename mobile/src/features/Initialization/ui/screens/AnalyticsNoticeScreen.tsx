import {atoms as a} from '@yoroi/theme'

import * as React from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useLegalAgreement} from '~/features/Legal/hooks/useLegalAgreement'
import {Analytics} from '~/features/Legal/ui/shared/Analytics/Analytics'
import {useMetrics} from '~/kernel/metrics/metricsManager'

import {useNavigateTo} from '../../hooks/useNavigateTo'

export const AnalyticsNoticeScreen = () => {
  const navigateTo = useNavigateTo()
  const {track} = useMetrics()
  const {agree} = useLegalAgreement()

  const handleOnNext = () => {
    agree()
    track.onboardingPinCodePageViewed()
    navigateTo.enableLogingWithPin()
  }

  return (
    <SafeAreaView style={a.flex_1}>
      <Analytics type="notice" onNext={handleOnNext} />
    </SafeAreaView>
  )
}
