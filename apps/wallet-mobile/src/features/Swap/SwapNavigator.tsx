import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs'
import {useSwap, useSwapTokensOnlyVerified} from '@yoroi/swap'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Keyboard, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {KeyboardAvoidingView} from '../../components/KeyboardAvoidingView/KeyboardAvoidingView'
import {useIsKeyboardOpen} from '../../kernel/keyboard/useIsKeyboardOpen'
import {defaultMaterialTopTabNavigationOptions, SwapTabRoutes} from '../../kernel/navigation'
import {usePortfolioBalances} from '../Portfolio/common/hooks/usePortfolioBalances'
import {useSearch} from '../Search/SearchContext'
import {useSelectedWallet} from '../WalletManager/common/hooks/useSelectedWallet'
import {useStrings} from './common/strings'
import {StartSwapOrderScreen} from './useCases/StartOrderSwapScreen/CreateOrder/StartSwapOrderScreen'
import {ListOrders} from './useCases/StartOrderSwapScreen/ListOrders/ListOrders'

const Tab = createMaterialTopTabNavigator<SwapTabRoutes>()
export const SwapTabNavigator = () => {
  const strings = useStrings()
  const styles = useStyles()
  const {atoms, color} = useTheme()
  const isKeyboardOpen = useIsKeyboardOpen()

  // state data
  const {wallet} = useSelectedWallet()
  const {
    aggregatorTokenId,
    lpTokenHeldChanged,
    frontendFeeTiers,
    frontendFeeTiersChanged,
    sellTokenInfoChanged,
    primaryTokenInfoChanged,
  } = useSwap()
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const lpTokenHeld = usePortfolioBalances({wallet}).records.get(aggregatorTokenId!)

  // initialize sell with / and primary token
  React.useEffect(() => {
    sellTokenInfoChanged(wallet.portfolioPrimaryTokenInfo)
    primaryTokenInfoChanged(wallet.portfolioPrimaryTokenInfo)
  }, [primaryTokenInfoChanged, sellTokenInfoChanged, wallet.portfolioPrimaryTokenInfo])

  // update the fee tiers
  React.useEffect(() => {
    frontendFeeTiersChanged(frontendFeeTiers)
  }, [frontendFeeTiers, frontendFeeTiersChanged])

  // update lp token balance
  React.useEffect(() => {
    if (aggregatorTokenId == null) return

    lpTokenHeldChanged(lpTokenHeld)
  }, [aggregatorTokenId, lpTokenHeld, lpTokenHeldChanged])

  useSwapTokensOnlyVerified({suspense: false})

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
            getComponent={() => ListOrders}
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
