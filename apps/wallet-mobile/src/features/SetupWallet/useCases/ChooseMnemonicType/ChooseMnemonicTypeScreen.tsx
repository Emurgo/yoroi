import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Space} from '../../../../components/Space/Space'
import {useMetrics} from '../../../../metrics/metricsManager'
import {WalletInitRouteNavigation} from '../../../../navigation'
import {ButtonCard} from '../../common/ButtonCard/ButtonCard'
import {LogoBanner} from '../../common/LogoBanner/LogoBanner'
import {useStrings} from '../../common/useStrings'
import {Mnemonic15Words} from '../../illustrations/Mnemonic15Words'
import {Mnemonic24Words} from '../../illustrations/Mnemonic24Words'

export const ChooseMnemonicTypeScreen = () => {
  const {styles} = useStyles()
  const strings = useStrings()
  const {mnemonicTypeChanged} = useSetupWallet()
  const {track} = useMetrics()

  const navigation = useNavigation<WalletInitRouteNavigation>()

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
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <Space height="lg" />

      <LogoBanner />

      <Space height="xl" />

      <View>
        <ButtonCard
          title={strings.choose15WordsMnemonicTitle}
          icon={<Mnemonic15Words style={styles.icon} />}
          onPress={handle15Words}
        />

        <Space height="lg" />

        <ButtonCard
          title={strings.choose24WordsMnemonicTitle}
          icon={<Mnemonic24Words style={styles.icon} />}
          onPress={handle24Words}
        />

        <Space height="lg" />
      </View>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
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
