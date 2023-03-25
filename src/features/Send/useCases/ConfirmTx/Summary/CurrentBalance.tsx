import * as React from 'react'

import {Banner} from '../../../../../components/Banner/Banner'
import {formatTokenWithText} from '../../../../../legacy/format'
import {useSelectedWallet} from '../../../../../SelectedWallet/Context/SelectedWalletContext'
import {useBalances} from '../../../../../yoroi-wallets/hooks'
import {Amounts} from '../../../../../yoroi-wallets/utils/utils'
import {useStrings} from '../../../common/strings'

export const CurrentBalance = () => {
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
      containerStyle={{backgroundColor: '#fff'}}
    />
  )
}
