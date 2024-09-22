import * as React from 'react'
import {useIntl} from 'react-intl'

import {Text} from '../../../../../components/Text'
import {txLabels} from '../../../../../kernel/i18n/global-messages'
import {YoroiUnsignedTx} from '../../../../../yoroi-wallets/types/yoroi'
import {formatTokenWithSymbol} from '../../../../../yoroi-wallets/utils/format'
import {Amounts} from '../../../../../yoroi-wallets/utils/utils'
import {useSelectedWallet} from '../../../../WalletManager/common/hooks/useSelectedWallet'

export const Fees = ({yoroiUnsignedTx}: {yoroiUnsignedTx: YoroiUnsignedTx}) => {
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const feeAmount = Amounts.getAmount(yoroiUnsignedTx.fee, wallet.portfolioPrimaryTokenInfo.id)

  return (
    <Text small testID="feesText">
      {`${strings.fees}: ${formatTokenWithSymbol(feeAmount.quantity, wallet.portfolioPrimaryTokenInfo)}`}
    </Text>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    fees: intl.formatMessage(txLabels.fees),
  }
}
