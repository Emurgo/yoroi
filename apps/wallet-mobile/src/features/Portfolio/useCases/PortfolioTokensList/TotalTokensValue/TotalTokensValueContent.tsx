import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Spacer} from '../../../../../components'
import {useCurrencyPairing} from '../../../../Settings/Currency'
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
  const {styles} = useStyles()
  const {
    currency,
    config,
    adaPrice: {price, previous},
  } = useCurrencyPairing()
  const {isPrimaryTokenActive, setIsPrimaryTokenActive} = usePortfolio()

  const {changePercent, changeValue, variantPnl} = priceChange(previous, price)

  const isFetching = price === undefined

  return (
    <View>
      {headerCard}

      <Spacer height={6} />

      <View style={styles.balanceContainer}>
        <TouchableOpacity style={styles.balanceBox} onPress={() => setIsPrimaryTokenActive(!isPrimaryTokenActive)}>
          <TokenValueBalance
            rate={price}
            amount={amount}
            isFetching={isFetching}
            isPrimaryTokenActive={isPrimaryTokenActive}
          />
        </TouchableOpacity>

        <View style={styles.rowBetween}>
          <TokenValuePairedBalance
            amount={amount}
            isFetching={isFetching}
            isPrimaryTokenActive={isPrimaryTokenActive}
          />

          <View style={styles.varyContainer}>
            {isFetching ? (
              <SkeletonQuantityChange />
            ) : (
              <PnlTag variant={variantPnl} withIcon>
                <Text>{formatPriceChange(changePercent)}%</Text>
              </PnlTag>
            )}

            {isFetching ? (
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
  const {atoms} = useTheme()
  const styles = StyleSheet.create({
    rowBetween: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.align_center,
    },
    balanceBox: {
      ...atoms.flex_row,
      ...atoms.gap_2xs,
      ...atoms.align_center,
    },
    balanceContainer: {
      ...atoms.gap_2xs,
    },
    varyContainer: {
      ...atoms.flex_row,
      ...atoms.gap_xs,
      ...atoms.align_stretch,
    },
  })

  return {styles} as const
}
