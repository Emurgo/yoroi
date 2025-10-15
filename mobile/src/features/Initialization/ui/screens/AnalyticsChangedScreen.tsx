import * as React from 'react'

import {useLegalAgreement} from '~/features/Legal/hooks/useLegalAgreement'
import {Analytics} from '~/features/Legal/ui/shared/Analytics/Analytics'

export const AnalyticsChangedScreen = () => {
  const {agree} = useLegalAgreement()

  const handleOnNext = () => {
    agree()
  }

  return <Analytics type="notice" onNext={handleOnNext} />
}
