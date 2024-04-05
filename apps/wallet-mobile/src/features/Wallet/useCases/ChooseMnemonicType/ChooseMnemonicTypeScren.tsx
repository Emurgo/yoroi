import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import {useWalletSetup} from '@yoroi/wallet-setup'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Space} from '../../../../components/Space/Space'
import {WalletInitRouteNavigation} from '../../../../navigation'
import {ButtonCard} from '../../common/ButtonCard/ButtonCard'
import {LogoBanner} from '../../common/LogoBanner/LogoBanner'
// import {useStrings} from '../common/useStrings'

export const ChooseMnemonicTypeScreen = () => {
  const {styles} = useStyles()
  // const strings = useStrings()
  const {mnemonicTypeChanged} = useWalletSetup()

  const navigation = useNavigation<WalletInitRouteNavigation>()

  const handle15Words = () => {
    mnemonicTypeChanged(15)
    navigation.navigate('add-wallet-restore-form')
  }

  const handle24Words = () => {
    mnemonicTypeChanged(24)
    navigation.navigate('add-wallet-restore-form')
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <Space height="l" />

      <LogoBanner />

      <Space height="xl" />

      <View>
        <ButtonCard title="15 word recovery phrase" icon="create" onPress={handle15Words} />

        <Space height="l" />

        <ButtonCard title="24 word recovery phrase" icon="restore" onPress={handle24Words} />

        <Space height="l" />
      </View>
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
