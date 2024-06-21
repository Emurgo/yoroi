import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {Text} from '../../../../../components/Text'
import {useBalances} from '../../../../../yoroi-wallets/hooks'
import {formatTokenWithText} from '../../../../../yoroi-wallets/utils/format'
import {Amounts} from '../../../../../yoroi-wallets/utils/utils'
import {useStrings} from '../../../../Send/common/strings'
import {useSelectedWallet} from '../../../../WalletManager/common/hooks/useSelectedWallet'

export const CurrentBalance = () => {
  const strings = useStrings()
  const styles = useStyles()
  const {wallet} = useSelectedWallet()
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
  const {color} = useTheme()
  const styles = StyleSheet.create({
    banner: {
      backgroundColor: color.gray_cmin,
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      paddingBottom: 6,
    },
  })
  return styles
}
