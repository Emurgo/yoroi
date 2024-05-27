import {useTheme} from '@yoroi/theme'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import {Image, ImageSourcePropType, ImageStyle, StyleProp, StyleSheet, Text, View} from 'react-native'

import {ILiquidityPool} from '../useGetLiquidityPool'
import {DAppTokenITemSkeleton} from './DAppTokenITemSkeleton'

type Props = {
  tokenInfo?: ILiquidityPool
  splitTokenSymbol: string
}

export const DAppTokenITem = ({tokenInfo, splitTokenSymbol}: Props) => {
  const {styles} = useStyles()
  if (!tokenInfo) return <DAppTokenITemSkeleton />

  const [firstToken, secondToken] = tokenInfo.assets
  const firstTokenBalance = new BigNumber(firstToken.balance)
  const secondTokenBalance = new BigNumber(secondToken.balance)
  const sumBalance = firstTokenBalance.plus(secondTokenBalance)
  const usdExchangeRate = tokenInfo.usdExchangeRate ?? 1
  const usd = sumBalance.multipliedBy(usdExchangeRate)
  const sumBalanceFormatted = sumBalance.toFixed(0)
  const usdFormatted = usd.toFixed(0)

  return (
    <View style={styles.root}>
      <View style={styles.tokenInfoContainer}>
        <View style={styles.logoContainer}>
          <Logo source={firstToken.logo} style={styles.logoFirst} />

          <Logo source={secondToken.logo} style={styles.logoSecond} />
        </View>

        <View>
          <Text style={styles.symbol}>
            {`${tokenInfo.assets[0].symbol} ${splitTokenSymbol} ${tokenInfo.assets[1].symbol}`}
          </Text>

          <Text style={styles.dexName}>{tokenInfo.dex.name}</Text>
        </View>
      </View>

      <View>
        <Text style={styles.sumBalance}>{`${sumBalanceFormatted} ${firstToken.logo}`}</Text>

        <Text style={styles.usd}>{usdFormatted} USD</Text>
      </View>
    </View>
  )
}

type LogoProps = {
  source: string | ImageSourcePropType
  style: StyleProp<ImageStyle>
}
const Logo = ({source, style}: LogoProps) => {
  return <Image source={typeof source === 'string' ? {uri: source} : source} style={[style]} />
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_row,
      ...atoms.justify_between,
    },
    symbol: {
      ...atoms.body_1_lg_medium,
    },
    logoFirst: {
      ...atoms.rounded_sm,
      ...atoms.absolute,
      top: 0,
      left: 0,
      width: 25,
      height: 25,
    },
    logoSecond: {
      ...atoms.rounded_sm,
      ...atoms.absolute,
      bottom: 0,
      right: 0,
      width: 25,
      height: 25,
    },
    logoContainer: {
      ...atoms.relative,
      width: 40,
      height: 40,
    },
    tokenInfoContainer: {
      ...atoms.flex_row,
      ...atoms.gap_md,
    },
    dexName: {
      ...atoms.body_3_sm_regular,
      color: color.gray_c600,
    },
    sumBalance: {
      color: color.gray_cmax,
      ...atoms.body_1_lg_regular,
      ...atoms.text_right,
    },
    usd: {
      color: color.gray_c600,
      ...atoms.body_3_sm_regular,
      ...atoms.text_right,
    },
  })

  return {styles} as const
}
