import AsyncStorage from '@react-native-async-storage/async-storage'
import {governanceApiMaker, governanceManagerMaker, GovernanceProvider} from '@yoroi/staking'
import React, {useMemo} from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {StatusBar} from '../../../components'
import {useSelectedWallet} from '../../../SelectedWallet'
import {COLORS} from '../../../theme'
import {CardanoMobile} from '../../../yoroi-wallets/wallets'

export const GovernanceNavigator = () => {
  const {networkId} = useSelectedWallet()
  const manager = useMemo(
    () =>
      governanceManagerMaker({
        networkId,
        api: governanceApiMaker({networkId}),
        cardano: CardanoMobile,
        storage: AsyncStorage,
      }),
    [networkId],
  )
  return (
    <GovernanceProvider manager={manager}>
      <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.root}>
        <StatusBar type="light" />
      </SafeAreaView>
    </GovernanceProvider>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
})
