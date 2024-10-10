import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {useIntl} from 'react-intl'
import {StyleSheet, View} from 'react-native'

import {Text} from '../../../../../components/Text'
import globalMessages from '../../../../../kernel/i18n/global-messages'
import {YoroiUnsignedTx} from '../../../../../yoroi-wallets/types/yoroi'
import {formatTokenWithSymbol} from '../../../../../yoroi-wallets/utils/format'
import {Amounts} from '../../../../../yoroi-wallets/utils/utils'
import {useSelectedWallet} from '../../../../WalletManager/common/hooks/useSelectedWallet'

export const PrimaryTotal = ({yoroiUnsignedTx}: {yoroiUnsignedTx: YoroiUnsignedTx}) => {
  const strings = useStrings()
  const styles = useStyles()
  const {wallet} = useSelectedWallet()
  const primaryAmount = Amounts.getAmount(
    Amounts.getAmountsFromEntries(yoroiUnsignedTx.entries),
    wallet.portfolioPrimaryTokenInfo.id,
  )

  return (
    <View>
      <Text>{strings.total}</Text>

      <Text style={styles.amount} testID="totalAmountText">
        {formatTokenWithSymbol(primaryAmount.quantity, wallet.portfolioPrimaryTokenInfo)}
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
const useStyles = () => {
  const {color} = useTheme()
  const styles = StyleSheet.create({
    amount: {
      color: color.secondary_600,
    },
  })
  return styles
}
