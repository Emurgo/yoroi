import {createStackNavigator} from '@react-navigation/stack'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {StatusBar} from '../../components'
import {defaultStackNavigationOptions, RampOnOffStackRoutes} from '../../navigation'
import {useHideBottomTabBar} from '../../yoroi-wallets/hooks'
import {RampOnOffProvider} from './common/RampOnOffProvider'
import {useStrings} from './common/useStrings'
import {CreateExchange} from './useCases/CreateExchange/CreateExchange'
import {ShowExchangeResult} from './useCases/ShowExchangeResult/ShowExchangeResult'

const Stack = createStackNavigator<RampOnOffStackRoutes>()

export const RampOnOffScreen = () => {
  useHideBottomTabBar()
  const {theme} = useTheme()
  const strings = useStrings()

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.root, {backgroundColor: theme.color.gray.min}]}>
      <StatusBar type="dark" />

      <RampOnOffProvider>
        <Stack.Navigator
          screenListeners={{}}
          screenOptions={{
            ...defaultStackNavigationOptions(theme),
            detachPreviousScreen: false /* https://github.com/react-navigation/react-navigation/issues/9883 */,
            gestureEnabled: true,
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
            component={() => <ShowExchangeResult variant="noInfo" />}
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
