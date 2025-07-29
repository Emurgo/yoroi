import {NavigationProp, useNavigation} from '@react-navigation/native'
import * as React from 'react'

import {ReviewTxRoutes} from '~/kernel/navigation'

export const useNavigateTo = () => {
  const navigation = useNavigation<NavigationProp<ReviewTxRoutes>>()

  return React.useRef({
    showSubmittedTxScreen: () => navigation.navigate('review-tx-submitted-tx'),
    showFailedTxScreen: () => navigation.navigate('review-tx-failed-tx'),
  } as const).current
}
