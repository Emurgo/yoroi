import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Image, StyleSheet, TextStyle, TouchableOpacity, TouchableOpacityProps, View, ViewStyle} from 'react-native'
import Animated, {FadeInDown, FadeOutDown, Layout} from 'react-native-reanimated'

import {Text} from '../Text'

export type ButtonProps = TouchableOpacityProps & {
  title: string
  outline?: boolean
  outlineOnLight?: boolean
  containerStyle?: ViewStyle
  block?: boolean
  iconImage?: number
  withoutBackground?: boolean
  shelleyTheme?: boolean
  mainTheme?: boolean
  outlineShelley?: boolean
  textStyles?: TextStyle
  isCopying?: boolean
  copiedText?: string
}

export const Button = (props: ButtonProps) => {
  const {
    onPress,
    title,
    block,
    style,
    containerStyle,
    outline,
    outlineOnLight,
    iconImage,
    withoutBackground,
    shelleyTheme,
    mainTheme,
    outlineShelley,
    textStyles,
    isCopying,
    copiedText,
    ...rest
  } = props

  const {styles} = useStyles()

  return (
    <TouchableOpacity onPress={onPress} style={[block && styles.block, containerStyle]} activeOpacity={0.5} {...rest}>
      {isCopying && (
        <Animated.View layout={Layout} entering={FadeInDown} exiting={FadeOutDown} style={styles.isCopying}>
          <Text style={styles.copiedText}>{copiedText}</Text>
        </Animated.View>
      )}

      <View
        style={[
          styles.button,
          outline && styles.buttonOutline,
          outlineOnLight && styles.buttonOutlineOnLight,
          props.disabled && styles.buttonDisabled,
          withoutBackground && styles.buttonTransparent,
          outlineShelley && styles.buttonOutlineShelley,
          shelleyTheme && styles.shelleyTheme,
          mainTheme && styles.mainTheme,
          outlineOnLight && shelleyTheme && styles.shelleyOutlineOnLight,
          style,
        ]}
      >
        {iconImage != null && <Image source={iconImage} />}

        <Text
          style={[
            styles.text,
            outlineOnLight && styles.textOutlineOnLight,
            outlineOnLight && shelleyTheme && styles.textShelleyOutlineOnLight,
            outlineShelley && styles.textOutlineShelley,
            textStyles,
          ]}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color, typography, padding} = theme

  const buttonOutline = {
    borderWidth: 2,
    borderColor: color.gray.min,
    backgroundColor: 'transparent',
  }
  const styles = StyleSheet.create({
    block: {
      flex: 1,
    },
    button: {
      backgroundColor: color.secondary[500],
      minHeight: 48,
      maxHeight: 54,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonTransparent: {
      backgroundColor: 'transparent',
    },
    buttonOutline: {
      ...buttonOutline,
    },
    mainTheme: {
      backgroundColor: color.primary[500],
    },
    buttonOutlineOnLight: {
      ...buttonOutline,
      borderColor: color.secondary[500],
    },
    buttonOutlineShelley: {
      ...buttonOutline,
      borderColor: color.primary[600],
    },
    text: {
      color: color.gray.min,
      ...typography['body-2-m-medium'],
      ...padding['s'],
      textAlign: 'center',
      textTransform: 'uppercase',
    },
    textOutlineOnLight: {
      color: color.secondary[500],
    },
    textOutlineShelley: {
      color: color.primary[600],
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    shelleyTheme: {
      backgroundColor: color.primary[600],
    },
    shelleyOutlineOnLight: {
      backgroundColor: 'transparent',
      borderColor: color.primary[600],
      borderWidth: 2,
    },
    textShelleyOutlineOnLight: {
      color: color.primary[600],
      fontWeight: '600',
    },
    isCopying: {
      position: 'absolute',
      backgroundColor: color.gray.max,
      alignItems: 'center',
      justifyContent: 'center',
      top: -20,
      alignSelf: 'center',
      borderRadius: 4,
      zIndex: 10,
    },
    copiedText: {
      color: theme.color['white-static'],
      textAlign: 'center',
      ...padding['s'],
      ...typography['body-2-m-medium'],
    },
  })

  return {styles} as const
}
