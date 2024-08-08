import {amountBreakdown, infoExtractName} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {PairedBalance} from '../../../../../../components/PairedBalance/PairedBalance'
import {AssetLogo} from '../../../../common/AssetLogo/AssetLogo'
import {TokenInfoIcon} from '../../../../common/TokenAmountItem/TokenInfoIcon'
import {ILiquidityPool} from '../../../../common/useGetLiquidityPool'

type Props = {
  tokenInfo: ILiquidityPool
  splitTokenSymbol: string
  onPress?: () => void
}

export const DAppTokenItem = ({tokenInfo, splitTokenSymbol, onPress}: Props) => {
  const {styles} = useStyles()

  const [firstToken, secondToken] = tokenInfo.assets
  const firstTokenBalance = amountBreakdown(firstToken).bn.toFormat(2)
  const firstTokenName = infoExtractName(firstToken.info)
  const secondTokenName = infoExtractName(secondToken.info)

  return (
    <TouchableOpacity onPress={onPress} style={styles.root}>
      <View style={styles.tokenInfoContainer}>
        <View style={styles.logoContainer}>
          <AssetLogo style={styles.logoFirst}>
            <TokenInfoIcon info={firstToken.info} size="sm" imageStyle={styles.logoSize} />
          </AssetLogo>

          <AssetLogo style={styles.logoSecond}>
            <TokenInfoIcon info={secondToken.info} size="sm" imageStyle={styles.logoSize} />
          </AssetLogo>
        </View>

        <View>
          <Text style={styles.symbol}>{`${firstTokenName} ${splitTokenSymbol} ${secondTokenName}`}</Text>

          <Text style={styles.dexName}>{tokenInfo.dex.name}</Text>
        </View>
      </View>

      <View>
        <Text style={styles.sumBalance}>{`${firstTokenBalance} ${firstTokenName}`}</Text>

        <PairedBalance amount={firstToken} textStyle={styles.pairedBalance} />
      </View>
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_row,
      ...atoms.justify_between,
    },
    symbol: {
      color: color.gray_c900,
      ...atoms.body_1_lg_medium,
    },
    logoSize: {width: 26, height: 26},
    logoFirst: {
      ...atoms.rounded_sm,
      ...atoms.absolute,
      top: 0,
      left: 0,
      width: 26,
      height: 26,
    },
    logoSecond: {
      ...atoms.rounded_sm,
      ...atoms.absolute,
      bottom: 0,
      right: 0,
      width: 26,
      height: 26,
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
    pairedBalance: {
      color: color.gray_c600,
      ...atoms.body_3_sm_regular,
      ...atoms.text_right,
    },
  })

  return {styles} as const
}
