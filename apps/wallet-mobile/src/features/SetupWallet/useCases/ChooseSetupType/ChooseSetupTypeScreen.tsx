import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Space} from '../../../../components/Space/Space'
import {LedgerTransportSwitchModal} from '../../../../HW'
import {isProduction} from '../../../../legacy/config'
import {useMetrics} from '../../../../metrics/metricsManager'
import {WalletInitRouteNavigation} from '../../../../navigation'
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
  const {networkIdChanged, setUpTypeChanged, useUSBChanged: USBChanged} = useSetupWallet()
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const {track} = useMetrics()

  useFocusEffect(
    React.useCallback(() => {
      track.createWalletSelectMethodPageViewed()
    }, [track]),
  )

  const navigation = useNavigation<WalletInitRouteNavigation>()

  const handleCreate = () => {
    setUpTypeChanged('create')

    if (isProduction()) {
      networkIdChanged(HASKELL_SHELLEY.NETWORK_ID)
      navigation.navigate('setup-wallet-about-recovery-phase')
      return
    }

    navigation.navigate('setup-wallet-choose-network')
  }

  const handleRestore = () => {
    setUpTypeChanged('restore')

    if (isProduction()) {
      networkIdChanged(HASKELL_SHELLEY.NETWORK_ID)
      navigation.navigate('setup-wallet-choose-mnemonic-type')
      return
    }

    navigation.navigate('setup-wallet-choose-network')
  }

  const handleHw = () => {
    setIsModalOpen(true)
  }

  const navigateHw = () => {
    setIsModalOpen(false)
    setUpTypeChanged('hw')

    if (isProduction()) {
      networkIdChanged(HASKELL_SHELLEY.NETWORK_ID)
      navigation.navigate('setup-wallet-check-nano-x')
      return
    }

    navigation.navigate('setup-wallet-choose-network')
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <Space height="l" />

      <LogoBanner />

      <Space height="xl" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <ButtonCard
            title={strings.createWalletButtonCard}
            icon={<CreateWallet style={styles.icon} />}
            onPress={handleCreate}
          />

          <Space height="l" />

          <ButtonCard
            title={strings.restoreWalletButtonCard}
            icon={<RestoreWallet style={styles.icon} />}
            onPress={handleRestore}
          />

          <Space height="l" />

          <ButtonCard
            title={strings.connectWalletButtonCard}
            icon={<HardwareWallet style={styles.icon} />}
            onPress={handleHw}
          />

          <Space height="l" />
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
      backgroundColor: color.white_static,
    },
    icon: {
      position: 'absolute',
      right: 0,
    },
  })

  return {styles} as const
}
