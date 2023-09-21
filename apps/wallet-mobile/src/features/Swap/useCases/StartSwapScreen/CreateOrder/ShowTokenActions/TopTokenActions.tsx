import {getBuyAmount, useSwap, useSwapPoolsByPair} from '@yoroi/swap'
import React from 'react'
import {StyleSheet, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {Icon} from '../../../../../../components'
import {LoadingOverlay} from '../../../../../../components/LoadingOverlay'
import {COLORS} from '../../../../../../theme'
import {asQuantity} from '../../../../../../yoroi-wallets/utils'
import {ButtonGroup} from '../../../../common/ButtonGroup/ButtonGroup'
import {useStrings} from '../../../../common/strings'
import {useSwapTouched} from '../../../../common/SwapFormProvider'

export const TopTokenActions = () => {
  const strings = useStrings()
  const orderTypeLabels = [strings.marketButton, strings.limitButton]
  const {createOrder, orderTypeChanged, selectedPoolChanged, limitPriceChanged, buyAmountChanged} = useSwap()
  const {isBuyTouched, isSellTouched} = useSwapTouched()
  const isDisabled = !isBuyTouched || !isSellTouched || createOrder.selectedPool === undefined
  const orderTypeIndex = createOrder.type === 'market' ? 0 : 1

  const {refetch, isLoading, poolList} = useSwapPoolsByPair({
    tokenA: createOrder.amounts.sell.tokenId ?? '',
    tokenB: createOrder.amounts.buy.tokenId ?? '',
  })

  const handleSelectOrderType = (index: number) => {
    if (index === 0) {
      handleSync()
    } else {
      orderTypeChanged('limit')
    }
  }

  const handleSync = () => {
    orderTypeChanged('market')
    refetch()
    if (poolList !== undefined) {
      const bestPool = poolList.map((a) => a).sort((a, b) => a.price - b.price)[0]
      selectedPoolChanged(bestPool)

      const defaultPrice =
        isBuyTouched && isSellTouched && bestPool.price !== undefined && !Number.isNaN(bestPool.price)
          ? bestPool.price
          : 0

      limitPriceChanged(asQuantity(defaultPrice))

      const buy = getBuyAmount(createOrder?.selectedPool, {
        quantity: createOrder.amounts.sell.quantity,
        tokenId: createOrder.amounts.sell.tokenId,
      })

      buyAmountChanged({
        quantity: buy?.quantity,
        tokenId: createOrder.amounts.buy.tokenId,
      })
    }
  }

  return (
    <View style={styles.buttonsGroup}>
      <ButtonGroup
        labels={orderTypeLabels}
        onSelect={(index) => handleSelectOrderType(index)}
        selected={orderTypeIndex}
      />

      <TouchableOpacity onPress={handleSync} disabled={isDisabled}>
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
