import {amountBreakdown, infoExtractName, isPrimaryToken} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Spacer} from '../../../../../components'
import {PairedBalance} from '../../../../../components/PairedBalance/PairedBalance'
import {useCurrencyPairing} from '../../../../Settings/Currency'
import {formatPriceChange, priceChange} from '../../../common/helpers/priceChange'
import {PnlTag} from '../../../common/PnlTag/PnlTag'
import {usePortfolioTokenActivity} from '../../../common/PortfolioTokenActivityProvider'
import {TokenInfoIcon} from '../../../common/TokenAmountItem/TokenInfoIcon'
import {useNavigateTo} from '../../../common/useNavigateTo'

type Props = {
  amount: Portfolio.Token.Amount
}
export const TokenBalanceItem = ({amount}: Props) => {
  const {styles} = useStyles()
  const navigationTo = useNavigateTo()
  const {info} = amount
  const name = infoExtractName(info)
  const symbol = infoExtractName(info, {mode: 'currency'})
  const balanceFormatted = amountBreakdown(amount).bn.toFormat(2)

  const adaPrice = useCurrencyPairing().adaPrice

  const {tokenActivity} = usePortfolioTokenActivity()

  const nonAdaPrice = tokenActivity?.[info.id]?.price24h

  const {price, previous} = isPrimaryToken(info)
    ? adaPrice
    : {price: nonAdaPrice?.close.toNumber() ?? 0, previous: nonAdaPrice?.open.toNumber() ?? 0}

  const {changePercent, variantPnl} = priceChange(previous, price)

  return (
    <TouchableOpacity onPress={() => navigationTo.tokenDetail({id: info.id})} style={styles.root}>
      <View style={[styles.rowCenter, styles.tokenInfoContainer]}>
        <TokenInfoIcon info={info} size="md" />

        <Spacer width={12} />

        <View style={styles.nameAndPnlContainer}>
          <Text numberOfLines={1} ellipsizeMode="middle" style={styles.symbol}>
            {name}
          </Text>

          {price !== 0 && (
            <PnlTag withIcon variant={variantPnl}>
              <Text>{formatPriceChange(changePercent)}%</Text>
            </PnlTag>
          )}
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
      backgroundColor: color.bg_color_high,
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
      color: color.gray_c900,
    },
    tokenBalance: {
      ...atoms.body_1_lg_regular,
      ...atoms.text_right,
      color: color.gray_c900,
    },
    pairedBalance: {
      ...atoms.body_3_sm_regular,
      ...atoms.text_right,
      color: color.gray_c600,
    },
    nameAndPnlContainer: {
      ...atoms.flex_col,
      ...atoms.align_start,
      flex: 1,
    },
  })

  return {styles} as const
}
