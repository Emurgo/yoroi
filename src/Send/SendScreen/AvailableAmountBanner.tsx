import BigNumber from 'bignumber.js'
import React from 'react'

import {Banner} from '../../components'
import {useBalances, useTokenInfo} from '../../hooks'
import {formatTokenWithText} from '../../legacy/format'
import {useSelectedWallet} from '../../SelectedWallet'
import {Amounts} from '../../yoroi-wallets/utils'
import {useStrings} from './strings'

export const AvailableAmountBanner = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const balances = useBalances(wallet)
  const tokenInfo = useTokenInfo({wallet, tokenId: ''})

  return (
    <Banner
      label={strings.availableFunds}
      text={formatTokenWithText(new BigNumber(Amounts.getAmount(balances, '').quantity), tokenInfo)}
      boldText
    />
  )
}
