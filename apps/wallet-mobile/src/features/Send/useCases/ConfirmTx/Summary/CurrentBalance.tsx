import {amountFormatter} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {Text} from '../../../../../components/Text'
import {useSelectedWallet} from '../../../../WalletManager/common/hooks/useSelectedWallet'
import {useStrings} from '../../../common/strings'

export const CurrentBalance = () => {
  const styles = useStyles()
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const balance = wallet.primaryBalance

  const formattedBalance = amountFormatter({template: '{{value}} {{ticker}}'})(balance)

  return (
    <View style={styles.banner}>
      <Text small style={styles.label}>
        {strings.availableFunds}
      </Text>

      <Text bold>{formattedBalance}</Text>
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    banner: {
      backgroundColor: color.bg_color_max,
      ...atoms.py_lg,
      ...atoms.align_center,
      ...atoms.justify_center,
    },
    label: {
      ...atoms.pb_xs,
    },
  })
  return styles
}
