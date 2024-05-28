import {useTheme} from '@yoroi/theme'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {IPortfolioBalance} from 'src/features/Portfolio2/common/useGetTokensWithBalance'

import {Spacer} from '../../../../../components'
import {usePrivacyMode} from '../../../../../features/Settings/PrivacyMode/PrivacyMode'
import {PnlTag} from '../../../common/PnlTag/PnlTag'
import {useNavigateTo} from '../../../common/useNavigateTo'
import {DashboardTokenSkeletonItem} from './DashboardTokenSkeletonItem'

type Props = {
  tokenInfo?: IPortfolioBalance
}

export const DashboardTokenItem = ({tokenInfo}: Props) => {
  const {styles} = useStyles()
  const navigationTo = useNavigateTo()
  const {isPrivacyOff, privacyPlaceholder} = usePrivacyMode({
    decimals: 2,
    numbers: 3,
  })

  const {balance = 0, oldBalance = 0, usdExchangeRate = 1} = tokenInfo ?? {}
  const convertBalance = React.useMemo(() => new BigNumber(balance), [balance])
  const convertOldBalance = React.useMemo(() => new BigNumber(oldBalance), [oldBalance])

  const currentUSDBalance = convertBalance.multipliedBy(usdExchangeRate)
  const oldUSDBalance = convertOldBalance.multipliedBy(usdExchangeRate)

  const usdBalanceFormatted = React.useMemo(() => {
    return isPrivacyOff ? currentUSDBalance.toFixed(2) : privacyPlaceholder
  }, [currentUSDBalance, isPrivacyOff, privacyPlaceholder])

  const balanceFormatted = React.useMemo(() => {
    return isPrivacyOff ? convertBalance.toFixed(2) : privacyPlaceholder
  }, [convertBalance, isPrivacyOff, privacyPlaceholder])

  const pnl = currentUSDBalance.minus(oldUSDBalance)
  const variantPnl = new BigNumber(pnl).gte(0) ? 'success' : 'danger'
  const pnlPercentFormatted = convertBalance
    .minus(convertOldBalance)
    .dividedBy(convertOldBalance)
    .multipliedBy(100)
    .toFixed(2)

  if (!tokenInfo) return <DashboardTokenSkeletonItem />

  return (
    <TouchableOpacity onPress={() => navigationTo.tokenDetail({id: 'some_id', name: tokenInfo.symbol})}>
      <View style={styles.root}>
        <View style={styles.tokenInfoContainer}>
          <Image
            source={typeof tokenInfo.logo === 'string' ? {uri: tokenInfo.logo} : tokenInfo.logo}
            style={styles.tokenLogo}
          />

          <View>
            <Text style={styles.symbol}>{tokenInfo.symbol}</Text>

            <Text style={styles.name}>{tokenInfo.name}</Text>
          </View>
        </View>

        <Spacer height={16} />

        <View>
          <PnlTag variant={variantPnl} withIcon>
            <Text>{pnlPercentFormatted}%</Text>
          </PnlTag>

          <Text style={styles.tokenValue}>{balanceFormatted}</Text>

          <Text style={styles.usdValue}>{usdBalanceFormatted}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.p_lg,
      ...atoms.rounded_sm,
      ...atoms.flex_col,
      ...atoms.align_start,
      ...atoms.border,
      borderColor: color.gray_c300,
      width: 164,
    },
    symbol: {
      ...atoms.body_2_md_medium,
      ...atoms.font_semibold,
      color: color.gray_cmax,
      textTransform: 'uppercase',
    },
    name: {
      ...atoms.body_3_sm_regular,
      color: color.gray_c600,
    },
    tokenValue: {
      ...atoms.heading_4_medium,
      ...atoms.font_semibold,
      color: color.gray_cmax,
    },
    usdValue: {
      ...atoms.body_3_sm_regular,
      color: color.gray_c600,
    },
    tokenInfoContainer: {
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.gap_sm,
    },
    tokenLogo: {
      width: 40,
      height: 40,
      resizeMode: 'cover',
    },
  })

  return {styles} as const
}
