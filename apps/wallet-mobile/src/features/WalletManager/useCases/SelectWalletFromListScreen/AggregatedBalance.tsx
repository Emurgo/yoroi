import {infoExtractName, isFt, isNft} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import {merge, switchMap} from 'rxjs'

import {Space} from '../../../../components/Space/Space'
import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
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
  const aggregatedBalances = useAggregatedBalances()

  const name = infoExtractName(primaryTokenInfo)
  const price = useCurrencyPairing().adaPrice.price

  const amount = aggregatedBalances?.[primaryTokenInfo.id] ?? {
    info: primaryTokenInfo,
    quantity: 0n,
  }
  const isFetching = aggregatedBalances == null

  const tokens = React.useMemo(() => {
    return {
      nfts: Object.values(aggregatedBalances ?? {}).filter(({info}) => isNft(info)),
      fts: Object.values(aggregatedBalances ?? {}).filter(({info}) => isFt(info)),
    }
  }, [aggregatedBalances])

  return (
    <View style={styles.root}>
      {isFetching ? (
        <BalanceCardSkeleton />
      ) : (
        <LinearGradient style={styles.gradientRoot} colors={colors.gradient}>
          <BalanceCardContent
            amount={amount}
            headerCard={<BalanceHeaderCard rate={price} name={name} hasDApps={false} />}
          />
        </LinearGradient>
      )}

      <Space width="lg" />

      <View style={styles.tokens}>
        <Text style={styles.tokensText}>{tokens.nfts.length} NFT</Text>

        <Space width="lg" />

        <Text style={styles.tokensText}>{tokens.fts.length} FT</Text>
      </View>
    </View>
  )
}

const useAggregatedBalances = () => {
  const {walletManager} = useWalletManager()
  const [aggregatedBalances, setAggregatedBalances] = React.useState<Portfolio.Token.AmountRecords | null>(null)

  React.useEffect(() => {
    const subscription = merge(
      walletManager.walletMetas$.pipe(
        switchMap(() => {
          const wallets = Array.from(walletManager.walletMetas.values())
            .map((meta) => walletManager.getWalletById(meta.id))
            .filter((wallet): wallet is YoroiWallet => wallet != null)

          return merge(...wallets.map((wallet) => wallet.balance$))
        }),
      ),
      walletManager.walletMetas$,
    ).subscribe(() => {
      const aggregatedBalances = Array.from(walletManager.walletMetas.values())
        .map((meta) => walletManager.getWalletById(meta.id))
        .filter((wallet): wallet is YoroiWallet => wallet != null)
        .reduce((amounts: Portfolio.Token.AmountRecords, wallet) => {
          for (const balance of wallet.balances.records.values()) {
            if (amounts[balance.info.id] != null) {
              amounts[balance.info.id].quantity += balance.quantity
            } else {
              amounts[balance.info.id] = {...balance}
            }
          }
          return amounts
        }, {})

      setAggregatedBalances(aggregatedBalances)
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
    tokens: {
      ...atoms.flex_row,
      ...atoms.justify_center,
    },
    tokensText: {
      backgroundColor: color.bg_color_low,
      color: color.text_gray_max,
      ...atoms.monospace,
      ...atoms.p_xs,
      borderRadius: 9,
    },
  })

  const colors = {
    gradient: color.bg_gradient_3,
    white: color.white_static,
  }

  return {styles, colors} as const
}
