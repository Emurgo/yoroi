import {useSwap, useSwapPoolsByPair} from '@yoroi/swap'
import {Swap} from '@yoroi/types'
import BigNumber from 'bignumber.js'
import React from 'react'
import {StyleSheet, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {Icon} from '../../../../../../components'
import {LoadingOverlay} from '../../../../../../components/LoadingOverlay'
import {useLanguage} from '../../../../../../i18n'
import {COLORS} from '../../../../../../theme'
import {ButtonGroup} from '../../../../common/ButtonGroup/ButtonGroup'
import {useStrings} from '../../../../common/strings'
import {useSwapTouched} from '../../../../common/SwapFormProvider'

const PRECISION = 10

export const TopTokenActions = () => {
  const strings = useStrings()
  const {numberLocale} = useLanguage()
  const orderTypeLabels = [strings.marketButton, strings.limitButton]
  const {createOrder, orderTypeChanged, limitPriceChanged, selectedPoolChanged} = useSwap()
  const {isBuyTouched, isSellTouched} = useSwapTouched()
  const isDisabled = !isBuyTouched || !isSellTouched || createOrder.selectedPool === undefined
  const orderTypeIndex = createOrder.type === 'market' ? 0 : 1

  const {refetch, isLoading} = useSwapPoolsByPair(
    {
      tokenA: createOrder.amounts.sell.tokenId ?? '',
      tokenB: createOrder.amounts.buy.tokenId ?? '',
    },
    {
      onSuccess: (poolList: Swap.Pool[]) => {
        const bestPool = poolList.sort((a: Swap.Pool, b: Swap.Pool) => a.price - b.price).find(() => true)
        const defaultPrice = createOrder.marketPrice
        const formattedValue = BigNumber(defaultPrice).decimalPlaces(PRECISION).toFormat(numberLocale)
        selectedPoolChanged(bestPool)
        limitPriceChanged(formattedValue)
      },
    },
  )

  const handleSelectOrderType = (index: number) => {
    if (index === 0) {
      refetch()
      orderTypeChanged('market')
    } else {
      orderTypeChanged('limit')
    }
  }

  return (
    <View style={styles.buttonsGroup}>
      <ButtonGroup
        labels={orderTypeLabels}
        onSelect={(index) => handleSelectOrderType(index)}
        selected={orderTypeIndex}
      />

      <TouchableOpacity onPress={() => refetch()} disabled={isDisabled}>
        <Icon.Refresh size={24} color={isDisabled ? COLORS.DISABLED : ''} />
      </TouchableOpacity>

      <LoadingOverlay loading={isLoading} />
    </View>
  )
}

const styles = StyleSheet.create({
  buttonsGroup: {
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})
