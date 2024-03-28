import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {useIntl} from 'react-intl'
import {StyleSheet} from 'react-native'

import {Text} from '../../../../../components/Text'
import globalMessages from '../../../../../i18n/global-messages'
import {formatTokenWithSymbol} from '../../../../../legacy/format'
import {useSelectedWallet} from '../../../../../SelectedWallet/Context/SelectedWalletContext'
import {YoroiUnsignedTx} from '../../../../../yoroi-wallets/types/yoroi'
import {Amounts} from '../../../../../yoroi-wallets/utils/utils'

export const PrimaryTotal = ({yoroiUnsignedTx}: {yoroiUnsignedTx: YoroiUnsignedTx}) => {
  const strings = useStrings()
  const styles = useStyles()
  const wallet = useSelectedWallet()
  const primaryAmount = Amounts.getAmountFromEntries(yoroiUnsignedTx.entries, wallet.primaryToken.identifier)

  return (
    <>
      <Text>{strings.total}</Text>

      <Text style={styles.amount} testID="totalAmountText">
        {formatTokenWithSymbol(primaryAmount.quantity, wallet.primaryToken)}
      </Text>
    </>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    total: intl.formatMessage(globalMessages.total),
  }
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color} = theme
  const styles = StyleSheet.create({
    amount: {
      color: color.secondary[500],
    },
  })
  return styles
}
