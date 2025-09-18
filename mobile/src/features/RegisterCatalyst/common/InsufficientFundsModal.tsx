import {amountFormatter} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Platform, Text, View} from 'react-native'

import {usePortfolioPrimaryBalance} from '~/features/Portfolio/common/hooks/usePortfolioPrimaryBalance'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {ActivityIndicator} from '~/ui/ActivityIndicator/ActivityIndicator'
import {Space} from '~/ui/Space/Space'

import {useCatalystCurrentFund} from './hooks'

const formatter = amountFormatter({
  template: `{{value}} {{ticker}}`,
  dropTraillingZeros: true,
})

const InsufficientFundsModalContent = () => {
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const primaryBalance = usePortfolioPrimaryBalance({wallet})
  const {fund, query} = useCatalystCurrentFund()
  const {palette: p} = useTheme()

  // Show loading state
  if (query.isLoading) {
    return (
      <View style={[a.flex_1, a.gap_lg, a.justify_between]}>
        <ActivityIndicator />
      </View>
    )
  }

  // Default to 0 if fund data is not available yet
  const votingPowerThreshold = fund?.info?.votingPowerThreshold
    ? BigInt(fund.info.votingPowerThreshold)
    : BigInt(0)

  const fmtMinPrimaryBalance = formatter({
    info: wallet.portfolioPrimaryTokenInfo,
    quantity: votingPowerThreshold,
  })
  const fmtPrimaryBalance = formatter(primaryBalance)

  return (
    <View style={[a.flex_1, a.gap_lg, a.justify_between]}>
      <Text style={[a.body_1_lg_regular, {color: p.gray_max}]}>
        {strings.global.insufficientBalance({
          requiredBalance: fmtMinPrimaryBalance,
          currentBalance: fmtPrimaryBalance,
        })}
      </Text>

      {Platform.OS === 'android' && <Space.Height.lg />}
    </View>
  )
}

export const InsufficientFundsModal = InsufficientFundsModalContent
