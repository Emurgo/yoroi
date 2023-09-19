import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs'
import React from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {StatusBar} from '../../components'
import {defaultMaterialTopTabNavigationOptions, SwapTabRoutes} from '../../navigation'
import {COLORS} from '../../theme'
import {useHideBottomTabBar} from '../../yoroi-wallets/hooks'
import {useStrings} from './common/strings'
import {CreateOrder} from './useCases/StartSwapScreen/CreateOrder/CreateOrder'
import {ListOrders} from './useCases/StartSwapScreen/ListOrders/ListOrders'

const Tab = createMaterialTopTabNavigator<SwapTabRoutes>()
export const SwapTabNavigator = () => {
  const strings = useStrings()
  useHideBottomTabBar()

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.root}>
      <StatusBar type="dark" />

      <Tab.Navigator
        screenOptions={({route}) => ({
          ...defaultMaterialTopTabNavigationOptions,
          tabBarLabel: route.name === 'token-swap' ? strings.tokenSwap : strings.orderSwap,
        })}
        style={{
          backgroundColor: COLORS.WHITE,
        }}
      >
        <Tab.Screen name="token-swap" component={CreateOrder} />

        <Tab.Screen name="orders" component={ListOrders} />
      </Tab.Navigator>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
})
