import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {ScrollView, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {LogoBanner} from '../../../../ui/LogoBanner/LogoBanner'
import {useModal} from '../../../../ui/Modal/ModalContext'
import {Space} from '../../../../ui/Space/Space'
import {ButtonCard} from '../../common/ButtonCard/ButtonCard'
import {useStrings} from '../../common/useStrings'
// import {SelectHwConnectionModal} from '../RestoreHwWallet/SelectHwConnectionModal'

export const ChooseSetupTypeScreen = () => {
  const {palette: p} = useTheme()
  const strings = useStrings()
  const {walletImplementationChanged, setupTypeChanged} = useSetupWallet()
  const {openModal} = useModal()
  const {track} = useMetrics()

  useFocusEffect(
    React.useCallback(() => {
      track.createWalletSelectMethodPageViewed()
    }, [track]),
  )

  const navigation = useNavigation<any>()

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

  /* const handleHw = () => {
    openModal({
      // title: strings.hwModalTitle,
      content: <SelectHwConnectionModal />,
      // height: 305,
    })
  } */

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[{flex: 1, backgroundColor: p.bg_color_max}, a.px_lg]}
    >
      <Space.Height.lg />

      <LogoBanner />

      <Space.Height.xl />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <ButtonCard
            title={strings.createWalletButtonCard}
            // icon={<CreateWallet style={position: 'absolute', right: 0} />}
            onPress={handleCreate}
            testID="setup-create-new-wallet-button"
          />

          <Space.Height.lg />

          <ButtonCard
            title={strings.restoreWalletButtonCard}
            // icon={<RestoreWallet style={position: 'absolute', right: 0} />}
            onPress={handleRestore}
            testID="setup-restore-wallet-button"
          />

          <Space.Height.lg />
          {/*
          <ButtonCard
            title={strings.connectWalletButtonCard}
            // icon={<HardwareWallet style={position: 'absolute', right: 0} />}
            onPress={handleHw}
            testID="setup-connect-HW-wallet-button"
          /> */}

          <Space.Height.lg />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
