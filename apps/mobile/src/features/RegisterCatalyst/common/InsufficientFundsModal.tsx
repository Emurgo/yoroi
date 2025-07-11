import {amountFormatter} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {useIntl} from 'react-intl'
import {Platform, StyleSheet, Text, View} from 'react-native'

import {Space} from '../../../ui/Space/Space'
import globalMessages from '../../../kernel/i18n/global-messages'
import {usePortfolioPrimaryBalance} from '../../Portfolio/common/hooks/usePortfolioPrimaryBalance'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
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
  const {color} = useTheme()

  const fmtMinPrimaryBalance = formatter({
    info: wallet.portfolioPrimaryTokenInfo,
    quantity: BigInt(fund.info.votingPowerThreshold),
  })
  const fmtPrimaryBalance = formatter(primaryBalance)

  return (
    <View style={styles.container}>
      <Text style={[styles.text, {color: color.gray_max}]}>
        {strings.insufficientBalance({
          requiredBalance: fmtMinPrimaryBalance,
          currentBalance: fmtPrimaryBalance,
        })}
      </Text>

      {Platform.OS === 'android' && <Space height="lg" />}
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

const styles = StyleSheet.create({
  container: {
    ...a.px_lg,
    ...a.flex_1,
    ...a.gap_lg,
    ...a.justify_between,
  },
  text: {
    ...a.body_1_lg_regular,
  },
})