import {createStackNavigator} from '@react-navigation/stack'
import {Atoms, ThemedPalette, useTheme} from '@yoroi/theme'
import * as React from 'react'

import {useStrings} from '~/kernel/i18n/useStrings'
import {defaultStackNavigationOptions} from '~/kernel/navigation/common/helpers'
import {ReviewTxRoutes} from '~/kernel/navigation/types'
import {Boundary} from '~/ui/Boundary/Boundary'
import {ReviewTxScreen} from './useCases/ReviewTxScreen/ReviewTxScreen'
import {FailedTxScreen} from './useCases/ShowFailedTxScreen/FailedTxScreen'
import {InfraestructureIssueScreen} from './useCases/ShowInfraestructureIssueScreen/InfraestructureIssueScreen'
import {SubmittedTxScreen} from './useCases/ShowSubmittedTxScreen/SubmittedTxScreen'

export const Stack = createStackNavigator<ReviewTxRoutes>()

export const ReviewTxNavigator = () => {
  const {atoms, palette: p} = useTheme()
  const strings = useStrings()

  const fallback = React.useCallback(() => <InfraestructureIssueScreen />, [])

  return (
    <Stack.Navigator
      screenOptions={{
        ...screenOptions(atoms, p),
      }}
    >
      <Stack.Screen name="review-tx" options={{title: strings.txReview.title}}>
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

      <Stack.Screen
        name="review-tx-submitted-tx"
        component={SubmittedTxScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="review-tx-failed-tx"
        component={FailedTxScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  )
}

const screenOptions = (atoms: Atoms, color: ThemedPalette) => ({
  ...defaultStackNavigationOptions(atoms, color),
  gestureEnabled: true,
})
