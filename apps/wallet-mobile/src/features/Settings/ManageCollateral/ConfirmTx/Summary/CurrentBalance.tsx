import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {Text} from '../../../../../components/Text'
import {formatTokenWithText} from '../../../../../legacy/format'
import {useSelectedWallet} from '../../../../../SelectedWallet/Context/SelectedWalletContext'
import {COLORS} from '../../../../../theme/config'
import {useBalances} from '../../../../../yoroi-wallets/hooks'
import {Amounts} from '../../../../../yoroi-wallets/utils/utils'
import {useStrings} from '../../../../Send/common/strings'

export const CurrentBalance = () => {
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

const styles = StyleSheet.create({
  banner: {
    backgroundColor: COLORS.WHITE,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    paddingBottom: 6,
  },
})
