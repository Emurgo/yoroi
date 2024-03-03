import * as React from 'react'
import {ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Spacer, StatusBar} from '../../../components'
import {ButtonCard} from '../common/ButtonCard/ButtonCard'
import {LogoBanner} from '../common/LogoBanner/LogoBanner'
// import {useStrings} from '../common/useStrings'

export const WalletInitScreen = () => {
  const {styles} = useStyles()
  //   const strings = useStrings()

  return (
    <SafeAreaView edges={['left', 'right', 'top', 'bottom']} style={styles.container}>
      <StatusBar type="light" />

      <LogoBanner />

      <Spacer height={24} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.buttonGroup}>
          <ButtonCard
            title="Create new wallet"
            icon="create"
            onPress={() => {
              ;('')
            }}
          />

          <ButtonCard
            title="Restore Yoroi existing wallet"
            subTitle="Create new wallet"
            icon="restore"
            onPress={() => {
              ;('')
            }}
          />

          <ButtonCard
            title="Conecte o dispositivo de carteira de hardware"
            icon="hardware"
            onPress={() => {
              ;('')
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 16,
    },
    buttonGroup: {
      gap: 16,
    },
  })

  return {styles} as const
}
