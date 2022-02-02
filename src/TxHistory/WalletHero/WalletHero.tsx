import React from 'react'
import {StyleSheet, View} from 'react-native'

import {UI_V2} from '../../../legacy/config/config'
import {COLORS} from '../../../legacy/styles/config'
import {ActionsBanner} from './ActionsBanner'
import {BalanceBanner} from './BalanceBanner'
import {TabNavigator} from './TabNavigator'

type WalletHeroProps = {
  render: (active: number) => JSX.Element | undefined
}

export const WalletHero = ({render}: WalletHeroProps) => {
  return (
    <View style={styles.root}>
      <BalanceBanner />
      {UI_V2 && <ActionsBanner />}
      <TabNavigator render={render} />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_GRAY,
  },
})
