import {atoms as a, useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/features/Portfolio/common/hooks/useStrings'
import {
  PortfolioListTab,
  usePortfolio,
} from '~/features/Portfolio/context/PortfolioProvider'
import {TotalTokensValueContent} from './TotalTokensValueContent'

type Props = {
  amount: Portfolio.Token.Amount
}

export const TotalTokensValue = ({amount}: Props) => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  const {listTab} = usePortfolio()
  const title =
    listTab === PortfolioListTab.Wallet
      ? strings.totalWalletValue
      : strings.totalDAppValue

  return (
    <View style={[a.py_lg]}>
      <TotalTokensValueContent
        amount={amount}
        headerCard={
          <Text style={[a.body_3_sm_regular, {color: p.gray_600}]}>
            {title}
          </Text>
        }
      />
    </View>
  )
}
