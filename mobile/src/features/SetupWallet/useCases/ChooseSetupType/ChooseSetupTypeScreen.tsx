import {useSetupWallet} from '@yoroi/setup-wallet'
import {atoms as a} from '@yoroi/theme'

import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {ScrollView, View} from 'react-native'

import {usePageViewTracking} from '~/features/Analytics/hooks/usePageViewTracking'
import {isIOS} from '~/kernel/constants'
import {useStrings} from '~/kernel/i18n/useStrings'
import {SetupWalletRouteNavigation} from '~/kernel/navigation/types'
import {HardwareWallet} from '~/ui/HardwareWalletIllustration/HardwareWalletIllustration'
import {LogoBanner} from '~/ui/LogoBanner/LogoBanner'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'

import {ButtonCard} from '../../common/ButtonCard/ButtonCard'
import {CreateWallet} from '../../illustrations/CreateWallet'
import {RestoreWallet} from '../../illustrations/RestoreWallet'
import {SelectHwConnectionModal} from '../RestoreHwWallet/SelectHwConnectionModal'

export const ChooseSetupTypeScreen = () => {
  const strings = useStrings()
  const {walletImplementationChanged, setupTypeChanged} = useSetupWallet()
  const {openModal} = useModal()

  usePageViewTracking('Create Wallet Select Method Page Viewed')

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
      content: React.createElement(SelectHwConnectionModal.Content),
      footer: React.createElement(SelectHwConnectionModal.Footer),
      withFeedback: true,
      height: isIOS ? 250 : 300,
    })
  }

  return (
    <SafeArea>
      <Space.Height.lg />

      <LogoBanner />

      <Space.Height.xl />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[a.px_lg]}
      >
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
    </SafeArea>
  )
}
