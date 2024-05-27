import {useTheme} from '@yoroi/theme'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import {Linking, StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {AssetLogo} from '../../../common/AssetLogo/AssetLogo'
import {IOpenOrders} from '../../../common/useGetOpenOrders'
import {useStrings} from '../../../common/useStrings'

type Props = {
  tokenInfo?: IOpenOrders
  splitTokenSymbol: string
}

export const OpenOrderModal = ({tokenInfo, splitTokenSymbol}: Props) => {
  const strings = useStrings()
  const {styles} = useStyles()

  if (!tokenInfo) return <></>

  const [firstToken, secondToken] = tokenInfo.assets
  const firstTokenBalance = new BigNumber(firstToken.balance)
  const secondTokenBalance = new BigNumber(secondToken.balance)
  const sumBalance = firstTokenBalance.plus(secondTokenBalance)
  const usdExchangeRate = tokenInfo.usdExchangeRate ?? 1
  const usd = sumBalance.multipliedBy(usdExchangeRate)
  const sumBalanceFormatted = sumBalance.toFixed(2)
  const usdFormatted = usd.toFixed(2)
  const firstTokenBalanceFormatted = firstTokenBalance.toFixed(2)
  const secondTokenBalanceFormatted = secondTokenBalance.toFixed(2)

  return (
    <View style={styles.root}>
      <View style={styles.tokenInfoContainer}>
        <View style={styles.logoContainer}>
          <AssetLogo source={firstToken.logo} style={styles.logoFirst} />

          <AssetLogo source={secondToken.logo} style={styles.logoSecond} />
        </View>

        <Text style={styles.symbol}>
          {`${tokenInfo.assets[0].symbol} ${splitTokenSymbol} ${tokenInfo.assets[1].symbol}`}
        </Text>
      </View>

      <InfoGroup label={strings.total}>
        <View>
          <Text style={styles.valueNumber}>{sumBalanceFormatted} ADA</Text>

          <Text style={styles.usdNumber}>{usdFormatted} USD</Text>
        </View>
      </InfoGroup>

      <InfoGroup label={strings.dex}>
        <View style={styles.dexContainer}>
          <AssetLogo source={tokenInfo.dex.logo} style={styles.dexLogo} />

          <Text style={styles.dexName}>{tokenInfo.dex.name}</Text>
        </View>
      </InfoGroup>

      <InfoGroup label={strings.assetPrice}>
        <Text style={styles.valueNumber}>
          {`${firstTokenBalanceFormatted} ${firstToken.symbol}/${secondToken.symbol}`}
        </Text>
      </InfoGroup>

      <InfoGroup label={strings.assetAmount}>
        <Text style={styles.valueNumber}>{`${secondTokenBalanceFormatted} ${secondToken.symbol}`}</Text>
      </InfoGroup>

      <InfoGroup label={strings.txId}>
        <TxLink
          txId={shortenString('f23ad8f38f23ad8f38f23ad8f38f23ad8f38bcb')}
          onTxPress={() => Linking.openURL('http://')}
        />
      </InfoGroup>
    </View>
  )
}

const shortenString = (text: string) => {
  if (text.length > 14) {
    return text.substring(0, 9) + '...' + text.substring(text.length - 4)
  }
  return text
}

const TxLink = ({onTxPress, txId}: {onTxPress: () => void; txId: string}) => {
  const {styles} = useStyles()
  return (
    <TouchableOpacity onPress={onTxPress}>
      <Text style={styles.transaction}>{txId}</Text>
    </TouchableOpacity>
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

const useStyles = () => {
  const {atoms, color} = useTheme()

  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_col,
      ...atoms.gap_sm,
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
    usdNumber: {
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
    transaction: {
      color: color.primary_c500,
      ...atoms.link_2_md_underline,
    },
  })

  return {styles} as const
}
