import * as React from 'react'
import {useIntl} from 'react-intl'

import {Text} from '../../../../../components/Text'
import {txLabels} from '../../../../../i18n/global-messages'
import {formatTokenWithSymbol} from '../../../../../legacy/format'
import {useSelectedWallet} from '../../../../../SelectedWallet/Context/SelectedWalletContext'
import {YoroiUnsignedTx} from '../../../../../yoroi-wallets/types/types'
import {Amounts} from '../../../../../yoroi-wallets/utils/utils'

export const Fees = ({yoroiUnsignedTx}: {yoroiUnsignedTx: YoroiUnsignedTx}) => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const feeAmount = Amounts.getAmount(yoroiUnsignedTx.fee, wallet.primaryToken.identifier)

  return (
    <Text small testID="feesText">
      {`${strings.fees}: ${formatTokenWithSymbol(feeAmount.quantity, wallet.primaryToken)}`}
    </Text>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    fees: intl.formatMessage(txLabels.fees),
  }
}
