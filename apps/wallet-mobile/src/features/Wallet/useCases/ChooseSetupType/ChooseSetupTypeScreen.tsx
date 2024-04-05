import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import {useWalletSetup} from '@yoroi/wallet-setup'
import * as React from 'react'
import {ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Space} from '../../../../components/Space/Space'
import {LedgerTransportSwitchModal} from '../../../../HW'
import {isProduction} from '../../../../legacy/config'
import {WalletInitRouteNavigation} from '../../../../navigation'
import * as HASKELL_SHELLEY from '../../../../yoroi-wallets/cardano/constants/mainnet/constants'
import {ButtonCard} from '../../common/ButtonCard/ButtonCard'
import {LogoBanner} from '../../common/LogoBanner/LogoBanner'
import {useStrings} from '../../common/useStrings'

export const ChooseSetupTypeScreen = () => {
  const {styles} = useStyles()
  const strings = useStrings()
  const {networkIdChanged, setUpTypeChanged, useUSBChanged: USBChanged} = useWalletSetup()
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  const navigation = useNavigation<WalletInitRouteNavigation>()

  const handleCreate = () => {
    setUpTypeChanged('create')

    if (isProduction()) {
      networkIdChanged(HASKELL_SHELLEY.NETWORK_ID)
      navigation.navigate('add-wallet-about-recovery-phase')
      return
    }

    navigation.navigate('add-wallet-choose-network')
  }

  const handleRestore = () => {
    setUpTypeChanged('restore')

    if (isProduction()) {
      networkIdChanged(HASKELL_SHELLEY.NETWORK_ID)
      navigation.navigate('add-wallet-choose-mnemonic-type')
      return
    }

    navigation.navigate('add-wallet-choose-network')
  }

  const handleHw = () => {
    setIsModalOpen(true)
  }

  const navigateHw = () => {
    setIsModalOpen(false)
    setUpTypeChanged('hw')

    if (isProduction()) {
      networkIdChanged(HASKELL_SHELLEY.NETWORK_ID)
      navigation.navigate('add-wallet-check-nano-x')
      return
    }

    navigation.navigate('add-wallet-choose-network')
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <Space height="l" />

      <LogoBanner />

      <Space height="xl" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <ButtonCard title={strings.createWalletButtonCard} icon="create" onPress={handleCreate} />

          <Space height="l" />

          <ButtonCard title={strings.restoreWalletButtonCard} icon="restore" onPress={handleRestore} />

          <Space height="l" />

          <ButtonCard title={strings.connectWalletButtonCard} icon="hardware" onPress={handleHw} />

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