import React from 'react'
import {View} from 'react-native'

import ActionsBanner from './ActionsBanner'
import BalanceBanner from './BalanceBanner'
import TabNavigator from './TabNavigator'

const WalletHeader = () => {
  return (
    <View>
      <ActionsBanner />
      <BalanceBanner />
      <TabNavigator />
    </View>
  )
}

export  default WalletHeader