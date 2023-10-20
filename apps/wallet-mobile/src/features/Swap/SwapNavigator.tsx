import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs'
import {useSwap, useSwapTokensByPairToken} from '@yoroi/swap'
import React from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {StatusBar} from '../../components'
import {defaultMaterialTopTabNavigationOptions, SwapTabRoutes} from '../../navigation'
import {useSelectedWallet} from '../../SelectedWallet'
import {COLORS} from '../../theme'
import {useBalance, useHideBottomTabBar} from '../../yoroi-wallets/hooks'
import {useStrings} from './common/strings'
import {CreateOrder} from './useCases/StartSwapScreen/CreateOrder/CreateOrder'
import {ListOrders} from './useCases/StartSwapScreen/ListOrders/ListOrders'

const Tab = createMaterialTopTabNavigator<SwapTabRoutes>()
export const SwapTabNavigator = () => {
  const strings = useStrings()
  
  useHideBottomTabBar()

  // state data
  const wallet = useSelectedWallet()
  const {aggregatorTokenId, lpTokenHeldChanged, frontendFeeTiers, frontendFeeTiersChanged} = useSwap()
  const lpTokenHeld = useBalance({wallet, tokenId: aggregatorTokenId})

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
  const {refetch} = useSwapTokensByPairToken('', {suspense: false, enabled: false})
  React.useEffect(() => {
    refetch()
  }, [refetch])

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
