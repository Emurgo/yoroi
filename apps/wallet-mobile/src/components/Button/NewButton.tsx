import {useTheme} from '@yoroi/theme'
import React from 'react'
import {ActivityIndicator, Pressable, PressableProps, StyleSheet, TextStyle, View, ViewStyle} from 'react-native'

import type {IconProps} from '../Icon'
import {Text} from '../Text'

export const ButtonType = {
  Primary: 'Primary',
  Secondary: 'Secondary',
  Critical: 'Critical',
  Text: 'Text',
  SecondaryText: 'SecondaryText',
  Circle: 'Circle',
  Link: 'Link',
} as const

export type ButtonType = (typeof ButtonType)[keyof typeof ButtonType]

export type ButtonProps = {
  type?: ButtonType
  size?: 'M' | 'S'
  title?: string
  icon?: (p: IconProps) => React.JSX.Element
  isLoading?: boolean
  rightIcon?: boolean
  style?: ViewStyle
  fontOverride?: TextStyle
} & Omit<PressableProps, 'style' | 'children'>

export const Button = (props: ButtonProps) => {
  const {type, size, title, icon: Icon, isLoading, rightIcon, disabled, style, fontOverride, ...rest} = props

  const {styles, iconProps, iconPropsPressed} = useStyles({type, size, rightIcon, disabled, fontOverride})

  return (
    <Pressable
      disabled={isLoading || disabled}
      style={({pressed}) => [styles.container, pressed && styles.containerPressed, style]}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator {...iconProps} />
      ) : (
        ({pressed}) => (
          <>
            {Icon && (
              <View style={styles.iconWrapper}>
                <Icon {...(pressed ? iconPropsPressed : iconProps)} />
              </View>
            )}

            {title != null && type !== ButtonType.Circle && (
              <Text style={[styles.text, pressed && styles.textPressed]}>{title}</Text>
            )}
          </>
        )
      )}
    </Pressable>
  )
}

type Colors = {
  idle: string
  pressed: string
  disabled: string
}

const useStyles = ({
  type = ButtonType.Primary,
  size = 'M',
  rightIcon,
  disabled,
  fontOverride,
}: Pick<ButtonProps, 'type' | 'size' | 'rightIcon' | 'disabled' | 'fontOverride'>) => {
  const {color, atoms} = useTheme()

  const backgroundColors: Colors = {
    [ButtonType.Primary]: {idle: color.primary_500, pressed: color.primary_600, disabled: color.primary_200},
    [ButtonType.Secondary]: {idle: 'transparent', pressed: color.primary_100, disabled: 'transparent'},
    [ButtonType.Critical]: {
      idle: color.sys_magenta_500,
      pressed: color.sys_magenta_600,
      disabled: color.sys_magenta_300,
    },
    [ButtonType.Text]: {idle: 'transparent', pressed: color.gray_100, disabled: 'transparent'},
    [ButtonType.SecondaryText]: {idle: 'transparent', pressed: color.gray_100, disabled: 'transparent'},
    [ButtonType.Circle]: {idle: color.primary_500, pressed: color.primary_600, disabled: color.primary_200},
    [ButtonType.Link]: {idle: 'transparent', pressed: 'transparent', disabled: 'transparent'},
  }[type]

  const foregroundColors: Colors = {
    [ButtonType.Primary]: {idle: color.white_static, pressed: color.white_static, disabled: color.gray_min},
    [ButtonType.Secondary]: {
      idle: color.text_primary_medium,
      pressed: color.text_primary_max,
      disabled: color.text_primary_min,
    },
    [ButtonType.Critical]: {idle: color.white_static, pressed: color.white_static, disabled: color.white_static},
    [ButtonType.Text]: {
      idle: color.text_primary_medium,
      pressed: color.text_primary_max,
      disabled: color.text_primary_min,
    },
    [ButtonType.SecondaryText]: {
      idle: color.text_gray_medium,
      pressed: color.text_gray_max,
      disabled: color.text_gray_min,
    },
    [ButtonType.Circle]: {idle: color.white_static, pressed: color.white_static, disabled: color.gray_min},
    [ButtonType.Link]: {
      idle: color.text_primary_medium,
      pressed: color.text_primary_max,
      disabled: color.text_primary_min,
    },
  }[type]

  const backgroundColor = disabled ? backgroundColors.disabled : backgroundColors.idle
  const foregroundColor = disabled ? foregroundColors.disabled : foregroundColors.idle

  let shape: ViewStyle = {}
  switch (type) {
    case ButtonType.Primary:
    case ButtonType.Secondary:
    case ButtonType.Critical:
      shape =
        size === 'M'
          ? {...atoms.py_lg, ...atoms.px_xl, ...atoms.gap_sm, ...atoms.rounded_sm}
          : {...atoms.py_md, ...atoms.px_lg, ...atoms.gap_xs, ...atoms.rounded_sm}
      break
    case ButtonType.Text:
    case ButtonType.SecondaryText:
    case ButtonType.Link:
      shape =
        size === 'M'
          ? {...atoms.p_md, ...atoms.gap_xs, ...atoms.rounded_sm}
          : {...atoms.p_sm, ...atoms.gap_2xs, ...atoms.rounded_sm}
      break
    case ButtonType.Circle:
      shape = {width: 56, height: 56, ...atoms.align_center, ...atoms.rounded_full}
      break
  }
  const font =
    fontOverride ??
    (type === ButtonType.Link
      ? size === 'M'
        ? atoms.link_1_lg
        : atoms.link_2_md
      : size === 'M'
      ? atoms.button_1_lg
      : atoms.button_2_md)

  const styles = StyleSheet.create({
    container: {
      backgroundColor,
      ...atoms.flex,
      ...atoms.flex_grow,
      ...atoms.flex_row,
      ...atoms.align_start,
      ...atoms.justify_center,
      ...shape,
      ...(rightIcon && atoms.flex_row_reverse),
      ...(type === ButtonType.Secondary && {borderWidth: 2, borderColor: foregroundColor}),
    },
    containerPressed: {
      backgroundColor: backgroundColors.pressed,
      ...(type === ButtonType.Secondary && {borderColor: foregroundColors.pressed}),
    },
    iconWrapper: {
      ...atoms.justify_center,
      height: font.lineHeight ?? 22,
      overflow: 'visible',
    },
    text: {
      ...atoms.flex_shrink,
      color: foregroundColor,
      ...font,
    },
    textPressed: {
      color: foregroundColors.pressed,
    },
  })

  const iconProps: IconProps = {
    size: size === 'M' ? 28 : 24,
    color: foregroundColor,
  }

  const iconPropsPressed: IconProps = {
    size: iconProps.size,
    color: foregroundColors.pressed,
  }

  return {styles, iconProps, iconPropsPressed} as const
}
