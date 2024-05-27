import {useTheme} from '@yoroi/theme'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import {Image, StyleSheet, Text, View} from 'react-native'

import {Spacer} from '../../../../../components'
import {PnlTag} from '../../../common/PnlTag/PnlTag'
import {IPortfolioBalance} from '../../../common/useGetTokensWithBalance'
import {TokenBalanceSkeletonItem} from './TokenBalanceSkeletonItem'

type Props = {
  info?: IPortfolioBalance
}
export const TokenBalanceItem = ({info}: Props) => {
  const {styles} = useStyles()
  if (!info) return <TokenBalanceSkeletonItem />

  const balance = new BigNumber(info?.balance ?? 0)
  const balanceFormatted = balance.toFixed(2)
  const oldBalance = new BigNumber(info?.oldBalance ?? 0)
  const usdExchangeRate = info.usdExchangeRate ?? 1
  const usd = balance.multipliedBy(usdExchangeRate)
  const usdFormatted = usd.toFixed(2)
  const pnl = balance.minus(oldBalance)
  const variantPnl = new BigNumber(pnl).gte(0) ? 'success' : 'danger'
  const pnlPercentFormatted = pnl.dividedBy(oldBalance).multipliedBy(100).toFixed(2)

  return (
    <View style={styles.root}>
      <View style={styles.rowCenter}>
        <Image source={typeof info.logo === 'string' ? {uri: info.logo} : info.logo} style={styles.tokenLogo} />

        <Spacer width={12} />

        <View>
          <Text style={styles.symbol}>{info.symbol}</Text>

          <PnlTag withIcon variant={variantPnl}>
            <Text>{pnlPercentFormatted}%</Text>
          </PnlTag>
        </View>
      </View>

      <View>
        <Text style={styles.tokenBalance}>{balanceFormatted} ADA</Text>

        <Text style={styles.usdBalance}>{usdFormatted} USD</Text>
      </View>
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      backgroundColor: color.gray_cmin,
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.justify_between,
    },
    tokenLogo: {
      ...atoms.rounded_sm,
      width: 40,
      height: 40,
      backgroundColor: color.gray_c50,
    },
    rowCenter: {
      ...atoms.flex_row,
      ...atoms.align_center,
    },
    symbol: {
      ...atoms.body_1_lg_medium,
      ...atoms.font_semibold,
    },
    tokenBalance: {
      ...atoms.body_1_lg_regular,
      ...atoms.text_right,
      color: color.gray_c900,
    },
    usdBalance: {
      ...atoms.body_3_sm_regular,
      ...atoms.text_right,
      color: color.gray_c600,
    },
  })

  return {styles} as const
}
