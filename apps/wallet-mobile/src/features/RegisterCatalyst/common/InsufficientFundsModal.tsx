import {amountFormatter} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {useIntl} from 'react-intl'
import {Platform, StyleSheet, Text, View} from 'react-native'

import {Space} from '../../../components/Space/Space'
import globalMessages from '../../../kernel/i18n/global-messages'
import {usePortfolioPrimaryBalance} from '../../Portfolio/common/hooks/usePortfolioPrimaryBalance'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {useCatalystCurrentFund} from './hooks'

const formatter = amountFormatter({template: `{{value}} {{ticker}}`, dropTraillingZeros: true})

export const InsufficientFundsModal = () => {
  const strings = useStrings()
  const styles = useStyles()
  const {wallet} = useSelectedWallet()
  const primaryBalance = usePortfolioPrimaryBalance({wallet})
  const {fund} = useCatalystCurrentFund()

  const fmtMinPrimaryBalance = formatter({
    info: wallet.portfolioPrimaryTokenInfo,
    quantity: BigInt(fund.info.votingPowerThreshold),
  })
  const fmtPrimaryBalance = formatter(primaryBalance)

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
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
    insufficientBalance: ({requiredBalance, currentBalance}: {requiredBalance: string; currentBalance: string}) =>
      intl.formatMessage(globalMessages.insufficientBalance, {
        requiredBalance,
        currentBalance,
      }),
  }
}

const useStyles = () => {
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    container: {
      ...atoms.px_lg,
      ...atoms.flex_1,
      ...atoms.gap_lg,
      ...atoms.justify_between,
    },
    text: {
      color: color.gray_max,
      ...atoms.body_1_lg_regular,
    },
  })

  return styles
}
