import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native'

import type {IconProps} from '../Icon/type'

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
  style?: StyleProp<ViewStyle>
  fontOverride?: TextStyle
  bgColorsOverride?: Colors
  fgColorsOverride?: Colors
} & Omit<PressableProps, 'style' | 'children'>

export const Button = (props: ButtonProps) => {
  const {
    type,
    size,
    title,
    icon: Icon,
    isLoading,
    rightIcon,
    disabled,
    style,
    fontOverride,
    bgColorsOverride,
    fgColorsOverride,
    ...rest
  } = props

  const {styles, iconProps, iconPropsPressed} = useStyles({
    type,
    size,
    rightIcon,
    disabled,
    fontOverride,
    bgColorsOverride,
    fgColorsOverride,
  })

  return (
    <Pressable
      disabled={isLoading || disabled}
      style={({pressed}) => [
        styles.container,
        pressed && styles.containerPressed,
        style,
      ]}
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
              <Text style={[styles.text, pressed && styles.textPressed]}>
                {title}
              </Text>
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
  bgColorsOverride,
  fgColorsOverride,
}: Pick<
  ButtonProps,
  | 'type'
  | 'size'
  | 'rightIcon'
  | 'disabled'
  | 'fontOverride'
  | 'bgColorsOverride'
  | 'fgColorsOverride'
>) => {
  const {palette: p} = useTheme()

  const backgroundColors: Colors =
    bgColorsOverride ??
    {
      [ButtonType.Primary]: {
        idle: p.primary_500,
        pressed: p.primary_600,
        disabled: p.primary_200,
      },
      [ButtonType.Secondary]: {
        idle: 'transparent',
        pressed: p.primary_100,
        disabled: 'transparent',
      },
      [ButtonType.Critical]: {
        idle: p.sys_magenta_500,
        pressed: p.sys_magenta_600,
        disabled: p.sys_magenta_300,
      },
      [ButtonType.Text]: {
        idle: 'transparent',
        pressed: p.gray_100,
        disabled: 'transparent',
      },
      [ButtonType.SecondaryText]: {
        idle: 'transparent',
        pressed: p.gray_100,
        disabled: 'transparent',
      },
      [ButtonType.Circle]: {
        idle: p.primary_500,
        pressed: p.primary_600,
        disabled: p.primary_200,
      },
      [ButtonType.Link]: {
        idle: 'transparent',
        pressed: 'transparent',
        disabled: 'transparent',
      },
    }[type]

  const foregroundColors: Colors =
    fgColorsOverride ??
    {
      [ButtonType.Primary]: {
        idle: p.white_static,
        pressed: p.white_static,
        disabled: p.gray_min,
      },
      [ButtonType.Secondary]: {
        idle: p.text_primary_medium,
        pressed: p.text_primary_max,
        disabled: p.text_primary_min,
      },
      [ButtonType.Critical]: {
        idle: p.gray_min,
        pressed: p.gray_min,
        disabled: p.gray_min,
      },
      [ButtonType.Text]: {
        idle: p.text_primary_medium,
        pressed: p.text_primary_max,
        disabled: p.text_primary_min,
      },
      [ButtonType.SecondaryText]: {
        idle: p.text_gray_medium,
        pressed: p.text_gray_max,
        disabled: p.text_gray_min,
      },
      [ButtonType.Circle]: {
        idle: p.white_static,
        pressed: p.white_static,
        disabled: p.gray_min,
      },
      [ButtonType.Link]: {
        idle: p.text_primary_medium,
        pressed: p.text_primary_max,
        disabled: p.text_primary_min,
      },
    }[type]

  const backgroundColor = disabled
    ? backgroundColors.disabled
    : backgroundColors.idle
  const foregroundColor = disabled
    ? foregroundColors.disabled
    : foregroundColors.idle

  let shape: ViewStyle = {}
  switch (type) {
    case ButtonType.Primary:
    case ButtonType.Secondary:
    case ButtonType.Critical:
      shape = {
        maxHeight: size === 'M' ? 56 : 44,
        ...(size === 'M' ? a.py_lg : a.py_md),
        ...(size === 'M' ? a.px_xl : a.px_lg),
        ...(size === 'M' ? a.gap_sm : a.gap_xs),
        ...a.rounded_sm,
      }
      break
    case ButtonType.Text:
    case ButtonType.SecondaryText:
      shape = {
        maxHeight: size === 'M' ? 40 : 32,
        ...(size === 'M' ? a.py_sm : a.p_xs),
        ...(size === 'M' ? a.px_md : a.px_sm),
        ...(size === 'M' ? a.gap_xs : a.gap_2xs),
        ...a.rounded_sm,
      }
      break
    case ButtonType.Link:
      shape = size === 'M' ? a.gap_xs : a.gap_2xs
      break
    case ButtonType.Circle:
      shape = {
        width: 56,
        height: 56,
        ...a.align_center,
        ...a.rounded_full,
      }
      break
  }
  const font =
    fontOverride ??
    (type === ButtonType.Link
      ? size === 'M'
        ? a.link_1_lg
        : a.link_2_md
      : size === 'M'
        ? a.button_1_lg
        : a.button_2_md)

  const styles = StyleSheet.create({
    container: {
      backgroundColor,
      ...a.flex,
      ...a.flex_grow,
      ...a.flex_row,
      ...a.align_start,
      ...a.justify_center,
      ...shape,
      ...(rightIcon && a.flex_row_reverse),
      ...(type === ButtonType.Secondary && {
        borderWidth: 2,
        borderColor: foregroundColor,
      }),
    },
    containerPressed: {
      backgroundColor: backgroundColors.pressed,
      ...(type === ButtonType.Secondary && {
        borderColor: foregroundColors.pressed,
      }),
    },
    iconWrapper: {
      ...a.justify_center,
      height: font.lineHeight ?? 22,
      overflow: 'visible',
    },
    text: {
      ...a.flex_shrink,
      color: foregroundColor,
      ...font,
    },
    textPressed: {
      color: foregroundColors.pressed,
    },
  })

  const iconProps: IconProps = {
    size:
      type === ButtonType.Text || type === ButtonType.SecondaryText
        ? size === 'M'
          ? 24
          : 20
        : size === 'M'
          ? 28
          : 24,
    color: foregroundColor,
  }

  const iconPropsPressed: IconProps = {
    size: iconProps.size,
    color: foregroundColors.pressed,
  }

  return {styles, iconProps, iconPropsPressed} as const
}
