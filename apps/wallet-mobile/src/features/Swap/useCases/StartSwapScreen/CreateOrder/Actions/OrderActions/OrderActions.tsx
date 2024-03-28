import {useSwap, useSwapPoolsByPair} from '@yoroi/swap'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Animated, Keyboard, Pressable, StyleSheet, View} from 'react-native'

import {Icon} from '../../../../../../../components'
import {LoadingOverlay} from '../../../../../../../components/LoadingOverlay'
import {ButtonGroup} from '../../../../../common/ButtonGroup/ButtonGroup'
import {useStrings} from '../../../../../common/strings'
import {useSwapForm} from '../../../../../common/SwapFormProvider'

export const OrderActions = () => {
  const strings = useStrings()
  const {styles} = useStyles()
  const orderTypeLabels = [strings.marketButton, strings.limitButton]
  const {orderData, orderTypeChanged, poolPairsChanged} = useSwap()
  const {
    buyQuantity: {isTouched: isBuyTouched},
    sellQuantity: {isTouched: isSellTouched},
  } = useSwapForm()
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
  const [isActive, setIsActive] = React.useState(false)
  const {colors} = useStyles()

  const handleOnPress = () => {
    Animated.timing(spin, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => spin.setValue(0))
    onPress()
  }
  const getRotationStyle = () => {
    const rotate = spin.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    })

    return {
      transform: [{rotate}],
    }
  }

  return (
    <Pressable
      onPress={handleOnPress}
      disabled={disabled}
      onPressIn={() => setIsActive(true)}
      onPressOut={() => setIsActive(false)}
    >
      <Animated.View style={getRotationStyle()}>
        <Icon.Refresh size={28} color={disabled ? colors.disabled : ''} active={isActive} />
      </Animated.View>
    </Pressable>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color, padding} = theme
  const styles = StyleSheet.create({
    buttonsGroup: {
      ...padding['b-xl'],
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
  })

  const colors = {
    disabled: color.gray[500],
  }

  return {styles, colors}
}
