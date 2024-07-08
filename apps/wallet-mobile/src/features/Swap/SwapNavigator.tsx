import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs'
import {useSwap, useSwapTokensOnlyVerified} from '@yoroi/swap'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {defaultMaterialTopTabNavigationOptions, SwapTabRoutes} from '../../kernel/navigation'
import {useBalance} from '../../yoroi-wallets/hooks'
import {useSelectedWallet} from '../WalletManager/common/hooks/useSelectedWallet'
import {useStrings} from './common/strings'
import {CreateOrder} from './useCases/StartSwapScreen/CreateOrder/CreateOrder'
import {ListOrders} from './useCases/StartSwapScreen/ListOrders/ListOrders'

const Tab = createMaterialTopTabNavigator<SwapTabRoutes>()
export const SwapTabNavigator = () => {
  const strings = useStrings()
  const styles = useStyles()
  const {atoms, color} = useTheme()

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
  const lpTokenHeld = useBalance({wallet, tokenId: aggregatorTokenId})

  // initialize sell with / and primary token
  React.useEffect(() => {
    const ptInfo = {
      decimals: wallet.portfolioPrimaryTokenInfo.decimals,
      id: wallet.portfolioPrimaryTokenInfo.id,
    }
    sellTokenInfoChanged(ptInfo)
    primaryTokenInfoChanged(ptInfo)
  }, [
    primaryTokenInfoChanged,
    sellTokenInfoChanged,
    wallet.portfolioPrimaryTokenInfo.decimals,
    wallet.portfolioPrimaryTokenInfo.id,
  ])

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

  useSwapTokensOnlyVerified({suspense: false})

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.root}>
      <Tab.Navigator
        screenOptions={({route}) => ({
          ...defaultMaterialTopTabNavigationOptions(atoms, color),
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
  const {color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: color.bg_color_high,
    },
    tab: {
      backgroundColor: color.bg_color_high,
    },
  })
  return styles
}
