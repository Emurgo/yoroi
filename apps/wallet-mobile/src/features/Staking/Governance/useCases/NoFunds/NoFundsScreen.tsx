import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import {Chain} from '@yoroi/types'
import React from 'react'
import {Linking, StyleSheet, View} from 'react-native'

import {Button, Text} from '../../../../../components'
import {SafeArea} from '../../../../../components/SafeArea'
import {Space} from '../../../../../components/Space/Space'
import {TxHistoryRouteNavigation} from '../../../../../kernel/navigation'
import {useWalletManager} from '../../../../WalletManager/context/WalletManagerProvider'
import {useStrings} from '../../common'
import {NoFunds} from '../../illustrations'

export const NoFundsScreen = () => {
  const strings = useStrings()
  const navigation = useNavigation<TxHistoryRouteNavigation>()
  const styles = useStyles()
  const {
    selected: {network},
  } = useWalletManager()

  const handleOnTryAgain = () => {
    if (network === Chain.Network.Sancho) {
      Linking.openURL('https://sancho.network/faucet/')
      return
    }

    if (network === Chain.Network.Preprod) {
      Linking.openURL('https://sancho.network/faucet/')
      return
    }

    navigation.navigate('exchange-create-order')
  }

  const buttonText = network === Chain.Network.Mainnet ? strings.buyAda : strings.goToFaucet

  return (
    <SafeArea style={styles.root}>
      <View style={styles.center}>
        <NoFunds />

        <Space height="lg" />

        <Text style={styles.title}>{strings.noFunds}</Text>

        <Space height="lg" />

        <Button title={buttonText} textStyles={styles.button} shelleyTheme onPress={handleOnTryAgain} />
      </View>
    </SafeArea>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    root: {
      backgroundColor: color.bg_color_high,
      ...atoms.flex_1,
      ...atoms.p_xl,
    },
    center: {
      ...atoms.flex_1,
      ...atoms.align_center,
      ...atoms.justify_center,
    },
    title: {
      ...atoms.heading_3_medium,
      ...atoms.text_center,
      maxWidth: 320,
      color: color.gray_cmax,
    },
    button: {
      ...atoms.px_xl,
      ...atoms.py_lg,
    },
  })

  return styles
}
