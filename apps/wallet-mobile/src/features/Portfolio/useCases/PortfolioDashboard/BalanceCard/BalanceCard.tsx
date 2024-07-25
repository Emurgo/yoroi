import {infoExtractName} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {useCurrencyPairing} from '../../../../Settings/Currency'
import {useSelectedWallet} from '../../../../WalletManager/common/hooks/useSelectedWallet'
import {usePortfolioPrimaryBalance} from '../../../common/hooks/usePortfolioPrimaryBalance'
import {useGetDAppsPortfolioBalance} from '../../../common/useGetDAppsPortfolioBalance'
import {BalanceCardContent} from './BalanceCardContent'
import {BalanceCardSkeleton} from './BalanceCardSkeleton'
import {BalanceHeaderCard} from './BalanceHeaderCard'

export const BalanceCard = () => {
  const {styles, colors} = useStyles()

  const {wallet} = useSelectedWallet()
  const primaryBalance = usePortfolioPrimaryBalance({wallet})
  const name = infoExtractName(primaryBalance.info)
  const price = useCurrencyPairing().adaPrice.price
  const dAppsBalance = useGetDAppsPortfolioBalance(primaryBalance.quantity)
  const hasDApps = dAppsBalance !== undefined && Number(dAppsBalance.quantity) > 0

  const isFetching = price === undefined || dAppsBalance === undefined

  return (
    <View style={styles.root}>
      {isFetching ? (
        <BalanceCardSkeleton />
      ) : (
        <LinearGradient style={styles.gradientRoot} colors={colors.gradientColor}>
          <BalanceCardContent
            amount={primaryBalance}
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
    gradientColor: color.bg_gradient_3,
    white: color.white_static,
  }

  return {styles, colors} as const
}
