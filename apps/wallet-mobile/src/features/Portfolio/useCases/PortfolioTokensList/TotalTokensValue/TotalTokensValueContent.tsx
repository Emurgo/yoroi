import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Icon, Spacer} from '../../../../../components'
import {useCurrencyPairing} from '../../../../Settings/Currency'
import {usePrivacyMode} from '../../../../Settings/PrivacyMode/PrivacyMode'
import {formatPriceChange, priceChange} from '../../../common/helpers/priceChange'
import {PnlTag} from '../../../common/PnlTag/PnlTag'
import {usePortfolio} from '../../../common/PortfolioProvider'
import {SkeletonQuantityChange} from './SkeletonQuantityChange'
import {TokenValueBalance} from './TokenValueBalance'
import {TokenValuePairedBalance} from './TokenValuePairedBalance'

type Props = {
  amount: Portfolio.Token.Amount
  headerCard: React.ReactNode
}

export const TotalTokensValueContent = ({amount, headerCard}: Props) => {
  const {styles, color} = useStyles()
  const {
    currency,
    config,
    ptActivity: {close, open},
    isLoading,
  } = useCurrencyPairing()
  const {isPrimaryTokenActive, setIsPrimaryTokenActive} = usePortfolio()
  const {togglePrivacyMode} = usePrivacyMode()

  const {changePercent, changeValue, variantPnl} = priceChange(open, close)

  return (
    <View>
      {headerCard}

      <Spacer height={6} />

      <View style={styles.balanceContainer}>
        <View style={styles.balanceBox}>
          <TouchableOpacity style={styles.balanceBox} onPress={() => togglePrivacyMode()}>
            <TokenValueBalance
              rate={close}
              amount={amount}
              isFetching={isLoading}
              isPrimaryTokenActive={isPrimaryTokenActive}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => setIsPrimaryTokenActive(!isPrimaryTokenActive)}>
            <Icon.Change color={color.el_gray_max} />
          </TouchableOpacity>
        </View>

        <View style={styles.rowBetween}>
          <TokenValuePairedBalance amount={amount} isFetching={isLoading} isPrimaryTokenActive={isPrimaryTokenActive} />

          <View style={styles.varyContainer}>
            {isLoading ? (
              <SkeletonQuantityChange />
            ) : (
              <PnlTag variant={variantPnl} withIcon>
                <Text>{formatPriceChange(changePercent)}%</Text>
              </PnlTag>
            )}

            {isLoading ? (
              <SkeletonQuantityChange />
            ) : (
              <PnlTag variant={variantPnl}>
                <Text>{`${changeValue > 0 ? '+' : ''}${formatPriceChange(
                  changeValue,
                  config.decimals,
                )} ${currency}`}</Text>
              </PnlTag>
            )}
          </View>
        </View>
      </View>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    rowBetween: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.align_center,
    },
    balanceBox: {
      ...atoms.flex_row,
      ...atoms.gap_2xs,
      ...atoms.align_end,
    },
    balanceContainer: {
      ...atoms.gap_2xs,
    },
    button: {
      ...atoms.p_sm,
    },
    varyContainer: {
      ...atoms.flex_row,
      ...atoms.gap_xs,
      ...atoms.align_stretch,
    },
  })

  return {styles, color} as const
}
