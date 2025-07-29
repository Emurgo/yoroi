import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {
  Animated,
  GestureResponderEvent,
  Pressable,
  PressableProps,
  View,
} from 'react-native'

import {Icon} from '~/ui/Icon'
import type {IconProps} from '~/ui/Icon/type'

export type RefreshButtonProps = Omit<PressableProps, 'style' | 'children'>
export const RefreshButton = (props: RefreshButtonProps) => {
  const {disabled, onPress, ...rest} = props

  const {palette: p} = useTheme()
  const spin = React.useRef(new Animated.Value(0)).current

  const handleOnPress = (event: GestureResponderEvent) => {
    Animated.timing(spin, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => spin.setValue(0))
    onPress?.(event)
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

  const backgroundColors: Colors = {
    idle: 'transparent',
    pressed: p.gray_100,
    disabled: 'transparent',
  }

  const foregroundColors: Colors = {
    idle: p.text_gray_medium,
    pressed: p.text_gray_max,
    disabled: p.text_gray_min,
  }

  const backgroundColor = disabled
    ? backgroundColors.disabled
    : backgroundColors.idle
  const foregroundColor = disabled
    ? foregroundColors.disabled
    : foregroundColors.idle

  const iconProps: IconProps = {
    size: 20,
    color: foregroundColor,
  }

  const iconPropsPressed: IconProps = {
    size: iconProps.size,
    color: foregroundColors.pressed,
  }

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      onPress={handleOnPress}
      style={({pressed}) => [
        a.flex,
        a.flex_grow,
        a.flex_row,
        a.align_start,
        a.justify_center,
        {width: 26, height: 26},
        a.rounded_full,
        {backgroundColor: pressed ? backgroundColors.pressed : backgroundColor},
      ]}
    >
      {({pressed}) => (
        <View style={[a.justify_center, {height: 22, overflow: 'visible'}]}>
          <Animated.View style={getRotationStyle()}>
            <Icon.Reload {...(pressed ? iconPropsPressed : iconProps)} />
          </Animated.View>
        </View>
      )}
    </Pressable>
  )
}

type Colors = {
  idle: string
  pressed: string
  disabled: string
}
