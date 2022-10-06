import React from 'react'
import {Image, StyleSheet, TouchableOpacity, TouchableOpacityProps, View, ViewStyle} from 'react-native'

import {colors} from '../../theme'
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
  outlineShelley?: boolean
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
    outlineShelley,
    ...rest
  } = props

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
          ]}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const buttonOutline = {
  borderWidth: 1,
  borderColor: '#fff',
  backgroundColor: 'transparent',
}

const styles = StyleSheet.create({
  block: {
    flex: 1,
  },
  button: {
    backgroundColor: colors.buttonBackground,
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
    borderColor: colors.buttonBackground,
  },
  buttonOutlineShelley: {
    ...buttonOutline,
    borderColor: colors.buttonBackgroundBlue,
  },
  text: {
    color: 'white',
    textAlign: 'center',
    padding: 8,
    fontSize: 14,
    textTransform: 'uppercase',
  },
  textOutlineOnLight: {
    color: colors.buttonBackground,
  },
  textOutlineShelley: {
    color: colors.buttonBackgroundBlue,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  shelleyTheme: {
    backgroundColor: colors.buttonBackgroundBlue,
  },
  shelleyOutlineOnLight: {
    backgroundColor: 'transparent',
    borderColor: colors.buttonBackgroundBlue,
    borderWidth: 2,
  },
  textShelleyOutlineOnLight: {
    color: colors.buttonBackgroundBlue,
    fontWeight: '600',
  },
})
