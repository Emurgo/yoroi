import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs'
import {EventArg} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Keyboard, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {KeyboardAvoidingView} from '../../components/KeyboardAvoidingView/KeyboardAvoidingView'
import {isDev} from '../../kernel/env'
import {useIsKeyboardOpen} from '../../kernel/keyboard/useIsKeyboardOpen'
import {defaultMaterialTopTabNavigationOptions, SwapTabRoutes} from '../../kernel/navigation'
import {useSearch} from '../Search/SearchContext'
import {useStrings} from './common/strings'
import {StartSwapOrderScreen} from './useCases/CreateOrder/StartSwapOrderScreen'
import {ListOrders} from './useCases/ListOrders/ListOrders'
import {ManagerConfig} from './useCases/Manager/ManagerConfig'

const Tab = createMaterialTopTabNavigator<SwapTabRoutes>()
export const SwapTabNavigator = () => {
  const strings = useStrings()
  const styles = useStyles()
  const {atoms, color} = useTheme()
  const isKeyboardOpen = useIsKeyboardOpen()

  const {visible: isSearchBarVisible} = useSearch()

  const listeners = {
    tabPress: (e: EventArg<'tabPress', true, undefined>) => {
      // if the keyboard is open, the user needs to close first the keyboard
      // then, press again the tab to change screen
      // to avoid screen freezing
      if (isKeyboardOpen) {
        Keyboard.dismiss()
        e.preventDefault()
      }
    },
  }

  return (
    <KeyboardAvoidingView style={[styles.flex, styles.root]}>
      <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.flex}>
        <Tab.Navigator
          screenOptions={({route}) => ({
            ...defaultMaterialTopTabNavigationOptions(atoms, color),
            ...(isSearchBarVisible && {tabBarStyle: {height: 0}}),
            tabBarLabel: {'token-swap': strings.tokenSwap, orders: strings.orderSwap, 'manager-config': 'Manager'}[
              route.name
            ],
          })}
          style={styles.tab}
        >
          <Tab.Screen listeners={listeners} name="token-swap" component={StartSwapOrderScreen} />

          <Tab.Screen listeners={listeners} name="orders" getComponent={() => ListOrders} />

          {isDev && <Tab.Screen listeners={listeners} name="manager-config" component={ManagerConfig} />}
        </Tab.Navigator>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      backgroundColor: color.bg_color_max,
    },
    flex: {
      ...atoms.flex_1,
    },
    tab: {
      backgroundColor: color.bg_color_max,
    },
  })
  return styles
}
