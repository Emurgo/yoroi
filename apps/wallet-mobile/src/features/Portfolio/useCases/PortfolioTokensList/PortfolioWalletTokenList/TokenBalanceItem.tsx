import {amountBreakdown, infoExtractName, isPrimaryToken} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Spacer} from '../../../../../components'
import {PairedBalance} from '../../../../../components/PairedBalance/PairedBalance'
import {useCurrencyPairing} from '../../../../Settings/Currency'
import {usePrivacyMode} from '../../../../Settings/PrivacyMode/PrivacyMode'
import {formatPriceChange, priceChange} from '../../../common/helpers/priceChange'
import {useNavigateTo} from '../../../common/hooks/useNavigateTo'
import {PnlTag} from '../../../common/PnlTag/PnlTag'
import {usePortfolioTokenActivity} from '../../../common/PortfolioTokenActivityProvider'
import {TokenInfoIcon} from '../../../common/TokenAmountItem/TokenInfoIcon'

type Props = {
  amount: Portfolio.Token.Amount
}
export const TokenBalanceItem = ({amount}: Props) => {
  const {styles} = useStyles()
  const navigationTo = useNavigateTo()
  const {isPrivacyActive, privacyPlaceholder} = usePrivacyMode()

  const {info} = amount
  const name = infoExtractName(info)
  const symbol = infoExtractName(info, {mode: 'currency'})
  const balanceFormatted = isPrivacyActive ? privacyPlaceholder : amountBreakdown(amount).bn.toFormat(2)

  const ptActivity = useCurrencyPairing().ptActivity

  const {tokenActivity} = usePortfolioTokenActivity()

  const secondaryActivity = tokenActivity?.[info.id]?.price

  const {close, open} = isPrimaryToken(info)
    ? ptActivity
    : {close: secondaryActivity?.close.toNumber(), open: secondaryActivity?.open.toNumber()}

  const {changePercent, variantPnl} = priceChange(open ?? 0, close ?? 0)
  const isMissingPrices = close === undefined || open === undefined

  return (
    <TouchableOpacity onPress={() => navigationTo.tokenDetail({id: info.id})} style={styles.root}>
      <View style={[styles.rowCenter, styles.tokenInfoContainer]}>
        <TokenInfoIcon info={info} size="md" />

        <Spacer width={12} />

        <View style={styles.nameAndPnlContainer}>
          <Text numberOfLines={1} ellipsizeMode="middle" style={styles.symbol}>
            {name}
          </Text>

          <PnlTag withIcon variant={variantPnl}>
            <Text>{isMissingPrices ? '—— ' : formatPriceChange(changePercent)}%</Text>
          </PnlTag>
        </View>
      </View>

      <View>
        <Text style={styles.tokenBalance}>{`${balanceFormatted} ${symbol}`}</Text>

        <PairedBalance hidePrimaryPair amount={amount} textStyle={styles.pairedBalance} />
      </View>
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      backgroundColor: color.bg_color_max,
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.justify_between,
      ...atoms.gap_lg,
    },
    rowCenter: {
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.justify_start,
    },
    tokenInfoContainer: {
      ...atoms.flex_1,
    },
    symbol: {
      ...atoms.body_1_lg_medium,
      ...atoms.font_semibold,
      color: color.gray_900,
    },
    tokenBalance: {
      ...atoms.body_1_lg_regular,
      ...atoms.text_right,
      color: color.gray_900,
    },
    pairedBalance: {
      ...atoms.body_3_sm_regular,
      ...atoms.text_right,
      color: color.gray_600,
    },
    nameAndPnlContainer: {
      ...atoms.flex_col,
      ...atoms.align_start,
      flex: 1,
    },
  })

  return {styles} as const
}
