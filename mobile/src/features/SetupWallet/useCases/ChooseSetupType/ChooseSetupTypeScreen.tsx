import {useSetupWallet} from '@yoroi/setup-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'

import {useFocusEffect, useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {ScrollView, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {isIOS} from '~/kernel/constants'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {SetupWalletRouteNavigation} from '~/kernel/navigation/types'
import {HardwareWallet} from '~/ui/HardwareWalletIllustration/HardwareWalletIllustration'
import {LogoBanner} from '~/ui/LogoBanner/LogoBanner'
import {useModal} from '~/ui/Modal/ModalContext'
import {Space} from '~/ui/Space/Space'

import {ButtonCard} from '../../common/ButtonCard/ButtonCard'
import {CreateWallet} from '../../illustrations/CreateWallet'
import {RestoreWallet} from '../../illustrations/RestoreWallet'
import {
  SelectHwConnectionModal,
  SelectHwConnectionModalFooter,
} from '../RestoreHwWallet/SelectHwConnectionModal'

export const ChooseSetupTypeScreen = () => {
  const {atoms: ta} = useTheme()
  const strings = useStrings()
  const {walletImplementationChanged, setupTypeChanged} = useSetupWallet()
  const {openModal, closeModal} = useModal()
  const {track} = useMetrics()

  useFocusEffect(
    React.useCallback(() => {
      track.createWalletSelectMethodPageViewed()
    }, [track]),
  )

  const navigation = useNavigation<SetupWalletRouteNavigation>()

  const handleCreate = () => {
    walletImplementationChanged('cardano-cip1852')
    setupTypeChanged('create')

    navigation.navigate('setup-wallet-about-recovery-phase')
  }

  const handleRestore = () => {
    walletImplementationChanged('cardano-cip1852')
    setupTypeChanged('restore')

    navigation.navigate('setup-wallet-restore-choose-mnemonic-type')
  }

  const handleHw = () => {
    openModal({
      title: strings.setupWallet.hwModalTitle,
      content: <SelectHwConnectionModal />,
      footer: <SelectHwConnectionModalFooter closeModal={() => closeModal()} />,
      height: isIOS ? 180 : 250,
    })
  }

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[a.flex_1, ta.bg_color_max, a.px_lg]}
    >
      <Space.Height.lg />

      <LogoBanner />

      <Space.Height.xl />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <ButtonCard
            title={strings.setupWallet.createWalletButtonCard}
            icon={<CreateWallet style={[a.absolute, {right: 0}]} />}
            onPress={handleCreate}
            testID="setup-create-new-wallet-button"
          />

          <Space.Height.lg />

          <ButtonCard
            title={strings.setupWallet.restoreWalletButtonCard}
            icon={<RestoreWallet style={[a.absolute, {right: 0}]} />}
            onPress={handleRestore}
            testID="setup-restore-wallet-button"
          />

          <Space.Height.lg />

          <ButtonCard
            title={strings.setupWallet.connectWalletButtonCard}
            icon={<HardwareWallet style={[a.absolute, {right: 0}]} />}
            onPress={handleHw}
            testID="setup-connect-HW-wallet-button"
          />

          <Space.Height.lg />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
