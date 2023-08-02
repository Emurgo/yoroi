import React from 'react'

import {features} from '../../features'
import {useMetrics} from '../../metrics/metricsManager'
import {Modal} from '../Modal'
import {Analytics} from './Analytics'

type Props = {
  invisible?: boolean
}

export const AnalyticsNotice = ({invisible}: Props) => {
  const {isConsentRequested, requestConsent} = useMetrics()

  if (invisible || !features.analytics) return null

  return (
    <Modal visible={!isConsentRequested} onRequestClose={requestConsent}>
      <Analytics type="notice" onClose={requestConsent}/>
    </Modal>
  )
}
