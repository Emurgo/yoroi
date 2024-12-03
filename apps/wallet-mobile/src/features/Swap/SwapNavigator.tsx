import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Keyboard, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {KeyboardAvoidingView} from '../../components/KeyboardAvoidingView/KeyboardAvoidingView'
import {useIsKeyboardOpen} from '../../kernel/keyboard/useIsKeyboardOpen'
import {defaultMaterialTopTabNavigationOptions, SwapTabRoutes} from '../../kernel/navigation'
import {useSearch} from '../Search/SearchContext'
import {useStrings} from './common/strings'
import {StartSwapOrderScreen} from './useCases/CreateOrder/StartSwapOrderScreen'
// import {ListOrders} from './useCases/StartOrderSwapScreen/ListOrders/ListOrders'

const Tab = createMaterialTopTabNavigator<SwapTabRoutes>()
export const SwapTabNavigator = () => {
  const strings = useStrings()
  const styles = useStyles()
  const {atoms, color} = useTheme()
  const isKeyboardOpen = useIsKeyboardOpen()

  const {visible: isSearchBarVisible} = useSearch()

  return (
    <KeyboardAvoidingView style={[styles.flex, styles.root]}>
      <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.flex}>
        <Tab.Navigator
          screenOptions={({route}) => ({
            ...defaultMaterialTopTabNavigationOptions(atoms, color),
            ...(isSearchBarVisible && {tabBarStyle: {height: 0}}),
            tabBarLabel: route.name === 'token-swap' ? strings.tokenSwap : strings.orderSwap,
          })}
          style={styles.tab}
        >
          <Tab.Screen
            listeners={{
              tabPress: (e) => {
                // if the keyboard is open, the user needs to close first the keyboard
                // then, press again the tab to change screen
                // to avoid screen freezing
                if (isKeyboardOpen) {
                  Keyboard.dismiss()
                  e.preventDefault()
                }
              },
            }}
            name="token-swap"
            component={StartSwapOrderScreen}
          />

          <Tab.Screen
            listeners={{
              tabPress: (e) => {
                // if the keyboard is open, the user needs to close first the keyboard
                // then, press again the tab to change screen
                // to avoid screen freezing
                if (isKeyboardOpen) {
                  Keyboard.dismiss()
                  e.preventDefault()
                }
              },
            }}
            name="orders"
            getComponent={() => View}
          />
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
