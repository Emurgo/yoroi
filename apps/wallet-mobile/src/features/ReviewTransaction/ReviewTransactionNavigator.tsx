import {createStackNavigator} from '@react-navigation/stack'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet} from 'react-native'

import {KeyboardAvoidingView} from '../../components'
import {defaultStackNavigationOptions, ReviewTransactionRoutes} from '../../kernel/navigation'
import {ReviewTransactionScreen} from './useCases/ReviewTransactionScreen/ReviewTransactionScreen'

const Stack = createStackNavigator<ReviewTransactionRoutes>()

export const ReviewTransactionNavigator = () => {
  const {atoms, color} = useTheme()
  const styles = useStyles()

  return (
    <KeyboardAvoidingView style={styles.root}>
      <Stack.Navigator
        screenOptions={{
          ...defaultStackNavigationOptions(atoms, color),
          headerShown: false,
        }}
      >
        <Stack.Screen name="review-transaction" component={ReviewTransactionScreen} />
      </Stack.Navigator>
    </KeyboardAvoidingView>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      backgroundColor: color.bg_color_max,
    },
  })
  return styles
}
