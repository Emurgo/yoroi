import {amountBreakdown, infoExtractName, isPrimaryToken} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {LoadingBoundary} from '../../../../../components'
import {PairedBalance} from '../../../../../components/PairedBalance/PairedBalance'
import {useSelectedWallet} from '../../../../WalletManager/common/hooks/useSelectedWallet'
import {usePortfolioTokenDetailParams} from '../../../common/useNavigateTo'
import {PortfolioTokenDetailBalanceSkeleton} from './PortfolioTokenDetailBalanceSkeleton'

export const PortfolioTokenBalance = () => {
  const {styles} = useStyles()
  const {
    wallet: {balances},
  } = useSelectedWallet()
  const {id: tokenId} = usePortfolioTokenDetailParams()
  const tokenInfo = balances.records.get(tokenId)
  const tokenName = tokenInfo ? infoExtractName(tokenInfo.info, {mode: 'currency'}) : '-'

  if (!tokenInfo) return <PortfolioTokenDetailBalanceSkeleton />

  return (
    <LoadingBoundary fallback={<PortfolioTokenDetailBalanceSkeleton />}>
      <View>
        <View style={styles.tokenWrapper}>
          <Text style={styles.tokenBalance}>{amountBreakdown(tokenInfo).bn.toFormat(2)}</Text>

          <Text style={styles.symbol}>{tokenName}</Text>
        </View>

        {isPrimaryToken(tokenInfo.info) && ( // TODO: Prices other than PT
          <PairedBalance textStyle={styles.usdLabel} ignorePrivacy amount={tokenInfo} />
        )}
      </View>
    </LoadingBoundary>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    tokenWrapper: {
      ...atoms.flex_row,
      ...atoms.gap_2xs,
      ...atoms.align_baseline,
    },
    tokenBalance: {
      ...atoms.heading_1_medium,
      ...atoms.font_semibold,
      color: color.gray_c900,
    },
    symbol: {
      ...atoms.body_1_lg_medium,
      ...atoms.font_semibold,
      color: color.text_gray_normal,
    },
    usdLabel: {
      ...atoms.body_2_md_regular,
      color: color.gray_c600,
    },
  })

  return {styles} as const
}
