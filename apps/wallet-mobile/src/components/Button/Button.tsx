import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Image, StyleSheet, TextStyle, TouchableOpacity, TouchableOpacityProps, View, ViewStyle} from 'react-native'
import Animated, {FadeInDown, FadeOutDown, Layout} from 'react-native-reanimated'

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
  textStyles?: TextStyle
  isCopying?: boolean
  copiedTxt?: string
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
    textStyles,
    isCopying,
    copiedTxt,
    ...rest
  } = props

  const {styles} = useStyles()

  return (
    <TouchableOpacity onPress={onPress} style={[block && styles.block, containerStyle]} activeOpacity={0.5} {...rest}>
      {isCopying && (
        <Animated.View layout={Layout} entering={FadeInDown} exiting={FadeOutDown} style={styles.isCopying}>
          <Text style={styles.textCopy}>{copiedTxt}</Text>
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
  const theme = useTheme()

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
      fontWeight: '500',
      fontFamily: 'Rubik-Medium',
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
    isCopying: {
      position: 'absolute',
      backgroundColor: '#000',
      alignItems: 'center',
      justifyContent: 'center',
      top: -20,
      alignSelf: 'center',
      borderRadius: 4,
      zIndex: 10,
    },
    textCopy: {
      color: theme.theme.color['white-static'],
      textAlign: 'center',
      padding: 8,
      fontSize: 14,
      fontWeight: '500',
      fontFamily: 'Rubik-Medium',
    },
  })

  return {styles} as const
}
