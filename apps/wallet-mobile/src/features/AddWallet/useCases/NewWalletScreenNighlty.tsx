import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {StatusBar} from '../../../components'
import {Space} from '../../../components/Space/Space'
import {ButtonCard} from '../common/ButtonCard/ButtonCard'
import {LogoBanner} from '../common/LogoBanner/LogoBanner'
import {useStrings} from '../common/useStrings'

export const NewWalletScreenNighlty = () => {
  const {styles} = useStyles()
  const strings = useStrings()

  const navigation = useNavigation()

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <StatusBar type="light" />

      <Space height="l" />

      <LogoBanner />

      <Space height="xl" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <ButtonCard
            title={strings.cardanoMainnet}
            subTitle={strings.cardanoMainnetDescription}
            onPress={() =>
              navigation.navigate('new-wallet', {
                screen: 'about-recovery-phrase',
              })
            }
          />

          <Space height="l" />

          <ButtonCard
            title={strings.cardanoTestnet}
            subTitle={strings.cardanoTestnetDescription}
            onPress={() => {
              ;('')
            }}
          />

          <Space height="l" />

          <ButtonCard
            title={strings.cardanoSanchonet}
            subTitle={strings.cardanoSanchonetDescription}
            onPress={() => {
              ;('')
            }}
          />

          <Space height="l" />
        </View>
      </ScrollView>
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
