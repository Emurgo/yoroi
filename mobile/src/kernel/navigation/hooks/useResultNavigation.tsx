import {NavigationProp, useNavigation} from '@react-navigation/native'
import * as React from 'react'

import {ReviewTxRoutes} from '~/kernel/navigation/types'
import {ResultScreenParams} from '~/ui/ResultScreen/types'

export const useResultNavigation = () => {
  const navigation = useNavigation<NavigationProp<ReviewTxRoutes>>()

  return React.useRef({
    showResultScreen: (params: ResultScreenParams) =>
      navigation.navigate('result-screen', params),
  } as const).current
}
