import {infoExtractName} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Spacer} from '../../../../../components'
import {useCurrencyPairing} from '../../../../Settings/Currency'
import {PnlTag} from '../../../common/PnlTag/PnlTag'
import {usePortfolio} from '../../../common/PortfolioProvider'
import {useGetQuantityChange} from '../../../common/useGetQuantityChange'
import {useQuantityChange} from '../../../common/useQuantityChange'
import {SkeletonQuantityChange} from './SkeletonQuantityChange'
import {TokenValueBalance} from './TokenValueBalance'
import {TokenValuePairedBalance} from './TokenValuePairedBalance'

type Props = {
  amount: Portfolio.Token.Amount
  headerCard: React.ReactNode
}

export const TotalTokensValueContent = ({amount, headerCard}: Props) => {
  const {styles} = useStyles()
  const name = infoExtractName(amount.info)
  const quantityChangeData = useGetQuantityChange({name, quantity: amount.quantity})
  const {previousQuantity} = quantityChangeData ?? {}
  const {
    currency,
    adaPrice: {price},
  } = useCurrencyPairing()
  const {isPrimaryTokenActive, setIsPrimaryTokenActive} = usePortfolio()

  const {variantPnl, quantityChange, quantityChangePercent, pairedBalanceChange} = useQuantityChange({
    quantity: amount.quantity,
    previousQuantity,
    decimals: amount.info.decimals,
  })

  const isFetching = quantityChangeData?.previousQuantity === undefined || price === undefined

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
                <Text>{quantityChangePercent}%</Text>
              </PnlTag>
            )}

            {isFetching ? (
              <SkeletonQuantityChange />
            ) : (
              <PnlTag variant={variantPnl}>
                <Text>{`${Number(quantityChange) > 0 ? '+' : ''}${pairedBalanceChange} ${currency}`}</Text>
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
