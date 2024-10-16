import {infoExtractName, isFt, isNft} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Space} from '../../../../components/Space/Space'
import {aggregatePrimaryAmount} from '../../../Portfolio/common/helpers/aggregatePrimaryAmount'
import {usePortfolioTokenActivity} from '../../../Portfolio/common/PortfolioTokenActivityProvider'
import {BalanceCardContent} from '../../../Portfolio/useCases/PortfolioDashboard/BalanceCard/BalanceCardContent'
import {BalanceCardSkeleton} from '../../../Portfolio/useCases/PortfolioDashboard/BalanceCard/BalanceCardSkeleton'
import {BalanceHeaderCard} from '../../../Portfolio/useCases/PortfolioDashboard/BalanceCard/BalanceHeaderCard'
import {useCurrencyPairing} from '../../../Settings/useCases/changeAppSettings/Currency/CurrencyContext'
import {useSelectedNetwork} from '../../common/hooks/useSelectedNetwork'

export const AggregatedBalance = () => {
  const {styles, colors} = useStyles()

  const {
    networkManager: {primaryTokenInfo},
  } = useSelectedNetwork()
  const {aggregatedBalances, tokenActivity, isLoading} = usePortfolioTokenActivity()

  const name = infoExtractName(primaryTokenInfo)
  const price = useCurrencyPairing().ptActivity.close

  const amount = React.useMemo(
    () => aggregatePrimaryAmount({primaryTokenInfo, tokenActivity, tokenAmountRecords: aggregatedBalances}),
    [aggregatedBalances, primaryTokenInfo, tokenActivity],
  )
  const tokens = React.useMemo(() => {
    return {
      nfts: Object.values(aggregatedBalances ?? {}).filter(({info}) => isNft(info)),
      fts: Object.values(aggregatedBalances ?? {}).filter(({info}) => isFt(info)),
    }
  }, [aggregatedBalances])

  return (
    <View style={styles.root}>
      {isLoading ? (
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

      <Space width="lg" />
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
    tokens: {
      ...atoms.flex_row,
      ...atoms.justify_center,
    },
    tokensText: {
      backgroundColor: color.bg_color_min,
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
