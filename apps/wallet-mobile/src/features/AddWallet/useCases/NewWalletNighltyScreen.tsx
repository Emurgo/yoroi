import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import {useWalletSetup, WalletSetupState} from '@yoroi/wallet-setup'
import * as React from 'react'
import {ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Space} from '../../../components/Space/Space'
import {WalletInitRouteNavigation} from '../../../navigation'
import * as HASKELL_SHELLEY from '../../../yoroi-wallets/cardano/constants/mainnet/constants'
import * as SANCHONET from '../../../yoroi-wallets/cardano/constants/sanchonet/constants'
import * as HASKELL_SHELLEY_TESTNET from '../../../yoroi-wallets/cardano/constants/testnet/constants'
import {ButtonCard} from '../common/ButtonCard/ButtonCard'
import {LogoBanner} from '../common/LogoBanner/LogoBanner'
import {useStrings} from '../common/useStrings'

export const NewWalletNighltyScreen = () => {
  const {styles} = useStyles()
  const strings = useStrings()
  const {networkIdChanged, setUpType} = useWalletSetup()

  const navigateTo = useNavigateTo()

  const handleMainnet = () => {
    networkIdChanged(HASKELL_SHELLEY.NETWORK_ID)
    navigateToFlow(setUpType, navigateTo)
  }

  const handleRestore = () => {
    networkIdChanged(HASKELL_SHELLEY_TESTNET.NETWORK_ID)
    navigateToFlow(setUpType, navigateTo)
  }

  const handleHw = () => {
    networkIdChanged(SANCHONET.NETWORK_ID)
    navigateToFlow(setUpType, navigateTo)
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <Space height="l" />

      <LogoBanner />

      <Space height="xl" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <ButtonCard
            title={strings.cardanoMainnet}
            subTitle={strings.cardanoMainnetDescription}
            onPress={handleMainnet}
          />

          <Space height="l" />

          <ButtonCard
            title={strings.cardanoTestnet}
            subTitle={strings.cardanoTestnetDescription}
            onPress={handleRestore}
          />

          <Space height="l" />

          <ButtonCard
            title={strings.cardanoSanchonet}
            subTitle={strings.cardanoSanchonetDescription}
            onPress={handleHw}
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

const navigateToFlow = (setUpType: WalletSetupState['setUpType'], navigateTo: ReturnType<typeof useNavigateTo>) => {
  switch (setUpType) {
    case 'create':
      navigateTo.create()
      return

    case 'restore':
      navigateTo.restore()
      return

    case 'hw':
      navigateTo.hw()
      return
  }
}

export const useNavigateTo = () => {
  const navigation = useNavigation<WalletInitRouteNavigation>()

  return React.useRef({
    create: () => navigation.navigate('about-recovery-phase'),
    restore: () => navigation.navigate('restore-wallet-form'),
    hw: () => navigation.navigate('check-nano-x'),
  }).current
}
