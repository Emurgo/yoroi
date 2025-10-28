import * as React from 'react'

import {useLegalAgreement} from '~/features/Legal/hooks/useLegalAgreement'
import {Analytics} from '~/features/Legal/ui/shared/Analytics/Analytics'

import {useNavigateTo} from '../../hooks/useNavigateTo'

export const AnalyticsNoticeScreen = () => {
  const navigateTo = useNavigateTo()
  const {agree} = useLegalAgreement()

  const handleOnNext = () => {
    agree()
    navigateTo.enableLogingWithPin()
  }

  return <Analytics type="notice" onNext={handleOnNext} />
}
