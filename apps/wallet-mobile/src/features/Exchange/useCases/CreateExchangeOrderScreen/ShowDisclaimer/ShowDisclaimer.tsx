import {useExchange} from '@yoroi/exchange'
import {useTheme} from '@yoroi/theme'
import {Chain} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Space} from '../../../../../components/Space/Space'
import {useWalletManager} from '../../../../WalletManager/context/WalletManagerProvider'
import {useStrings} from '../../../common/useStrings'

export const ShowDisclaimer = () => {
  const {color} = useTheme()
  const strings = useStrings()
  const styles = useStyles()
  const {
    selected: {network},
  } = useWalletManager()
  const {orderType} = useExchange()

  const isPreprod = network === Chain.Network.Preprod
  const isSancho = network === Chain.Network.Sancho

  if ((isPreprod || isSancho) && orderType === 'buy') return null

  const contentDisclaimer =
    (isPreprod || isSancho) && orderType === 'sell' ? strings.contentDisclaimerPreprod : strings.contentDisclaimer

  return (
    <>
      <Space height="xl" />

      <LinearGradient style={styles.gradient} start={{x: 1, y: 1}} end={{x: 0, y: 0}} colors={color.bg_gradient_1}>
        <View style={styles.container}>
          <Text style={styles.title}>{strings.disclaimer}</Text>

          <Text style={styles.text}>{contentDisclaimer}</Text>
        </View>
      </LinearGradient>
    </>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    gradient: {
      opacity: 1,
      borderRadius: 8,
    },
    title: {
      ...atoms.body_1_lg_regular,
      color: color.gray_max,
      fontWeight: '500',
    },
    text: {
      ...atoms.body_2_md_regular,
      marginTop: 8,
      color: color.gray_max,
    },
  })

  return styles
}
