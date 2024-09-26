import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, TextStyle, TouchableOpacity, TouchableOpacityProps, View, ViewStyle} from 'react-native'

import {Text} from '../Text'

export type ButtonProps = {
  title: string
  outlineOnLight?: boolean
  containerStyle?: ViewStyle
  block?: boolean
  shelleyTheme?: boolean
  warningTheme?: boolean
  outlineShelley?: boolean
  textStyles?: TextStyle
} & TouchableOpacityProps

export const Button = (props: ButtonProps) => {
  const {
    onPress,
    title,
    block,
    style,
    containerStyle,
    outlineOnLight,
    shelleyTheme,
    outlineShelley,
    textStyles,
    ...rest
  } = props

  const {styles} = useStyles()

  return (
    <TouchableOpacity onPress={onPress} style={[block && styles.block, containerStyle]} activeOpacity={0.5} {...rest}>
      <View
        style={[
          styles.button,
          outlineOnLight && styles.buttonOutlineOnLight,
          props.disabled && styles.buttonDisabled,
          outlineShelley && styles.buttonOutlineShelley,
          shelleyTheme && styles.shelleyTheme,
          outlineOnLight && shelleyTheme && styles.shelleyOutlineOnLight,
          style,
        ]}
      >
        <Text
          style={[
            styles.text,
            outlineOnLight && styles.textOutlineOnLight,
            outlineOnLight && shelleyTheme && styles.textShelleyOutlineOnLight,
            outlineShelley && styles.textOutlineShelley,
            props.disabled && !outlineOnLight && styles.buttonDisabledText,
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
  const {color, atoms} = useTheme()

  const buttonOutline = {
    borderWidth: 2,
    borderColor: color.gray_min,
    backgroundColor: 'transparent',
  }
  const styles = StyleSheet.create({
    block: {
      flex: 1,
    },
    button: {
      backgroundColor: color.secondary_500,
      minHeight: 48,
      maxHeight: 54,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonOutlineOnLight: {
      ...buttonOutline,
      borderColor: color.secondary_500,
    },
    buttonOutlineShelley: {
      ...buttonOutline,
      borderColor: color.el_primary_medium,
    },
    text: {
      color: color.white_static,
      ...atoms.body_2_md_medium,
      ...atoms.p_sm,
      textAlign: 'center',
      textTransform: 'uppercase',
    },
    textOutlineOnLight: {
      color: color.secondary_500,
    },
    textOutlineShelley: {
      color: color.text_primary_medium,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonDisabledText: {
      color: color.gray_min,
    },
    shelleyTheme: {
      backgroundColor: color.primary_500,
    },
    shelleyOutlineOnLight: {
      backgroundColor: 'transparent',
      borderColor: color.primary_600,
      borderWidth: 2,
    },
    textShelleyOutlineOnLight: {
      color: color.primary_600,
      fontWeight: '600',
    },
  })

  return {styles} as const
}
