import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {Text} from '../../../../../components/Text'
import {formatTokenWithText} from '../../../../../legacy/format'
import {useBalances} from '../../../../../yoroi-wallets/hooks'
import {Amounts} from '../../../../../yoroi-wallets/utils/utils'
import {useSelectedWallet} from '../../../../SelectedWallet/Context'
import {useStrings} from '../../../common/strings'

export const CurrentBalance = () => {
  const styles = useStyles()
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const balances = useBalances(wallet)

  const balance = formatTokenWithText(
    Amounts.getAmount(balances, wallet.primaryToken.identifier).quantity,
    wallet.primaryToken,
  )

  return (
    <View style={styles.banner}>
      <Text small style={styles.label}>
        {strings.availableFunds}
      </Text>

      <Text bold>{balance}</Text>
    </View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color, padding} = theme
  const styles = StyleSheet.create({
    banner: {
      backgroundColor: color.gray.min,
      ...padding['y-l'],
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      ...padding['b-xs'],
    },
  })
  return styles
}
