import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useMetrics} from '~/kernel/metrics/metricsManager'
import {LogoBanner} from '~/ui/LogoBanner/LogoBanner'
import {Space} from '~/ui/Space/Space'
import {ButtonCard} from '../../common/ButtonCard/ButtonCard'
import {useStrings} from '../../common/useStrings'
import {Mnemonic15Words} from '../../illustrations/Mnemonic15Words'
import {Mnemonic24Words} from '../../illustrations/Mnemonic24Words'

export const ChooseMnemonicTypeScreen = () => {
  const strings = useStrings()
  const {mnemonicTypeChanged} = useSetupWallet()
  const {track} = useMetrics()
  const {palette: p} = useTheme()

  const navigation = useNavigation<any>()

  const handle15Words = () => {
    mnemonicTypeChanged(15)
    navigation.navigate('setup-wallet-restore-form')
  }

  const handle24Words = () => {
    mnemonicTypeChanged(24)
    navigation.navigate('setup-wallet-restore-form')
  }

  useFocusEffect(
    React.useCallback(() => {
      track.restoreWalletTypeStepViewed()
    }, [track]),
  )

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[a.flex_1, a.px_lg, {backgroundColor: p.bg_color_max}]}
    >
      <Space.Height.lg />

      <LogoBanner />

      <Space.Height.xl />

      <View>
        <ButtonCard
          title={strings.choose15WordsMnemonicTitle}
          icon={<Mnemonic15Words style={[a.absolute, {right: 0}]} />}
          onPress={handle15Words}
          testID="mnemonic-15-word"
        />

        <Space.Height.lg />

        <ButtonCard
          title={strings.choose24WordsMnemonicTitle}
          icon={<Mnemonic24Words style={[a.absolute, {right: 0}]} />}
          onPress={handle24Words}
          testID="mnemonic-24-word"
        />

        <Space.Height.lg />
      </View>
    </SafeAreaView>
  )
}
