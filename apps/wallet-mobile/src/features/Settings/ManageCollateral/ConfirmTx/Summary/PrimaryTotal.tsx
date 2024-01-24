import * as React from 'react'
import {useIntl} from 'react-intl'
import {StyleSheet, View} from 'react-native'

import {Text} from '../../../../../components/Text'
import globalMessages from '../../../../../i18n/global-messages'
import {formatTokenWithSymbol} from '../../../../../legacy/format'
import {useSelectedWallet} from '../../../../../SelectedWallet/Context/SelectedWalletContext'
import {COLORS} from '../../../../../theme/config'
import {YoroiUnsignedTx} from '../../../../../yoroi-wallets/types/yoroi'
import {Amounts} from '../../../../../yoroi-wallets/utils/utils'

export const PrimaryTotal = ({yoroiUnsignedTx}: {yoroiUnsignedTx: YoroiUnsignedTx}) => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const primaryAmount = Amounts.getAmount(
    Amounts.getAmountsFromEntries(yoroiUnsignedTx.entries),
    wallet.primaryToken.identifier,
  )

  return (
    <View>
      <Text>{strings.total}</Text>

      <Text style={styles.amount} testID="totalAmountText">
        {formatTokenWithSymbol(primaryAmount.quantity, wallet.primaryToken)}
      </Text>
    </View>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    total: intl.formatMessage(globalMessages.total),
  }
}

const styles = StyleSheet.create({
  amount: {
    color: COLORS.POSITIVE_AMOUNT,
  },
})
