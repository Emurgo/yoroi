import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs'
import {useSwap, useSwapTokensOnlyVerified} from '@yoroi/swap'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {defaultMaterialTopTabNavigationOptions, SwapTabRoutes} from '../../navigation'
import {useBalance} from '../../yoroi-wallets/hooks'
import {useSelectedWallet} from '../AddWallet/common/Context'
import {useStrings} from './common/strings'
import {CreateOrder} from './useCases/StartSwapScreen/CreateOrder/CreateOrder'
import {ListOrders} from './useCases/StartSwapScreen/ListOrders/ListOrders'

const Tab = createMaterialTopTabNavigator<SwapTabRoutes>()
export const SwapTabNavigator = () => {
  const strings = useStrings()
  const styles = useStyles()
  const {theme} = useTheme()

  // state data
  const wallet = useSelectedWallet()
  const {
    aggregatorTokenId,
    lpTokenHeldChanged,
    frontendFeeTiers,
    frontendFeeTiersChanged,
    sellTokenInfoChanged,
    primaryTokenInfoChanged,
  } = useSwap()
  const lpTokenHeld = useBalance({wallet, tokenId: aggregatorTokenId})

  // initialize sell with / and primary token
  React.useEffect(() => {
    const ptInfo = {
      decimals: wallet.primaryTokenInfo.decimals ?? 0,
      id: wallet.primaryTokenInfo.id,
    }
    sellTokenInfoChanged(ptInfo)
    primaryTokenInfoChanged(ptInfo)
  }, [primaryTokenInfoChanged, sellTokenInfoChanged, wallet.primaryTokenInfo.decimals, wallet.primaryTokenInfo.id])

  // update the fee tiers
  React.useEffect(() => {
    frontendFeeTiersChanged(frontendFeeTiers)
  }, [frontendFeeTiers, frontendFeeTiersChanged])

  // update lp token balance
  React.useEffect(() => {
    if (aggregatorTokenId == null) return

    lpTokenHeldChanged({
      tokenId: aggregatorTokenId,
      quantity: lpTokenHeld,
    })
  }, [aggregatorTokenId, lpTokenHeld, lpTokenHeldChanged])

  // pre load swap tokens
  const {refetch} = useSwapTokensOnlyVerified({suspense: false, enabled: false})
  React.useEffect(() => {
    refetch()
  }, [refetch])

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.root}>
      <Tab.Navigator
        screenOptions={({route}) => ({
          ...defaultMaterialTopTabNavigationOptions(theme),
          tabBarLabel: route.name === 'token-swap' ? strings.tokenSwap : strings.orderSwap,
        })}
        style={styles.tab}
      >
        <Tab.Screen name="token-swap" component={CreateOrder} />

        <Tab.Screen name="orders" component={ListOrders} />
      </Tab.Navigator>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color} = theme
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.color.gray.min,
    },
    tab: {
      backgroundColor: color.gray.min,
    },
  })
  return styles
}
