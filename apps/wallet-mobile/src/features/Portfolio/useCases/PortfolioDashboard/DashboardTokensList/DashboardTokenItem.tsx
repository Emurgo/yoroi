import {amountBreakdown, infoExtractName, isPrimaryToken} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import {PortfolioTokenAmount} from '@yoroi/types/lib/typescript/portfolio/amount'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Spacer} from '../../../../../components'
import {PairedBalance} from '../../../../../components/PairedBalance/PairedBalance'
import {useCurrencyPairing} from '../../../../Settings/Currency'
import {usePrivacyMode} from '../../../../Settings/PrivacyMode/PrivacyMode'
import {formatPriceChange, priceChange} from '../../../common/helpers/priceChange'
import {PnlTag} from '../../../common/PnlTag/PnlTag'
import {usePortfolioTokenActivity} from '../../../common/PortfolioTokenActivityProvider'
import {TokenInfoIcon} from '../../../common/TokenAmountItem/TokenInfoIcon'
import {useNavigateTo} from '../../../common/useNavigateTo'

type Props = {
  tokenInfo: PortfolioTokenAmount
}
export const DashboardTokenItem = ({tokenInfo}: Props) => {
  const {styles} = useStyles()
  const navigationTo = useNavigateTo()
  const {isPrivacyActive, privacyPlaceholder} = usePrivacyMode()
  const formattedQuantity = isPrivacyActive === false ? amountBreakdown(tokenInfo).bn.toFormat(2) : privacyPlaceholder

  const {info} = tokenInfo ?? {}

  const ptActivity = useCurrencyPairing().ptActivity

  const {tokenActivity} = usePortfolioTokenActivity()

  const secondaryActivity = tokenActivity?.[info.id]?.price

  const {open, close} = isPrimaryToken(info)
    ? ptActivity
    : {close: secondaryActivity?.close.toNumber(), open: secondaryActivity?.open.toNumber()}

  const {changePercent, variantPnl} = priceChange(open ?? 0, close ?? 0)
  const isMissingPrices = open === undefined || close === undefined

  return (
    <TouchableOpacity onPress={() => navigationTo.tokenDetail({id: info.id})} style={styles.root}>
      <View style={styles.container}>
        <TokenInfo info={info} />

        <Spacer fill />

        <View style={styles.quantityContainer}>
          <PnlTag withIcon variant={variantPnl}>
            <Text>{isMissingPrices ? '—— ' : formatPriceChange(changePercent)}%</Text>
          </PnlTag>

          <Text ellipsizeMode="tail" numberOfLines={1} style={styles.tokenValue}>
            {formattedQuantity}
          </Text>

          <PairedBalance textStyle={styles.pairedTokenValue} amount={tokenInfo} />
        </View>
      </View>
    </TouchableOpacity>
  )
}

const TokenInfo = ({info}: {info: Portfolio.Token.Info}) => {
  const {styles} = useStyles()
  const name = infoExtractName(info)
  const isPrimary = isPrimaryToken(info)
  const detail = isPrimary ? info.description : info.fingerprint

  return (
    <View style={styles.tokenInfoContainer}>
      <TokenInfoIcon info={info} size="md" />

      <View style={styles.flexFull}>
        <Text numberOfLines={1} ellipsizeMode="middle" style={styles.symbol}>
          {name}
        </Text>

        <Text numberOfLines={1} ellipsizeMode="middle" style={styles.name}>
          {detail}
        </Text>
      </View>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.h_full,
    },
    container: {
      ...atoms.p_lg,
      ...atoms.rounded_sm,
      ...atoms.flex_col,
      ...atoms.align_start,
      ...atoms.border,
      ...atoms.flex_1,
      borderColor: color.gray_300,
      ...atoms.h_full,
    },
    symbol: {
      ...atoms.body_2_md_medium,
      ...atoms.font_semibold,
      color: color.gray_max,
      textTransform: 'uppercase',
    },
    name: {
      ...atoms.body_3_sm_regular,
      color: color.gray_600,
    },
    tokenValue: {
      ...atoms.heading_4_medium,
      ...atoms.font_semibold,
      color: color.gray_max,
    },
    pairedTokenValue: {
      ...atoms.body_3_sm_regular,
      color: color.gray_600,
    },
    tokenInfoContainer: {
      ...atoms.flex_1,
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.gap_sm,
    },
    flexFull: {
      ...atoms.flex_1,
    },
    quantityContainer: {
      ...atoms.flex_col,
      ...atoms.align_start,
    },
  })

  return {styles} as const
}
