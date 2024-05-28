import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Space} from '../../../../components/Space/Space'
import {isProduction} from '../../../../kernel/env'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {WalletInitRouteNavigation} from '../../../../kernel/navigation'
import {LedgerTransportSwitchModal} from '../../../../legacy/HW'
import * as HASKELL_SHELLEY from '../../../../yoroi-wallets/cardano/constants/mainnet/constants'
import {ButtonCard} from '../../common/ButtonCard/ButtonCard'
import {LogoBanner} from '../../common/LogoBanner/LogoBanner'
import {useStrings} from '../../common/useStrings'
import {CreateWallet} from '../../illustrations/CreateWallet'
import {HardwareWallet} from '../../illustrations/HardwareWallet'
import {RestoreWallet} from '../../illustrations/RestoreWallet'

export const ChooseSetupTypeScreen = () => {
  const {styles} = useStyles()
  const strings = useStrings()
  const {
    walletImplementationIdChanged,
    networkIdChanged,
    setUpTypeChanged,
    useUSBChanged: USBChanged,
  } = useSetupWallet()
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const {track} = useMetrics()

  useFocusEffect(
    React.useCallback(() => {
      track.createWalletSelectMethodPageViewed()
    }, [track]),
  )

  const navigation = useNavigation<WalletInitRouteNavigation>()

  const handleCreate = () => {
    walletImplementationIdChanged(HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID)
    setUpTypeChanged('create')

    if (isProduction) {
      networkIdChanged(HASKELL_SHELLEY.NETWORK_ID)
      navigation.navigate('setup-wallet-about-recovery-phase')
      return
    }

    // On production the step of network is skipped
    navigation.navigate('setup-wallet-create-choose-network')
  }

  const handleRestore = () => {
    walletImplementationIdChanged(HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID)
    setUpTypeChanged('restore')

    if (isProduction) {
      networkIdChanged(HASKELL_SHELLEY.NETWORK_ID)
      navigation.navigate('setup-wallet-restore-choose-mnemonic-type')
      return
    }

    // On production the step of network is skipped
    navigation.navigate('setup-wallet-restore-choose-network')
  }

  const handleHw = () => {
    setIsModalOpen(true)
  }

  const navigateHw = () => {
    setIsModalOpen(false)
    walletImplementationIdChanged(HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID)
    setUpTypeChanged('hw')

    if (isProduction) {
      networkIdChanged(HASKELL_SHELLEY.NETWORK_ID)
      navigation.navigate('setup-wallet-check-nano-x')
      return
    }

    // On production the step of network is skipped
    navigation.navigate('setup-wallet-restore-choose-network')
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <Space height="lg" />

      <LogoBanner />

      <Space height="xl" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <ButtonCard
            title={strings.createWalletButtonCard}
            icon={<CreateWallet style={styles.icon} />}
            onPress={handleCreate}
            testId="setup-create-new-wallet-button"
          />

          <Space height="lg" />

          <ButtonCard
            title={strings.restoreWalletButtonCard}
            icon={<RestoreWallet style={styles.icon} />}
            onPress={handleRestore}
            testId="setup-restore-wallet-button"
          />

          <Space height="lg" />

          <ButtonCard
            title={strings.connectWalletButtonCard}
            icon={<HardwareWallet style={styles.icon} />}
            onPress={handleHw}
            testId="setup-connect-HW-wallet-button"
          />

          <Space height="lg" />
        </View>
      </ScrollView>

      <LedgerTransportSwitchModal
        visible={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        onSelectUSB={() => {
          USBChanged(true)
          navigateHw()
        }}
        onSelectBLE={() => {
          USBChanged(false)
          navigateHw()
        }}
        showCloseIcon
      />
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      ...atoms.px_lg,
      backgroundColor: color.gray_cmin,
    },
    icon: {
      position: 'absolute',
      right: 0,
    },
  })

  return {styles} as const
}
