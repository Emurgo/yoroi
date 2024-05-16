import {useNavigation} from '@react-navigation/native'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Space} from '../../../../components/Space/Space'
import {WalletInitRouteNavigation} from '../../../../navigation'
import * as HASKELL_SHELLEY from '../../../../yoroi-wallets/cardano/constants/mainnet/constants'
import * as SANCHONET from '../../../../yoroi-wallets/cardano/constants/sanchonet/constants'
import * as HASKELL_SHELLEY_TESTNET from '../../../../yoroi-wallets/cardano/constants/testnet/constants'
import {ButtonCard} from '../../common/ButtonCard/ButtonCard'
import {LogoBanner} from '../../common/LogoBanner/LogoBanner'
import {useStrings} from '../../common/useStrings'

export const ChooseNetworkScreen = () => {
  const {styles} = useStyles()
  const strings = useStrings()
  const {networkIdChanged} = useSetupWallet()
  const navigate = useNavigate()

  const handleMainnet = () => {
    networkIdChanged(HASKELL_SHELLEY.NETWORK_ID)
    navigate?.()
  }

  const handleTestnet = () => {
    networkIdChanged(HASKELL_SHELLEY_TESTNET.NETWORK_ID)
    navigate?.()
  }

  const handleSanchonet = () => {
    networkIdChanged(SANCHONET.NETWORK_ID)
    navigate?.()
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
            onPress={handleTestnet}
          />

          <Space height="l" />

          <ButtonCard
            title={strings.cardanoSanchonet}
            subTitle={strings.cardanoSanchonetDescription}
            onPress={handleSanchonet}
          />

          <Space height="l" />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const useNavigate = () => {
  const {setUpType} = useSetupWallet()
  const navigateTo = useNavigateTo()

  switch (setUpType) {
    case 'create':
      return () => navigateTo.create()

    case 'restore':
      return () => navigateTo.mnemonicType()

    case 'hw':
      return () => navigateTo.hw()
  }
}

export const useNavigateTo = () => {
  const navigation = useNavigation<WalletInitRouteNavigation>()

  return React.useRef({
    create: () => navigation.navigate('setup-wallet-about-recovery-phase'),
    restore: () => navigation.navigate('setup-wallet-restore-form'),
    mnemonicType: () => navigation.navigate('setup-wallet-restore-choose-mnemonic-type'),
    hw: () => navigation.navigate('setup-wallet-check-nano-x'),
  }).current
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
