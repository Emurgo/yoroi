import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {defaultMaterialTopTabNavigationOptions, PortfolioTokenListTabRoutes} from '../../navigation'
import {useSearchOnNavBar} from '../../Search/SearchContext'
import {useStrings} from './common/useStrings'
import {PortfolioDAppsTokenScreen} from './useCases/PortfolioTokensList/PortfolioDAppsTokenScreen'
import {PortfolioWalletTokenScreen} from './useCases/PortfolioTokensList/PortfolioWalletTokenScreen'

const Tab = createMaterialTopTabNavigator<PortfolioTokenListTabRoutes>()
export const PortfolioTokenListNavigator = () => {
  const {styles, atoms, color} = useStyles()
  const strings = useStrings()

  useSearchOnNavBar({
    title: strings.tokenList,
    placeholder: strings.searchTokens,
  })

  const hasWithDAps = false
  const swipeEnabled = hasWithDAps

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.root}>
      <Tab.Navigator
        screenOptions={{
          ...defaultMaterialTopTabNavigationOptions(atoms, color),
          swipeEnabled,
        }}
      >
        <Tab.Screen
          name="wallet-token"
          component={PortfolioWalletTokenScreen}
          options={{
            title: strings.walletToken,
            tabBarStyle: {
              height: hasWithDAps ? 'auto' : 0,
            },
          }}
        />

        <Tab.Screen
          name="dapps-token"
          component={PortfolioDAppsTokenScreen}
          options={{
            title: strings.dappsToken,
            tabBarStyle: {
              height: hasWithDAps ? 'auto' : 0,
            },
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      backgroundColor: color.gray_cmin,
    },
  })

  return {styles, atoms, color} as const
}
