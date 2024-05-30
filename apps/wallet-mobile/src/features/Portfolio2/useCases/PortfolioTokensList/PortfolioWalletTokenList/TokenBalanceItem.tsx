import {amountFormatter, infoExtractName} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Spacer} from '../../../../../components'
import {PairedBalance} from '../../../../../components/PairedBalance/PairedBalance'
import {TokenInfoIcon} from '../../../../../features/Portfolio/common/TokenAmountItem/TokenInfoIcon'
import {useGetQuantityChange} from '../../../../../features/Portfolio2/common/useGetQuantityChange'
import {useQuantityChange} from '../../../../../features/Portfolio2/common/useQuantityChange'
import {PnlTag} from '../../../common/PnlTag/PnlTag'
import {useNavigateTo} from '../../../common/useNavigateTo'

type Props = {
  amount: Portfolio.Token.Amount
}
export const TokenBalanceItem = ({amount}: Props) => {
  const {styles} = useStyles()
  const navigationTo = useNavigateTo()
  const {info, quantity} = amount
  const name = infoExtractName(info)
  const quantityChangeData = useGetQuantityChange({name, quantity})
  const {previousQuantity} = quantityChangeData ?? {}
  const {variantPnl, quantityChangePercent} = useQuantityChange({decimals: info.decimals, quantity, previousQuantity})
  const balanceFormatted = amountFormatter({dropTraillingZeros: true})(amount)

  return (
    <TouchableOpacity onPress={() => navigationTo.tokenDetail({id: info.id, name})} style={styles.root}>
      <View style={[styles.rowCenter, styles.tokenInfoContainer]}>
        <TokenInfoIcon info={info} size="md" />

        <Spacer width={12} />

        <View style={styles.nameAndPnlContainer}>
          <Text numberOfLines={1} ellipsizeMode="middle" style={styles.symbol}>
            {name}
          </Text>

          <PnlTag withIcon variant={variantPnl}>
            <Text>{quantityChangePercent}%</Text>
          </PnlTag>
        </View>
      </View>

      <View>
        <Text style={styles.tokenBalance}>{`${balanceFormatted} ${name.slice(0, 5)}`}</Text>

        <PairedBalance amount={amount} textStyle={styles.pairedBalance} />
      </View>
    </TouchableOpacity>
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
