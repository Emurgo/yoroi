import {useSwap, useSwapPoolsByPair} from '@yoroi/swap'
import React from 'react'
import {Animated, Keyboard, StyleSheet, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {Icon} from '../../../../../../components'
import {LoadingOverlay} from '../../../../../../components/LoadingOverlay'
import {COLORS} from '../../../../../../theme'
import {ButtonGroup} from '../../../../common/ButtonGroup/ButtonGroup'
import {useStrings} from '../../../../common/strings'
import {useSwapTouched} from '../../../../common/SwapFormProvider'

export const TopTokenActions = () => {
  const strings = useStrings()
  const orderTypeLabels = [strings.marketButton, strings.limitButton]
  const {orderData, orderTypeChanged, poolPairsChanged} = useSwap()
  const {isBuyTouched, isSellTouched} = useSwapTouched()
  const isDisabled = !isBuyTouched || !isSellTouched || orderData.selectedPoolCalculation === undefined
  const orderTypeIndex = orderData.type === 'market' ? 0 : 1

  const {refetch, isLoading} = useSwapPoolsByPair(
    {
      tokenA: orderData.amounts.sell.tokenId,
      tokenB: orderData.amounts.buy.tokenId,
    },
    {
      enabled: false,
      onSuccess: (pools) => {
        poolPairsChanged(pools)
      },
    },
  )

  const handleSelectOrderType = (index: number) => {
    if (index === 0) {
      orderTypeChanged('market')
    } else {
      orderTypeChanged('limit')
    }
  }

  const handleRefresh = () => {
    Keyboard.dismiss()
    refetch()
  }

  return (
    <View style={styles.buttonsGroup}>
      <ButtonGroup
        labels={orderTypeLabels}
        onSelect={(index) => handleSelectOrderType(index)}
        selected={orderTypeIndex}
      />

      <RefreshIcon onPress={handleRefresh} disabled={isDisabled} />

      <LoadingOverlay loading={isLoading} />
    </View>
  )
}

const RefreshIcon = ({onPress, disabled}: {onPress: () => void; disabled: boolean}) => {
  const spin = React.useRef(new Animated.Value(0)).current

  const handleOnPress = () => {
    Animated.timing(spin, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => spin.setValue(0))
    onPress()
  }

  return (
    <TouchableOpacity activeOpacity={0.5} onPress={handleOnPress} disabled={disabled}>
      <Animated.View
        style={{
          transform: [
            {
              rotate: spin.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '180deg'],
              }),
            },
          ],
        }}
      >
        <Icon.Refresh size={24} color={disabled ? COLORS.DISABLED : ''} />
      </Animated.View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  buttonsGroup: {
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})
