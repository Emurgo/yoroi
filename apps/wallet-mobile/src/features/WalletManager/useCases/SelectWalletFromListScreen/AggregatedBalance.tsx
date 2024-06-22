import {infoExtractName} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import {from, map, scan, switchMap} from 'rxjs'

import {BalanceCardContent} from '../../../Portfolio/useCases/PortfolioDashboard/BalanceCard/BalanceCardContent'
import {BalanceCardSkeleton} from '../../../Portfolio/useCases/PortfolioDashboard/BalanceCard/BalanceCardSkeleton'
import {BalanceHeaderCard} from '../../../Portfolio/useCases/PortfolioDashboard/BalanceCard/BalanceHeaderCard'
import {useCurrencyPairing} from '../../../Settings/Currency'
import {useSelectedNetwork} from '../../common/hooks/useSelectedNetwork'
import {useWalletManager} from '../../context/WalletManagerProvider'

export const AggregatedBalance = () => {
  const {styles, colors} = useStyles()

  const {
    networkManager: {primaryTokenInfo},
  } = useSelectedNetwork()
  const aggregatedPtBalances = useAggregatedPtBalances()

  const name = infoExtractName(primaryTokenInfo)
  const price = useCurrencyPairing().adaPrice.price

  const amount = aggregatedPtBalances?.[primaryTokenInfo.id] ?? {
    info: primaryTokenInfo,
    quantity: 0n,
  }
  const isFetching = price == null || aggregatedPtBalances == null

  return (
    <View style={styles.root}>
      {isFetching ? (
        <BalanceCardSkeleton />
      ) : (
        <LinearGradient style={styles.gradientRoot} colors={colors.gradientColor}>
          <BalanceCardContent
            amount={amount}
            name={name}
            headerCard={<BalanceHeaderCard rate={price} name={name} hasDApps={false} />}
          />
        </LinearGradient>
      )}
    </View>
  )
}

const useAggregatedPtBalances = () => {
  const {walletManager} = useWalletManager()
  const [aggregatedBalances, setAggregatedBalances] = React.useState<Portfolio.Token.AmountRecords | null>(null)

  React.useEffect(() => {
    const subscription = walletManager.walletMetas$
      .pipe(
        map((walletMetas) => Array.from(walletMetas.keys())),
        switchMap((walletIds) => from(walletIds)),
        map((walletId) => walletManager.getWalletById(walletId)),
        scan((acc: Portfolio.Token.AmountRecords, wallet) => {
          if (wallet?.primaryBalance) {
            const balanceId = wallet.primaryBalance.info.id
            if (acc[balanceId] != null) {
              acc[balanceId].quantity += wallet.primaryBalance.quantity
            } else {
              acc[balanceId] = {...wallet.primaryBalance}
            }
          }
          return acc
        }, {}),
      )
      .subscribe((aggregatedAmounts) => {
        setAggregatedBalances(aggregatedAmounts)
      })

    return () => subscription.unsubscribe()
  }, [walletManager])

  return aggregatedBalances
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
