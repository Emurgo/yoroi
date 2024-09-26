import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, TextStyle, TouchableOpacity, TouchableOpacityProps, View, ViewStyle} from 'react-native'

import {Text} from '../Text'

export type ButtonProps = {
  title: string
  containerStyle?: ViewStyle
  block?: boolean
  shelleyTheme?: boolean
  textStyles?: TextStyle
} & TouchableOpacityProps

export const Button = (props: ButtonProps) => {
  const {onPress, title, block, style, containerStyle, shelleyTheme, textStyles, ...rest} = props

  const {styles} = useStyles()

  return (
    <TouchableOpacity onPress={onPress} style={[block && styles.block, containerStyle]} activeOpacity={0.5} {...rest}>
      <View
        style={[styles.button, props.disabled && styles.buttonDisabled, shelleyTheme && styles.shelleyTheme, style]}
      >
        <Text style={[styles.text, props.disabled && styles.buttonDisabledText, textStyles]}>{title}</Text>
      </View>
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()

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
    text: {
      color: color.white_static,
      ...atoms.body_2_md_medium,
      ...atoms.p_sm,
      textAlign: 'center',
      textTransform: 'uppercase',
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
  })

  return {styles} as const
}
