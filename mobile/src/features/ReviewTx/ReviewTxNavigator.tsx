import {ThemedPalette, useTheme} from '@yoroi/theme'

import {createStackNavigator} from '@react-navigation/stack'
import * as React from 'react'

import {useStrings} from '~/kernel/i18n/useStrings'
import {defaultStackNavigationOptions} from '~/kernel/navigation/common/helpers'
import {ReviewTxRoutes} from '~/kernel/navigation/types'
import {Boundary} from '~/ui/Boundary/Boundary'
import {Copiable} from '~/ui/Copiable/Copiable'

import {useAuth} from '../Auth/context/AuthProvider'
import {ReviewTxScreen} from './useCases/ReviewTxScreen/ReviewTxScreen'
import {FailedTxScreen} from './useCases/ShowFailedTxScreen/FailedTxScreen'
import {InfraestructureIssueScreen} from './useCases/ShowInfraestructureIssueScreen/InfraestructureIssueScreen'
import {SubmittedTxScreen} from './useCases/ShowSubmittedTxScreen/SubmittedTxScreen'

export const Stack = createStackNavigator<ReviewTxRoutes>()

export const ReviewTxNavigator = () => {
  const {palette: p} = useTheme()
  const strings = useStrings()
  const {isAuthDev} = useAuth()

  return (
    <Stack.Navigator
      screenOptions={{
        ...screenOptions(p),
      }}
    >
      <Stack.Screen
        name="review-tx"
        options={({route}) => ({
          title: strings.txReview.title,
          headerRight: () =>
            route.params?.cbor != null && isAuthDev ? (
              <Copiable text={route.params.cbor} />
            ) : null,
        })}
        getComponent={() => ReviewTxScreenWrapper}
      />

      <Stack.Screen
        name="review-tx-submitted-tx"
        getComponent={() => SubmittedTxScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="review-tx-failed-tx"
        getComponent={() => FailedTxScreen}
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
