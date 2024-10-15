import {infoExtractName} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {useCurrencyPairing} from '../../../../Settings/useCases/changeAppSettings/Currency/CurrencyContext'
import {useSelectedWallet} from '../../../../WalletManager/common/hooks/useSelectedWallet'
import {aggregatePrimaryAmount} from '../../../common/helpers/aggregatePrimaryAmount'
import {usePortfolioTokenActivity} from '../../../common/PortfolioTokenActivityProvider'
import {BalanceCardContent} from './BalanceCardContent'
import {BalanceCardSkeleton} from './BalanceCardSkeleton'
import {BalanceHeaderCard} from './BalanceHeaderCard'

export const BalanceCard = () => {
  const {styles, colors} = useStyles()

  const {
    wallet: {balances, portfolioPrimaryTokenInfo},
  } = useSelectedWallet()
  const {tokenActivity, isLoading} = usePortfolioTokenActivity()

  const amount = React.useMemo(
    () =>
      aggregatePrimaryAmount({
        tokenAmountRecords: Object.fromEntries(balances.records.entries()),
        primaryTokenInfo: portfolioPrimaryTokenInfo,
        tokenActivity,
      }),
    [balances.records, portfolioPrimaryTokenInfo, tokenActivity],
  )

  const name = infoExtractName(portfolioPrimaryTokenInfo)
  const price = useCurrencyPairing().ptActivity.close
  const hasDApps = false

  return (
    <View style={styles.root}>
      {isLoading ? (
        <BalanceCardSkeleton />
      ) : (
        <LinearGradient style={styles.gradientRoot} colors={colors.gradient}>
          <BalanceCardContent
            amount={amount}
            headerCard={<BalanceHeaderCard rate={price} name={name} hasDApps={hasDApps} />}
          />
        </LinearGradient>
      )}
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.px_lg,
    },
    gradientRoot: {
      ...atoms.p_lg,
      borderRadius: 9,
    },
  })

  const colors = {
    gradient: color.bg_gradient_3,
  }

  return {styles, colors} as const
}
