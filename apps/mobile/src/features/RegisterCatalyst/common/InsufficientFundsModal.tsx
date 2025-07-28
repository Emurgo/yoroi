import {amountFormatter} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {useIntl} from 'react-intl'
import {Platform, Text, View} from 'react-native'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import globalMessages from '~/kernel/i18n/global-messages'
import {Space} from '~/ui/Space/Space'
import {usePortfolioPrimaryBalance} from '~/features/Portfolio/common/hooks/usePortfolioPrimaryBalance'
import {useCatalystCurrentFund} from './hooks'

const formatter = amountFormatter({
  template: `{{value}} {{ticker}}`,
  dropTraillingZeros: true,
})

export const InsufficientFundsModal = () => {
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const primaryBalance = usePortfolioPrimaryBalance({wallet})
  const {fund} = useCatalystCurrentFund()
  const {palette: p} = useTheme()

  const fmtMinPrimaryBalance = formatter({
    info: wallet.portfolioPrimaryTokenInfo,
    quantity: BigInt(fund.info.votingPowerThreshold),
  })
  const fmtPrimaryBalance = formatter(primaryBalance)

  return (
    <View style={[a.px_lg, a.flex_1, a.gap_lg, a.justify_between]}>
      <Text style={[a.body_1_lg_regular, {color: p.gray_max}]}>
        {strings.insufficientBalance({
          requiredBalance: fmtMinPrimaryBalance,
          currentBalance: fmtPrimaryBalance,
        })}
      </Text>

      {Platform.OS === 'android' && <Space.Height.lg />}
    </View>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    insufficientBalance: ({
      requiredBalance,
      currentBalance,
    }: {
      requiredBalance: string
      currentBalance: string
    }) =>
      intl.formatMessage(globalMessages.insufficientBalance, {
        requiredBalance,
        currentBalance,
      }),
  }
}
