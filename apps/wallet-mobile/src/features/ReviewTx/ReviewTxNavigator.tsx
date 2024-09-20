import {createStackNavigator} from '@react-navigation/stack'
import {Atoms, ThemedPalette, useTheme} from '@yoroi/theme'
import React from 'react'

import {Boundary} from '../../components/Boundary/Boundary'
import {defaultStackNavigationOptions, ReviewTxRoutes} from '../../kernel/navigation'
import {ReviewTxScreen} from './useCases/ReviewTxScreen/ReviewTxScreen'

export const Stack = createStackNavigator<ReviewTxRoutes>()

export const ReviewTxNavigator = () => {
  const {atoms, color} = useTheme()

  return (
    <Stack.Navigator
      screenOptions={{
        ...screenOptions(atoms, color),
      }}
    >
      <Stack.Screen name="review-tx" options={{title: 'Transaction Review'}}>
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
