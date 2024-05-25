import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {Text} from '../../../../../components/Text'
import {useBalances} from '../../../../../yoroi-wallets/hooks'
import {formatTokenWithText} from '../../../../../yoroi-wallets/utils/format'
import {Amounts} from '../../../../../yoroi-wallets/utils/utils'
import {useSelectedWallet} from '../../../../WalletManager/context/SelectedWalletContext'
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
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    banner: {
      backgroundColor: color.gray_cmin,
      ...atoms.py_lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      ...atoms.pb_xs,
    },
  })
  return styles
}
