import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Image, StyleSheet, TextStyle, TouchableOpacity, TouchableOpacityProps, View, ViewStyle} from 'react-native'

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
    ...rest
  } = props
  const styles = useStyles()

  return (
    <TouchableOpacity onPress={onPress} style={[block && styles.block, containerStyle]} activeOpacity={0.5} {...rest}>
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

const buttonOutline = {
  borderWidth: 2,
  borderColor: '#fff',
  backgroundColor: 'transparent',
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color} = theme
  const styles = StyleSheet.create({
    block: {
      flex: 1,
    },
    button: {
      backgroundColor: color.secondary[600],
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
    buttonOutlineOnLight: {
      ...buttonOutline,
      backgroundColor: color.secondary[600],
    },
    buttonOutlineShelley: {
      ...buttonOutline,
      borderColor: color.primary[600],
    },
    text: {
      color: color.gray.min,
      textAlign: 'center',
      padding: 8,
      fontSize: 14,
      fontWeight: '500',
      fontFamily: 'Rubik-Medium',
      textTransform: 'uppercase',
    },
    textOutlineOnLight: {
      color: color.secondary[600],
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
    mainTheme: {
      backgroundColor: color.primary[500],
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
  })

  return styles
}
