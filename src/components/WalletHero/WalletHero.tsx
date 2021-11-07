import React from 'react'
import {StyleSheet, View} from 'react-native'

import {COLORS} from '../../../legacy/styles/config'
import ActionsBanner from './ActionsBanner'
import BalanceBanner from './BalanceBanner'
import TabNavigator from './TabNavigator'

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_GRAY,
  },
})
interface WalletHeroProps {
  tabs: Array<string>
  render: ({active: boolean}) => JSX.Element
}

const WalletHero = (props: WalletHeroProps) => {
  return (
    <View style={styles.root}>
      <BalanceBanner />
      <ActionsBanner />
      <TabNavigator {...props} />
    </View>
  )
}

export default WalletHero
