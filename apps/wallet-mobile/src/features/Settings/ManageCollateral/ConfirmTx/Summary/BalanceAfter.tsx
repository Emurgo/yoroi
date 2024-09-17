import * as React from 'react'
import {useIntl} from 'react-intl'

import {Text} from '../../../../../components/Text'
import {txLabels} from '../../../../../kernel/i18n/global-messages'
import {useBalances} from '../../../../../yoroi-wallets/hooks'
import {YoroiUnsignedTx} from '../../../../../yoroi-wallets/types/yoroi'
import {formatTokenWithSymbol} from '../../../../../yoroi-wallets/utils/format'
import {Amounts} from '../../../../../yoroi-wallets/utils/utils'
import {useSelectedWallet} from '../../../../WalletManager/common/hooks/useSelectedWallet'

export const BalanceAfter = ({yoroiUnsignedTx}: {yoroiUnsignedTx: YoroiUnsignedTx}) => {
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const balances = useBalances(wallet)

  const balancesAfter = Amounts.diff(balances, yoroiUnsignedTx.fee)
  const primaryAmountAfter = Amounts.getAmount(balancesAfter, wallet.portfolioPrimaryTokenInfo.id)

  return (
    <Text small testID="balanceAfterTxText">
      {`${strings.balanceAfterTx}: ${formatTokenWithSymbol(
        primaryAmountAfter.quantity,
        wallet.portfolioPrimaryTokenInfo,
      )}`}
    </Text>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    balanceAfterTx: intl.formatMessage(txLabels.balanceAfterTx),
  }
}
