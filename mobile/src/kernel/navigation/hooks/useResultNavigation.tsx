import {NavigationProp, useNavigation} from '@react-navigation/native'
import * as React from 'react'

import {ReviewTxRoutes} from '~/kernel/navigation/types'
import {ResultScreenParams} from '~/ui/ResultScreen/types'

// Union type for navigators that have result-screen
type RoutesWithResultScreen =
  | ReviewTxRoutes
  | {
      'result-screen': ResultScreenParams
      [key: string]: unknown
    }

export const useResultNavigation = () => {
  const navigation = useNavigation<NavigationProp<RoutesWithResultScreen>>()

  return React.useRef({
    showResultScreen: (params: ResultScreenParams) =>
      navigation.navigate('result-screen', params),
  } as const).current
}
