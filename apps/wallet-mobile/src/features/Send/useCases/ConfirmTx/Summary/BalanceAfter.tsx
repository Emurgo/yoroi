import * as React from 'react'
import {useIntl} from 'react-intl'

import {Text} from '../../../../../components/Text'
import {txLabels} from '../../../../../i18n/global-messages'
import {formatTokenWithSymbol} from '../../../../../legacy/format'
import {useBalances} from '../../../../../yoroi-wallets/hooks'
import {YoroiUnsignedTx} from '../../../../../yoroi-wallets/types/yoroi'
import {Amounts} from '../../../../../yoroi-wallets/utils/utils'
import {useSelectedWallet} from '../../../../WalletManager/Context'

export const BalanceAfter = ({yoroiUnsignedTx}: {yoroiUnsignedTx: YoroiUnsignedTx}) => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const balances = useBalances(wallet)

  // prettier-ignore
  const balancesAfter = Amounts.diff(
      balances,
      Amounts.sum([
        Amounts.getAmountsFromEntries(yoroiUnsignedTx.entries),
        yoroiUnsignedTx.fee,
      ]),
    )
  const primaryAmountAfter = Amounts.getAmount(balancesAfter, wallet.primaryToken.identifier)

  return (
    <Text small testID="balanceAfterTxText">
      {`${strings.balanceAfterTx}: ${formatTokenWithSymbol(primaryAmountAfter.quantity, wallet.primaryToken)}`}
    </Text>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    balanceAfterTx: intl.formatMessage(txLabels.balanceAfterTx),
  }
}
