import {amountBreakdown, infoExtractName} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Image, ImageSourcePropType, ImageStyle, StyleSheet, Text, View} from 'react-native'

import {PairedBalance} from '../../../../../components/PairedBalance/PairedBalance'
import {CurrencySymbol} from '../../../../../yoroi-wallets/types'
import {useCurrencyPairing} from '../../../../Settings/Currency'
import {AssetLogo} from '../../../common/AssetLogo/AssetLogo'
import {usePortfolio} from '../../../common/PortfolioProvider'
import {TokenInfoIcon} from '../../../common/TokenAmountItem/TokenInfoIcon'
import {ILiquidityPool} from '../../../common/useGetLiquidityPool'
import {useStrings} from '../../../common/useStrings'

type Props = {
  tokenInfo: ILiquidityPool
  splitTokenSymbol: string
}

export const LiquidityPoolModal = ({tokenInfo, splitTokenSymbol}: Props) => {
  const strings = useStrings()
  const {styles} = useStyles()

  const [firstToken, secondToken] = tokenInfo.assets
  const firstTokenBalance = amountBreakdown(firstToken).bn.toFormat(2)
  const secondTokenBalance = amountBreakdown(secondToken).bn.toFormat(2)
  const firstTokenName = infoExtractName(firstToken.info)
  const secondTokenName = infoExtractName(secondToken.info)

  const {isPrimaryTokenActive} = usePortfolio()
  const {currency} = useCurrencyPairing()
  const currencyPaired = isPrimaryTokenActive ? 'ADA' : currency

  return (
    <View style={styles.root}>
      <View style={styles.tokenInfoContainer}>
        <View style={styles.logoContainer}>
          <AssetLogo style={styles.logoFirst}>
            <TokenInfoIcon info={firstToken.info} size="sm" imageStyle={styles.logoSize} />
          </AssetLogo>

          <AssetLogo style={styles.logoSecond}>
            <TokenInfoIcon info={secondToken.info} size="sm" imageStyle={styles.logoSize} />
          </AssetLogo>
        </View>

        <Text style={styles.symbol}>{`${firstTokenName} ${splitTokenSymbol} ${secondTokenName}`}</Text>
      </View>

      <InfoGroup label={strings.value}>
        <View>
          <Text style={styles.valueNumber}>{`${firstTokenBalance} ${firstTokenName}`}</Text>

          <PairedBalance
            isHidePairPrimaryToken={false}
            currency={currencyPaired as CurrencySymbol}
            amount={firstToken}
            textStyle={styles.pairedBalance}
          />
        </View>
      </InfoGroup>

      <InfoGroup label={strings.dex}>
        <View style={styles.dexContainer}>
          <DexLogo source={tokenInfo.dex.logo} style={styles.dexLogo} />

          <Text style={styles.dexName}>{tokenInfo.dex.name}</Text>
        </View>
      </InfoGroup>

      <InfoGroup label={strings.lp}>
        <Text style={styles.valueNumber}>{firstTokenBalance}</Text>
      </InfoGroup>

      <InfoGroup label={firstTokenName}>
        <Text style={styles.valueNumber}>{firstTokenBalance}</Text>
      </InfoGroup>

      <InfoGroup label={secondTokenName}>
        <Text style={styles.valueNumber}>{secondTokenBalance}</Text>
      </InfoGroup>
    </View>
  )
}

type InfoGroupProps = {
  label: string
}
const InfoGroup = ({children, label}: React.PropsWithChildren<InfoGroupProps>) => {
  const {styles} = useStyles()

  return (
    <View style={styles.rowBetween}>
      <Text style={styles.label}>{label}</Text>

      <View>{children}</View>
    </View>
  )
}

const DexLogo = ({source, style}: {source: string | ImageSourcePropType; style: ImageStyle}) => {
  return <Image source={typeof source === 'string' ? {uri: source} : source} style={[style]} />
}

const useStyles = () => {
  const {atoms, color} = useTheme()

  const styles = StyleSheet.create({
    root: {
      ...atoms.pl_lg,
      ...atoms.flex_col,
      ...atoms.gap_sm,
      paddingVertical: 14,
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
      ...atoms.align_center,
      ...atoms.gap_md,
    },
    symbol: {
      ...atoms.body_1_lg_medium,
      color: color.gray_c900,
    },
    rowBetween: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.align_center,
    },
    label: {
      ...atoms.body_1_lg_regular,
      color: color.gray_c600,
    },
    valueNumber: {
      ...atoms.body_1_lg_regular,
      ...atoms.text_right,
      color: color.gray_c900,
    },
    pairedBalance: {
      ...atoms.body_3_sm_regular,
      ...atoms.text_right,
      color: color.gray_c600,
    },
    dexLogo: {
      width: 32,
      height: 32,
    },
    dexName: {
      ...atoms.body_1_lg_medium,
      ...atoms.font_semibold,
      color: color.primary_c500,
    },
    dexContainer: {
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.justify_end,
      ...atoms.gap_xs,
    },
  })

  return {styles} as const
}
