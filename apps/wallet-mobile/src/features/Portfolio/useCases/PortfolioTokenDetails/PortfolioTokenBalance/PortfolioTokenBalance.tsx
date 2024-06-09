import {amountBreakdown, infoExtractName} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {LoadingBoundary} from '../../../../../components'
import {PairedBalance} from '../../../../../components/PairedBalance/PairedBalance'
import {useSelectedWallet} from '../../../../WalletManager/context/SelectedWalletContext'
import {usePortfolioTokenDetailParams} from '../../../common/useNavigateTo'
import {PortfolioTokenDetailBalanceSkeleton} from './PortfolioTokenDetailBalanceSkeleton'

export const PortfolioTokenBalance = () => {
  const {styles} = useStyles()
  const wallet = useSelectedWallet()
  const {balances} = wallet
  const {id: tokenId} = usePortfolioTokenDetailParams()
  const tokenInfo = balances.records.get(tokenId)
  const tokenName = tokenInfo ? infoExtractName(tokenInfo.info, {mode: 'currency'}) : '-'

  if (!tokenInfo) return <PortfolioTokenDetailBalanceSkeleton />

  return (
    <LoadingBoundary fallback={<PortfolioTokenDetailBalanceSkeleton />}>
      <View>
        <View style={styles.tokenWrapper}>
          <Text style={styles.tokenLabel}>{amountBreakdown(tokenInfo).bn.toFormat(2)}</Text>

          <Text style={styles.symbol}>{tokenName}</Text>
        </View>

        <PairedBalance textStyle={styles.usdLabel} ignorePrivacy amount={tokenInfo} />
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
    tokenLabel: {
      ...atoms.heading_1_regular,
      ...atoms.font_semibold,
    },
    symbol: {
      ...atoms.body_1_lg_regular,
      ...atoms.font_semibold,
    },
    usdLabel: {
      ...atoms.body_2_md_regular,
      color: color.gray_c600,
    },
  })

  return {styles} as const
}
