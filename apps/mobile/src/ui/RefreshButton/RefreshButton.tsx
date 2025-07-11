import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Animated, GestureResponderEvent, Pressable, PressableProps, StyleSheet, View, ViewStyle} from 'react-native'

import {Icon} from '../Icon'
import type {IconProps} from '../Icon/type'

export type RefreshButtonProps = Omit<PressableProps, 'style' | 'children'>
export const RefreshButton = (props: RefreshButtonProps) => {
  const {disabled, onPress, ...rest} = props

  const {styles, iconProps, iconPropsPressed} = useStyles({disabled})
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
  return (
    <Pressable
      {...rest}
      disabled={disabled}
      onPress={handleOnPress}
      style={({pressed}) => [styles.container, pressed && styles.containerPressed]}
    >
      {({pressed}) => (
        <View style={styles.iconWrapper}>
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

const useStyles = ({disabled}: Pick<RefreshButtonProps, 'disabled'>) => {
  const {color, atoms} = useTheme()

  const backgroundColors: Colors = {idle: 'transparent', pressed: color.gray_100, disabled: 'transparent'}

  const foregroundColors: Colors = {
    idle: color.text_gray_medium,
    pressed: color.text_gray_max,
    disabled: color.text_gray_min,
  }

  const backgroundColor = disabled ? backgroundColors.disabled : backgroundColors.idle
  const foregroundColor = disabled ? foregroundColors.disabled : foregroundColors.idle

  const shape: ViewStyle = {width: 26, height: 26, ...atoms.align_center, ...atoms.rounded_full}

  const styles = StyleSheet.create({
    container: {
      backgroundColor,
      ...atoms.flex,
      ...atoms.flex_grow,
      ...atoms.flex_row,
      ...atoms.align_start,
      ...atoms.justify_center,
      ...shape,
    },
    containerPressed: {
      backgroundColor: backgroundColors.pressed,
    },
    iconWrapper: {
      ...atoms.justify_center,
      height: 22,
      overflow: 'visible',
    },
  })

  const iconProps: IconProps = {
    size: 20,
    color: foregroundColor,
  }

  const iconPropsPressed: IconProps = {
    size: iconProps.size,
    color: foregroundColors.pressed,
  }

  return {styles, iconProps, iconPropsPressed} as const
}
