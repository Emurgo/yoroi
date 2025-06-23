import {createStackNavigator} from '@react-navigation/stack'
import {Atoms, ThemedPalette, useTheme} from '@yoroi/theme'
import React from 'react'

import {Boundary} from '../../components/Boundary/Boundary'
import {defaultStackNavigationOptions, ReviewTxRoutes} from '../../kernel/navigation'
import {useStrings} from './common/hooks/useStrings'
import {ReviewTxScreen} from './useCases/ReviewTxScreen/ReviewTxScreen'
import {FailedTxScreen} from './useCases/ShowFailedTxScreen/FailedTxScreen'
import {InfraestructureIssueScreen} from './useCases/ShowInfraestructureIssueScreen/InfraestructureIssueScreen'
import {SubmittedTxScreen} from './useCases/ShowSubmittedTxScreen/SubmittedTxScreen'

export const Stack = createStackNavigator<ReviewTxRoutes>()

export const ReviewTxNavigator = () => {
  const {atoms, color} = useTheme()
  const strings = useStrings()

  const fallback = React.useCallback(() => <InfraestructureIssueScreen />, [])

  return (
    <Stack.Navigator
      screenOptions={{
        ...screenOptions(atoms, color),
      }}
    >
      <Stack.Screen name="review-tx" options={{title: strings.title}}>
        {() => (
          <Boundary
            error={{
              fallback,
            }}
          >
            <ReviewTxScreen />
          </Boundary>
        )}
      </Stack.Screen>

      <Stack.Screen name="review-tx-submitted-tx" component={SubmittedTxScreen} options={{headerShown: false}} />

      <Stack.Screen name="review-tx-failed-tx" component={FailedTxScreen} options={{headerShown: false}} />
    </Stack.Navigator>
  )
}

const screenOptions = (atoms: Atoms, color: ThemedPalette) => ({
  ...defaultStackNavigationOptions(atoms, color),
  gestureEnabled: true,
})
