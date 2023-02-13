import React from 'react'

import {Banner} from '../../components'
import {useBalances} from '../../hooks'
import {formatTokenWithText} from '../../legacy/format'
import {useSelectedWallet} from '../../SelectedWallet'
import {Amounts} from '../../yoroi-wallets/utils'
import {useStrings} from './strings'

export const AvailableAmountBanner = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const balances = useBalances(wallet)

  return (
    <Banner
      label={strings.availableFunds}
      text={formatTokenWithText(
        Amounts.getAmount(balances, wallet.primaryToken.identifier).quantity,
        wallet.primaryToken,
      )}
      boldText
    />
  )
}
