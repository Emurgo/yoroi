import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useModal} from '../../../../components'
import {Space} from '../../../../components/Space/Space'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {SetupWalletRouteNavigation} from '../../../../kernel/navigation'
import {LedgerTransportSwitch} from '../../../../legacy/HW'
import {useWalletManager} from '../../../WalletManager/context/WalletManagerProvider'
import {ButtonCard} from '../../common/ButtonCard/ButtonCard'
import {LogoBanner} from '../../common/LogoBanner/LogoBanner'
import {useStrings} from '../../common/useStrings'
import {CreateWallet} from '../../illustrations/CreateWallet'
import {HardwareWallet} from '../../illustrations/HardwareWallet'
import {RestoreWallet} from '../../illustrations/RestoreWallet'

export const ChooseSetupTypeScreen = () => {
  const {styles} = useStyles()
  const strings = useStrings()
  const {walletImplementationChanged, setUpTypeChanged, useUSBChanged: USBChanged} = useSetupWallet()
  const {openModal} = useModal()
  const {track} = useMetrics()
  const {selected, walletManager} = useWalletManager()

  useFocusEffect(
    React.useCallback(() => {
      track.createWalletSelectMethodPageViewed()
    }, [track]),
  )

  const navigation = useNavigation<SetupWalletRouteNavigation>()

  const handleCreate = () => {
    walletImplementationChanged('cardano-cip1852')
    setUpTypeChanged('create')
    walletManager.setSelectedNetwork(selected.network)

    navigation.navigate('setup-wallet-about-recovery-phase')
  }

  const handleRestore = () => {
    walletImplementationChanged('cardano-cip1852')
    setUpTypeChanged('restore')
    walletManager.setSelectedNetwork(selected.network)

    navigation.navigate('setup-wallet-restore-choose-mnemonic-type')
  }

  const handleHw = () => {
    openModal(
      '',
      <LedgerTransportSwitch
        onSelectUSB={() => {
          USBChanged(true)
          navigateHw()
        }}
        onSelectBLE={() => {
          USBChanged(false)
          navigateHw()
        }}
      />,
      350,
    )
  }

  const navigateHw = () => {
    walletImplementationChanged('cardano-cip1852')
    setUpTypeChanged('hw')
    walletManager.setSelectedNetwork(selected.network)

    navigation.navigate('setup-wallet-check-nano-x')
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
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      ...atoms.px_lg,
      backgroundColor: color.bg_color_high,
    },
    icon: {
      position: 'absolute',
      right: 0,
    },
  })

  return {styles} as const
}
