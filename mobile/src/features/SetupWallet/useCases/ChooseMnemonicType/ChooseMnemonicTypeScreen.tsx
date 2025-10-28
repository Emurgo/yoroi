import {useSetupWallet} from '@yoroi/setup-wallet'
import {atoms as a} from '@yoroi/theme'

import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {LogoBanner} from '~/ui/LogoBanner/LogoBanner'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'

import {ButtonCard} from '../../common/ButtonCard/ButtonCard'
import {Mnemonic15Words} from '../../illustrations/Mnemonic15Words'
import {Mnemonic24Words} from '../../illustrations/Mnemonic24Words'

export const ChooseMnemonicTypeScreen = () => {
  const strings = useStrings()
  const {mnemonicTypeChanged} = useSetupWallet()
  const navigation = useNavigation<any>()

  const handle15Words = () => {
    mnemonicTypeChanged(15)
    navigation.navigate('setup-wallet-restore-form')
  }

  const handle24Words = () => {
    mnemonicTypeChanged(24)
    navigation.navigate('setup-wallet-restore-form')
  }

  return (
    <SafeArea style={a.px_lg}>
      <Space.Height.lg />

      <LogoBanner />

      <Space.Height.xl />

      <View style={a.gap_lg}>
        <ButtonCard
          title={strings.setupWallet.choose15WordsMnemonicTitle}
          icon={<Mnemonic15Words style={[a.absolute, {right: 0}]} />}
          onPress={handle15Words}
          testID="mnemonic-15-word"
        />

        <ButtonCard
          title={strings.setupWallet.choose24WordsMnemonicTitle}
          icon={<Mnemonic24Words style={[a.absolute, {right: 0}]} />}
          onPress={handle24Words}
          testID="mnemonic-24-word"
        />
      </View>
    </SafeArea>
  )
}
