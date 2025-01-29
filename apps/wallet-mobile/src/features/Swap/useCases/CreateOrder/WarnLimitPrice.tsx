import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Spacer} from '../../../../components/Spacer/Spacer'
import {useStrings} from '../../common/strings'
import {useSwap} from '../../common/SwapProvider'

export const WarnLimitPrice = () => {
  const strings = useStrings()
  const styles = useStyles()
  const swapForm = useSwap()

  const limitPrice = swapForm.wantedPrice
  const marketPrice = swapForm.estimate?.netPrice ?? 0

  const sellTokenInfo = swapForm.tokenInfos.get(swapForm.tokenInInput.tokenId ?? 'unkown.')
  const buyTokenInfo = swapForm.tokenInfos.get(swapForm.tokenOutInput.tokenId ?? 'unkown.')
  const tokenToSellName = sellTokenInfo?.ticker ?? sellTokenInfo?.name ?? '-'
  const tokenToBuyName = buyTokenInfo?.ticker ?? buyTokenInfo?.name ?? '-'
  const name = `${tokenToBuyName}/${tokenToSellName}`

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.description}>{strings.limitPriceWarningDescription}</Text>

        <Spacer height={16} />

        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={styles.label}>{strings.limitPriceWarningYourPrice}</Text>

            <View style={styles.textWrapper}>
              <Text style={styles.value}>{limitPrice}</Text>

              <Text style={styles.value}>{name}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>{strings.limitPriceWarningMarketPrice}</Text>

            <View style={styles.textWrapper}>
              <Text style={styles.value}>{marketPrice}</Text>

              <Text style={styles.value}>{name}</Text>
            </View>
          </View>
        </View>
      </View>

      <Spacer fill />
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    container: {
      ...atoms.justify_between,
      ...atoms.flex_1,
      ...atoms.px_lg,
      ...atoms.pb_lg,
    },
    label: {
      color: color.text_gray_medium,
      ...atoms.body_1_lg_regular,
    },
    value: {
      color: color.text_gray_max,
      ...atoms.body_1_lg_regular,
      ...atoms.text_right,
    },
    textWrapper: {
      ...atoms.flex_1,
      ...atoms.flex_row,
      ...atoms.justify_end,
      ...atoms.align_end,
      ...atoms.flex_wrap,
      ...atoms.gap_xs,
    },
    table: {
      ...atoms.flex_col,
      ...atoms.gap_sm,
    },
    row: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.gap_md,
    },
    description: {
      ...atoms.body_1_lg_regular,
      color: color.text_gray_medium,
    },
  })

  return styles
}
