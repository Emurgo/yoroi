import {createStackNavigator} from '@react-navigation/stack'
import * as React from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {StatusBar} from '../../components'
import {defaultStackNavigationOptions, TxHistoryRoutes} from '../../navigation'
import {useTheme} from '../../theme'
import {useHideBottomTabBar} from '../../yoroi-wallets/hooks'
import {useStrings} from './common/useStrings'
import { ReceiveScreen } from './useCases/ReceiveScreen'
import { SpecificAmountScreen } from './useCases/SpecificAmountScreen'

const Stack = createStackNavigator<TxHistoryRoutes>()

export const ReceiveScreenNavigator = () => {
  useHideBottomTabBar()
  const {theme} = useTheme()
  const strings = useStrings()

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[styles.root, {backgroundColor: theme.color['white-static']}]}
    >
      <StatusBar type="dark" />

        <Stack.Navigator
          screenListeners={{}}
          screenOptions={{
            ...defaultStackNavigationOptions,
            detachPreviousScreen: false /* https://github.com/react-navigation/react-navigation/issues/9883 */,
            gestureEnabled: true,
          }}
        >
          <Stack.Screen
            name="receive"
            component={ReceiveScreen}
            options={{
              title: strings.receiveTitle,
            }}
          />

          <Stack.Screen
            name="receive-specific-amount"
            component={SpecificAmountScreen}
            options={{
              title: strings.specificAmount,
            }}
          />
          
        </Stack.Navigator>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
})
