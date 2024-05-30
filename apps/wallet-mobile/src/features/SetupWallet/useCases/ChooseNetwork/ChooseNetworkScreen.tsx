import {useNavigation} from '@react-navigation/native'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Space} from '../../../../components/Space/Space'
import {SetupWalletRouteNavigation} from '../../../../kernel/navigation'
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
      <Space height="lg" />

      <LogoBanner />

      <Space height="xl" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <ButtonCard
            title={strings.cardanoMainnet}
            subTitle={strings.cardanoMainnetDescription}
            onPress={handleMainnet}
            testId="setup-network-select-mainnet-button"
          />

          <Space height="lg" />

          <ButtonCard
            title={strings.cardanoTestnet}
            subTitle={strings.cardanoTestnetDescription}
            onPress={handleTestnet}
            testId="setup-network-select-testnet-button"
          />

          <Space height="lg" />

          <ButtonCard
            title={strings.cardanoSanchonet}
            subTitle={strings.cardanoSanchonetDescription}
            onPress={handleSanchonet}
            testId="setup-network-select-sanchonet-button"
          />

          <Space height="lg" />
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
  const navigation = useNavigation<SetupWalletRouteNavigation>()

  return React.useRef({
    create: () => navigation.navigate('setup-wallet-about-recovery-phase'),
    restore: () => navigation.navigate('setup-wallet-restore-form'),
    mnemonicType: () => navigation.navigate('setup-wallet-restore-choose-mnemonic-type'),
    hw: () => navigation.navigate('setup-wallet-check-nano-x'),
  }).current
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      ...atoms.px_lg,
      backgroundColor: color.gray_cmin,
    },
  })

  return {styles} as const
}
