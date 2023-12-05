import {createStackNavigator} from '@react-navigation/stack'
import * as React from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {StatusBar} from '../../components'
import {defaultStackNavigationOptions, RampOnOffStackRoutes} from '../../navigation'
import {useTheme} from '../../theme'
import {useHideBottomTabBar} from '../../yoroi-wallets/hooks'
import {RampOnOffProvider} from './common/RampOnOffProvider'
import {useStrings} from './common/strings'
import CreateExchange from './useCases/StartRampOnOff/CreateRampOnOffScreen/CreateExchange'
import ResultExchangeScreen from './useCases/StartRampOnOff/ResultExchangeScreen/ResultExchange'

const Stack = createStackNavigator<RampOnOffStackRoutes>()

export const RampOnOffScreen = () => {
  useHideBottomTabBar()
  const {theme} = useTheme()
  const strings = useStrings()

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[styles.root, {backgroundColor: theme.color['white-static']}]}
    >
      <StatusBar type="dark" />

      <RampOnOffProvider>
        <Stack.Navigator
          screenListeners={{}}
          screenOptions={{
            ...defaultStackNavigationOptions,
            detachPreviousScreen: false /* https://github.com/react-navigation/react-navigation/issues/9883 */,
            gestureEnabled: true,
            headerTransparent: true,
          }}
        >
          <Stack.Screen
            name="create-ramp-on-off"
            component={CreateExchange}
            options={{
              title: strings.rampOnOffTitle,
            }}
          />

          <Stack.Screen
            options={{
              headerShown: false,
            }}
            name="result-ramp-on-off"
            component={ResultExchangeScreen}
          />
        </Stack.Navigator>
      </RampOnOffProvider>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
})
