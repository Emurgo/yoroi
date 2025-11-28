import {ThemedPalette, useTheme} from '@yoroi/theme'

import {createStackNavigator} from '@react-navigation/stack'
import * as React from 'react'

import {useStrings} from '~/kernel/i18n/useStrings'
import {defaultStackNavigationOptions} from '~/kernel/navigation/common/helpers'
import {ReviewTxRoutes} from '~/kernel/navigation/types'
import {Boundary} from '~/ui/Boundary/Boundary'
import {ResultScreen} from '~/ui/ResultScreen/ResultScreen'
import type {ResultScreenParams} from '~/ui/ResultScreen/types'

import {ReviewTxScreen} from './useCases/ReviewTxScreen/ReviewTxScreen'
import {InfraestructureIssueScreen} from './useCases/ShowInfraestructureIssueScreen/InfraestructureIssueScreen'

export const Stack = createStackNavigator<ReviewTxRoutes>()

export const ReviewTxNavigator = () => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  return (
    <Stack.Navigator
      screenOptions={{
        ...screenOptions(p),
      }}
    >
      <Stack.Screen
        name="review-tx"
        options={{
          title: strings.txReview.title,
        }}
        getComponent={() => ReviewTxScreenWrapper}
      />

      <Stack.Screen
        name="result-screen"
        getComponent={() =>
          (props: {
            route: {
              params: ResultScreenParams
            }
          }) => <ResultScreen {...props.route.params} />}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  )
}

const screenOptions = (color: ThemedPalette) => ({
  ...defaultStackNavigationOptions(color),
  gestureEnabled: true,
})

const ReviewTxScreenWrapper = () => {
  const fallback = React.useCallback(() => <InfraestructureIssueScreen />, [])
  return (
    <Boundary
      loading={{
        enabled: true,
        size: 'large',
      }}
      error={{
        fallback,
      }}
    >
      <ReviewTxScreen />
    </Boundary>
  )
}
