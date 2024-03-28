import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Space} from '../../../components/Space/Space'
import {WalletInitRouteNavigation} from '../../../navigation'
import {ButtonCard} from '../common/ButtonCard/ButtonCard'
import {LogoBanner} from '../common/LogoBanner/LogoBanner'
import {useStrings} from '../common/useStrings'

export const WalletInitScreen = () => {
  const {styles} = useStyles()
  const strings = useStrings()

  const navigation = useNavigation<WalletInitRouteNavigation>()

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <Space height="l" />

      <LogoBanner />

      <Space height="xl" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <ButtonCard
            title={strings.createWalletButtonCard}
            icon="create"
            onPress={() => navigation.navigate('about-recovery-phase')}
          />

          <Space height="l" />

          <ButtonCard
            title={strings.restoreWalletButtonCard}
            icon="restore"
            onPress={() =>
              navigation.navigate('restore-wallet-form', {
                networkId: 1,
                walletImplementationId: 'haskell-shelley',
              })
            }
          />

          <Space height="l" />

          <ButtonCard
            title={strings.connectWalletButtonCard}
            icon="hardware"
            onPress={() => {
              navigation.navigate('check-nano-x', {
                networkId: 1,
                walletImplementationId: 'haskell-byron',
                useUSB: false,
              })
            }}
          />

          <Space height="l" />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      ...theme.padding['x-l'],
      backgroundColor: theme.color['white-static'],
    },
  })

  return {styles} as const
}
