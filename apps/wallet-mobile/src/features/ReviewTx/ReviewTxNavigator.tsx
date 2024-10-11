import {createStackNavigator} from '@react-navigation/stack'
import {Atoms, ThemedPalette, useTheme} from '@yoroi/theme'
import React from 'react'

import {Boundary} from '../../components/Boundary/Boundary'
import {defaultStackNavigationOptions, ReviewTxRoutes} from '../../kernel/navigation'
import {useStrings} from './common/hooks/useStrings'
import {ReviewTxScreen} from './useCases/ReviewTxScreen/ReviewTxScreen'

export const Stack = createStackNavigator<ReviewTxRoutes>()

export const ReviewTxNavigator = () => {
  const {atoms, color} = useTheme()
  const strings = useStrings()

  return (
    <Stack.Navigator
      screenOptions={{
        ...screenOptions(atoms, color),
      }}
    >
      <Stack.Screen name="review-tx" options={{title: strings.title}}>
        {() => (
          <Boundary>
            <ReviewTxScreen />
          </Boundary>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

const screenOptions = (atoms: Atoms, color: ThemedPalette) => ({
  ...defaultStackNavigationOptions(atoms, color),
  gestureEnabled: true,
})
